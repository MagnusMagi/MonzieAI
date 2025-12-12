import {
  SubscriptionRepository,
  Subscription,
} from '../../data/repositories/SubscriptionRepository';
import { logger } from '../../utils/logger';

/**
 * Subscription ViewModel
 * Manages state and business logic for Subscription screen
 */
export class SubscriptionViewModel {
  private subscription: Subscription | null = null;
  private loading = false;
  private error: string | null = null;

  constructor(private subscriptionRepository: SubscriptionRepository) {}

  /**
   * Load user subscription
   */
  async loadSubscription(userId: string): Promise<void> {
    try {
      this.loading = true;
      this.error = null;

      const sub = await this.subscriptionRepository.getUserSubscription(userId);
      this.subscription = sub;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to load subscription';
      logger.error(
        'Failed to load subscription',
        error instanceof Error ? error : new Error('Unknown error')
      );
    } finally {
      this.loading = false;
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      subscription: this.subscription,
      loading: this.loading,
      error: this.error,
      isPremium: this.subscription?.status === 'active',
    };
  }
}
