import { supabase } from '../../config/supabase';
import { logger } from '../../utils/logger';

export interface Subscription {
  id: string;
  userId: string;
  planType: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired';
  price: number;
  currency: string;
  startedAt: Date;
  expiresAt: Date;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionParams {
  userId: string;
  planType: 'monthly' | 'yearly';
  price: number;
  currency?: string;
  expiresAt?: Date;
}

export interface UpdateSubscriptionParams {
  planType?: 'monthly' | 'yearly';
  status?: 'active' | 'cancelled' | 'expired';
  expiresAt?: Date;
}

interface SubscriptionRecord {
  id: string;
  user_id: string;
  plan_type: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired';
  price: string | number;
  currency: string;
  started_at: string;
  expires_at: string;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Subscription Repository
 * Handles subscription data operations with Supabase
 */
export class SubscriptionRepository {
  /**
   * Get user's active subscription
   */
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No subscription found
        }
        throw error;
      }

      if (!data) {
        return null;
      }

      return this.mapToSubscription(data);
    } catch (error) {
      logger.error(
        'Failed to get user subscription',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          userId,
        }
      );
      throw error;
    }
  }

  /**
   * Get any subscription for user (active, cancelled, or expired)
   */
  async getUserSubscriptionAny(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No subscription found
        }
        throw error;
      }

      if (!data) {
        return null;
      }

      return this.mapToSubscription(data);
    } catch (error) {
      logger.error(
        'Failed to get user subscription (any)',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          userId,
        }
      );
      return null;
    }
  }

  /**
   * Create a new subscription or update existing one
   */
  async createSubscription(params: CreateSubscriptionParams): Promise<Subscription> {
    try {
      // Calculate expiration date based on plan type
      let expiresAt = params.expiresAt;
      if (!expiresAt) {
        expiresAt = new Date();
        if (params.planType === 'monthly') {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        }
      }

      // Check if user already has a subscription (any status)
      const existingSubscription = await this.getUserSubscriptionAny(params.userId);

      if (existingSubscription) {
        // Update existing subscription instead of creating new one
        logger.info('Updating existing subscription', {
          subscriptionId: existingSubscription.id,
          userId: params.userId,
        });

        return await this.updateSubscription(existingSubscription.id, {
          planType: params.planType,
          status: 'active',
          expiresAt,
        });
      }

      // Create new subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: params.userId,
          plan_type: params.planType,
          price: params.price,
          currency: params.currency || 'USD',
          status: 'active',
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        // Log detailed error information
        logger.error(
          'Failed to create subscription - Supabase error',
          error instanceof Error ? error : new Error('Unknown error'),
          {
            userId: params.userId,
            planType: params.planType,
            price: params.price,
            currency: params.currency,
            expiresAt: expiresAt.toISOString(),
            supabaseError: error,
            errorCode: (error as any)?.code,
            errorMessage: (error as any)?.message,
            errorDetails: (error as any)?.details,
            errorHint: (error as any)?.hint,
          }
        );
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from insert');
      }

      return this.mapToSubscription(data);
    } catch (error) {
      logger.error(
        'Failed to create subscription',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          userId: params.userId,
          planType: params.planType,
        }
      );
      throw error;
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId: string,
    params: UpdateSubscriptionParams
  ): Promise<Subscription> {
    try {
      const updateData: any = {};

      if (params.planType) {
        updateData.plan_type = params.planType;
        // Recalculate expiration date if plan type changes
        const currentSub = await this.getSubscriptionById(subscriptionId);
        if (currentSub) {
          const expiresAt = new Date();
          if (params.planType === 'monthly') {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
          } else {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          }
          updateData.expires_at = expiresAt.toISOString();
        }
      }

      if (params.status) {
        updateData.status = params.status;
        if (params.status === 'cancelled') {
          updateData.cancelled_at = new Date().toISOString();
        }
      }

      if (params.expiresAt) {
        updateData.expires_at = params.expiresAt.toISOString();
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from update');
      }

      return this.mapToSubscription(data);
    } catch (error) {
      logger.error(
        'Failed to update subscription',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          subscriptionId,
          params,
        }
      );
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    return this.updateSubscription(subscriptionId, {
      status: 'cancelled',
    });
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(subscriptionId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      if (!data) {
        return null;
      }

      return this.mapToSubscription(data);
    } catch (error) {
      logger.error(
        'Failed to get subscription by id',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          subscriptionId,
        }
      );
      throw error;
    }
  }

  /**
   * Map database record to Subscription entity
   */
  private mapToSubscription(record: SubscriptionRecord): Subscription {
    return {
      id: record.id,
      userId: record.user_id,
      planType: String(record.plan_type) as 'monthly' | 'yearly',
      status: record.status,
      price: parseFloat(String(record.price)),
      currency: record.currency,
      startedAt: new Date(record.started_at),
      expiresAt: new Date(record.expires_at),
      cancelledAt: record.cancelled_at ? new Date(record.cancelled_at) : null,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    };
  }
}
