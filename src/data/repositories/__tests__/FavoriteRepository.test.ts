import { FavoriteRepository } from '../FavoriteRepository';
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

describe('FavoriteRepository', () => {
  let repository: FavoriteRepository;
  let mockQuery: any;

  beforeEach(() => {
    repository = new FavoriteRepository();
    jest.clearAllMocks();

    mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    (supabase.from as jest.Mock).mockReturnValue(mockQuery);
  });

  describe('addFavorite', () => {
    it('should add favorite successfully', async () => {
      const mockFavorite = {
        id: 'fav-1',
        user_id: 'user-1',
        image_id: 'image-1',
        created_at: '2025-01-01T00:00:00Z',
      };

      mockQuery.insert.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockFavorite,
          error: null,
        }),
      });

      const result = await repository.addFavorite('user-1', 'image-1');

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('favorites');
    });

    it('should handle errors', async () => {
      mockQuery.insert.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Error' },
        }),
      });

      const result = await repository.addFavorite('user-1', 'image-1');

      expect(result).toBe(false);
    });
  });

  describe('removeFavorite', () => {
    it('should remove favorite successfully', async () => {
      mockQuery.delete.mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      const result = await repository.removeFavorite('user-1', 'image-1');

      expect(result).toBe(true);
    });
  });

  describe('isFavorited', () => {
    it('should return true when favorite exists', async () => {
      mockQuery.single.mockResolvedValue({
        data: { id: 'fav-1' },
        error: null,
      });

      const result = await repository.isFavorited('user-1', 'image-1');

      expect(result).toBe(true);
    });

    it('should return false when favorite does not exist', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await repository.isFavorited('user-1', 'image-1');

      expect(result).toBe(false);
    });
  });

  describe('getUserFavoriteImageIds', () => {
    it('should fetch user favorite image IDs', async () => {
      const mockFavorites = [
        {
          image_id: 'image-1',
        },
        {
          image_id: 'image-2',
        },
      ];

      mockQuery.order.mockResolvedValue({
        data: mockFavorites,
        error: null,
      });

      const result = await repository.getUserFavoriteImageIds('user-1');

      expect(result).toHaveLength(2);
      expect(result).toEqual(['image-1', 'image-2']);
    });

    it('should return empty array on error', async () => {
      mockQuery.order.mockResolvedValue({
        data: null,
        error: { message: 'Error' },
      });

      const result = await repository.getUserFavoriteImageIds('user-1');

      expect(result).toEqual([]);
    });
  });
});
