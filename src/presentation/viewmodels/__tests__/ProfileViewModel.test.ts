import { ProfileViewModel } from '../ProfileViewModel';
import {
  SubscriptionRepository,
  Subscription,
} from '../../../data/repositories/SubscriptionRepository';

describe('ProfileViewModel', () => {
  let viewModel: ProfileViewModel;
  let mockSubscriptionRepository: jest.Mocked<SubscriptionRepository>;

  beforeEach(() => {
    mockSubscriptionRepository = {
      getUserSubscription: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionRepository>;

    viewModel = new ProfileViewModel(mockSubscriptionRepository);
  });

  describe('loadSubscription', () => {
    it('should load subscription and set isPremium to true for active subscription', async () => {
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
      expect(state.isPremium).toBe(true);
      expect(state.loadingSubscription).toBe(false);
    });

    it('should set isPremium to false for cancelled subscription', async () => {
      const mockSubscription: Subscription = {
        id: 'sub1',
        userId: 'user1',
        planType: 'monthly',
        status: 'cancelled',
        price: 9.99,
        currency: 'USD',
        startedAt: new Date(),
        expiresAt: new Date(),
        cancelledAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSubscriptionRepository.getUserSubscription.mockResolvedValue(mockSubscription);

      await viewModel.loadSubscription('user1');

      const state = viewModel.getState();
      expect(state.isPremium).toBe(false);
    });
  });

  describe('isPremium', () => {
    it('should return false when no subscription', () => {
      const state = viewModel.getState();
      expect(state.isPremium).toBe(false);
    });
  });
});
