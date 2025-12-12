import {
  SubscriptionRepository,
  Subscription,
} from '../../data/repositories/SubscriptionRepository';
import { logger } from '../../utils/logger';

/**
 * Profile ViewModel
 * Manages state and business logic for Profile screen
 */
export class ProfileViewModel {
  private subscription: Subscription | null = null;
  private loadingSubscription = false;
  private error: string | null = null;

  constructor(private subscriptionRepository: SubscriptionRepository) {}

  /**
   * Load subscription status
   */
  async loadSubscription(userId: string): Promise<void> {
    try {
      this.loadingSubscription = true;
      this.error = null;

      const sub = await this.subscriptionRepository.getUserSubscription(userId);
      this.subscription = sub;
    } catch (error) {
      // Don't show error to user, just log it
      logger.error(
        'Failed to load subscription for profile',
        error instanceof Error ? error : new Error('Unknown error')
      );
    } finally {
      this.loadingSubscription = false;
    }
  }

  /**
   * Check if user has premium
   */
  isPremium(): boolean {
    return this.subscription?.status === 'active' || false;
  }

  /**
   * Get current state
   */
  getState() {
    return {
      subscription: this.subscription,
      loadingSubscription: this.loadingSubscription,
      error: this.error,
      isPremium: this.isPremium(),
    };
  }
}
