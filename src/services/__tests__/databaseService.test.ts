import { databaseService } from '../databaseService';
import { supabase } from '../../config/supabase';

// Mock Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('DatabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getImages', () => {
    it('should fetch images with pagination', async () => {
      const mockData = [
        { id: '1', title: 'Image 1', image_url: 'url1' },
        { id: '2', title: 'Image 2', image_url: 'url2' },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);
      mockQuery.range.mockResolvedValue({
        data: mockData,
        error: null,
        count: 10,
      });

      const result = await databaseService.getImages(undefined, 10, 0);

      expect(result.data).toEqual(mockData);
      expect(result.hasMore).toBe(true);
      expect(mockQuery.range).toHaveBeenCalledWith(0, 9);
    });

    it('should handle errors gracefully', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);
      mockQuery.range.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
        count: null,
      });

      const result = await databaseService.getImages();

      expect(result.data).toEqual([]);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('getImageById', () => {
    it('should fetch single image by id', async () => {
      const mockImage = { id: '1', title: 'Image 1', image_url: 'url1' };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({
        data: mockImage,
        error: null,
      });

      const result = await databaseService.getImageById('1');

      expect(result).toEqual(mockImage);
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
    });

    it('should return null when image not found', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await databaseService.getImageById('999');

      expect(result).toBeNull();
    });
  });

  describe('createImage', () => {
    it('should create new image record', async () => {
      const newImage = {
        title: 'New Image',
        image_url: 'url',
        category: 'test',
      };

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({
        data: { ...newImage, id: '1', likes: 0, views: 0 },
        error: null,
      });

      const result = await databaseService.createImage(newImage);

      expect(result).toBeTruthy();
      expect(result?.title).toBe('New Image');
      expect(mockQuery.insert).toHaveBeenCalled();
    });
  });
});
