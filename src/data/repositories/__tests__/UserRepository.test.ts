import { UserRepository } from '../UserRepository';
import { supabase } from '../../../config/supabase';
import { User } from '../../../domain/entities/User';

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
    warn: jest.fn(),
  },
}));

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockQuery: any;

  beforeEach(() => {
    repository = new UserRepository();
    jest.clearAllMocks();

    mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
    };

    (supabase.from as jest.Mock).mockReturnValue(mockQuery);
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        created_at: '2025-01-01T00:00:00Z',
      };

      mockQuery.single.mockResolvedValue({
        data: mockUser,
        error: null,
      });

      const result = await repository.getUserById('user-1');

      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('user-1');
      expect(result?.email).toBe('test@example.com');
      expect(supabase.from).toHaveBeenCalledWith('users');
    });

    it('should return null when user not found', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await repository.getUserById('non-existent');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await repository.getUserById('user-1');

      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user when found by email', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        full_name: 'Test User',
        avatar_url: null,
        created_at: '2025-01-01T00:00:00Z',
      };

      mockQuery.single.mockResolvedValue({
        data: mockUser,
        error: null,
      });

      const result = await repository.getUserByEmail('test@example.com');

      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe('test@example.com');
      expect(mockQuery.eq).toHaveBeenCalledWith('email', 'test@example.com');
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const mockUserData = {
        id: 'user-1',
        email: 'test@example.com',
        full_name: 'Test User',
        avatar_url: null,
        created_at: '2025-01-01T00:00:00Z',
      };

      mockQuery.insert.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUserData,
          error: null,
        }),
      });

      const result = await repository.createUser({
        id: 'user-1',
        email: 'test@example.com',
        fullName: 'Test User',
      });

      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe('test@example.com');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockUpdatedUser = {
        id: 'user-1',
        email: 'test@example.com',
        full_name: 'Updated Name',
        avatar_url: 'https://example.com/new-avatar.jpg',
        created_at: '2025-01-01T00:00:00Z',
      };

      mockQuery.update.mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUpdatedUser,
          error: null,
        }),
      });

      const result = await repository.updateUser('user-1', {
        fullName: 'Updated Name',
        avatarUrl: 'https://example.com/new-avatar.jpg',
      });

      expect(result).toBeInstanceOf(User);
      expect(result?.fullName).toBe('Updated Name');
    });
  });
});
