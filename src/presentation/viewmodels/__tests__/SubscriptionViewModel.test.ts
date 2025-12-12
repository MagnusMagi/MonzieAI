import { SubscriptionViewModel } from '../SubscriptionViewModel';
import {
  SubscriptionRepository,
  Subscription,
} from '../../../data/repositories/SubscriptionRepository';

describe('SubscriptionViewModel', () => {
  let viewModel: SubscriptionViewModel;
  let mockSubscriptionRepository: jest.Mocked<SubscriptionRepository>;

  beforeEach(() => {
    mockSubscriptionRepository = {
      getUserSubscription: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionRepository>;

    viewModel = new SubscriptionViewModel(mockSubscriptionRepository);
  });

  describe('loadSubscription', () => {
    it('should load subscription successfully', async () => {
      const mockSubscription: Subscription = {
        id: 'sub1',
        userId: 'user1',
        planType: 'monthly',
        status: 'active',
        price: 9.99,
        currency: 'USD',
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelledAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSubscriptionRepository.getUserSubscription.mockResolvedValue(mockSubscription);

      await viewModel.loadSubscription('user1');

      const state = viewModel.getState();
      expect(state.subscription).toEqual(mockSubscription);
      expect(state.loading).toBe(false);
      expect(state.isPremium).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle no subscription found', async () => {
      mockSubscriptionRepository.getUserSubscription.mockResolvedValue(null);

      await viewModel.loadSubscription('user1');

      const state = viewModel.getState();
      expect(state.subscription).toBeNull();
      expect(state.isPremium).toBe(false);
      expect(state.loading).toBe(false);
    });

    it('should handle errors', async () => {
      mockSubscriptionRepository.getUserSubscription.mockRejectedValue(new Error('Failed to load'));

      await viewModel.loadSubscription('user1');

      const state = viewModel.getState();
      expect(state.error).toBe('Failed to load');
      expect(state.loading).toBe(false);
    });
  });
});
