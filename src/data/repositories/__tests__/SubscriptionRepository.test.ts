import { SubscriptionRepository } from '../SubscriptionRepository';
import { supabase } from '../../../config/supabase';

// Mock Supabase
jest.mock('../../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock logger
jest.mock('../../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  },
}));

describe('SubscriptionRepository', () => {
  let repository: SubscriptionRepository;
  let mockQuery: any;

  beforeEach(() => {
    repository = new SubscriptionRepository();
    jest.clearAllMocks();

    mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    (supabase.from as jest.Mock).mockReturnValue(mockQuery);
  });

  describe('getUserSubscription', () => {
    it('should return active subscription when found', async () => {
      const mockSubscription = {
        id: 'sub-1',
        user_id: 'user-1',
        plan_type: 'monthly',
        status: 'active',
        price: 9.99,
        currency: 'USD',
        expires_at: '2025-12-31T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
      };

      mockQuery.single.mockResolvedValue({
        data: mockSubscription,
        error: null,
      });

      const result = await repository.getUserSubscription('user-1');

      expect(result).toBeTruthy();
      expect(result?.status).toBe('active');
    });

    it('should return null when no active subscription', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await repository.getUserSubscription('user-1');

      expect(result).toBeNull();
    });
  });

  describe('createSubscription', () => {
    it('should create subscription successfully', async () => {
      const mockSubscription = {
        id: 'sub-1',
        user_id: 'user-1',
        plan_type: 'monthly',
        status: 'active',
        price: 9.99,
        currency: 'USD',
        expires_at: '2025-02-01T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
      };

      mockQuery.insert.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockSubscription,
          error: null,
        }),
      });

      const result = await repository.createSubscription({
        userId: 'user-1',
        planType: 'monthly',
        price: 9.99,
        currency: 'USD',
        expiresAt: new Date('2025-02-01'),
      });

      expect(result).toBeTruthy();
      expect(result?.planType).toBe('monthly');
    });
  });

  describe('updateSubscription', () => {
    it('should update subscription successfully', async () => {
      const mockUpdatedSubscription = {
        id: 'sub-1',
        user_id: 'user-1',
        plan_type: 'yearly',
        status: 'active',
        price: 79.99,
        currency: 'USD',
        expires_at: '2026-01-01T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
      };

      mockQuery.update.mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUpdatedSubscription,
          error: null,
        }),
      });

      const result = await repository.updateSubscription('sub-1', {
        planType: 'yearly',
        status: 'active',
        expiresAt: new Date('2026-01-01'),
      });

      expect(result).toBeTruthy();
      expect(result?.planType).toBe('yearly');
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription successfully', async () => {
      mockQuery.update.mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      const result = await repository.cancelSubscription('sub-1');

      expect(result).toBe(true);
    });
  });
});
