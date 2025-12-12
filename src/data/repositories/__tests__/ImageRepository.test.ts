import { ImageRepository } from '../ImageRepository';
import { Image } from '../../../domain/entities/Image';
import { supabase } from '../../../config/supabase';

jest.mock('../../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('ImageRepository', () => {
  let repository: ImageRepository;
  let mockSupabaseQuery: any;

  beforeEach(() => {
    repository = new ImageRepository();
    mockSupabaseQuery = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
    };
    (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);
  });

  describe('getAll', () => {
    it('should return images successfully', async () => {
      const mockData = [
        {
          id: '1',
          title: 'Test Image',
          image_url: 'https://example.com/image.jpg',
          category: 'Test',
          likes: 10,
          views: 5,
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockSupabaseQuery.order.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await repository.getAll({ limit: 10, offset: 0 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('1');
      expect(result.data[0].title).toBe('Test Image');
    });

    it('should handle errors', async () => {
      mockSupabaseQuery.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(repository.getAll({})).rejects.toThrow('Database error');
    });
  });

  describe('create', () => {
    it('should create image successfully', async () => {
      const image = new Image(
        '1',
        'Test Image',
        'https://example.com/image.jpg',
        'Test',
        0,
        0,
        'user1',
        null,
        null,
        null,
        null,
        null,
        null,
        new Date(),
        null
      );

      const mockData = {
        id: '1',
        title: 'Test Image',
        image_url: 'https://example.com/image.jpg',
        category: 'Test',
        likes: 0,
        views: 0,
        user_id: 'user1',
        created_at: new Date().toISOString(),
      };

      mockSupabaseQuery.insert.mockResolvedValue({
        data: [mockData],
        error: null,
      });

      const result = await repository.create(image);

      expect(result.id).toBe('1');
      expect(mockSupabaseQuery.insert).toHaveBeenCalled();
    });
  });

  describe('like', () => {
    it('should like image successfully', async () => {
      const mockData = {
        id: '1',
        likes: 11,
      };

      mockSupabaseQuery.update.mockResolvedValue({
        data: [mockData],
        error: null,
      });

      const result = await repository.like('1');

      expect(result?.likes).toBe(11);
    });
  });
});
