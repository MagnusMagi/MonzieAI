import { sceneService } from '../sceneService';
import { supabase } from '../../config/supabase';

// Mock Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('SceneService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getScenes', () => {
    it('should fetch scenes with pagination', async () => {
      const mockScenes = [
        { id: '1', name: 'Scene 1', category: 'Realistic', is_active: true },
        { id: '2', name: 'Scene 2', category: 'Realistic', is_active: true },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);
      mockQuery.range.mockResolvedValue({
        data: mockScenes,
        error: null,
        count: 5,
      });

      const result = await sceneService.getScenes(undefined, 10, 0);

      expect(result.data).toEqual(mockScenes);
      expect(result.hasMore).toBe(true);
      expect(mockQuery.eq).toHaveBeenCalledWith('is_active', true);
    });

    it('should filter by category', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);
      mockQuery.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await sceneService.getScenes('Realistic', 10, 0);

      expect(mockQuery.eq).toHaveBeenCalledWith('category', 'Realistic');
    });
  });

  describe('getSceneById', () => {
    it('should fetch single scene by id', async () => {
      const mockScene = {
        id: '1',
        name: 'Scene 1',
        category: 'Realistic',
        is_active: true,
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({
        data: mockScene,
        error: null,
      });

      const result = await sceneService.getSceneById('1');

      expect(result).toEqual(mockScene);
    });

    it('should return null when scene not found', async () => {
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

      const result = await sceneService.getSceneById('999');

      expect(result).toBeNull();
    });
  });

  describe('getSceneCategories', () => {
    it('should return unique sorted categories', async () => {
      const mockScenes = [
        { id: '1', name: 'Scene 1', category: 'Realistic' },
        { id: '2', name: 'Scene 2', category: 'Fantasy' },
        { id: '3', name: 'Scene 3', category: 'Realistic' },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);
      mockQuery.range.mockResolvedValue({
        data: mockScenes,
        error: null,
        count: 3,
      });

      const categories = await sceneService.getSceneCategories();

      expect(categories).toEqual(['Fantasy', 'Realistic']);
    });
  });
});
