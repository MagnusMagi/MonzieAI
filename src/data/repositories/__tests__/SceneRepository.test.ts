import { SceneRepository } from '../SceneRepository';
import { supabase } from '../../../config/supabase';
import { Scene } from '../../../domain/entities/Scene';

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

describe('SceneRepository', () => {
  let repository: SceneRepository;
  let mockQuery: any;

  beforeEach(() => {
    repository = new SceneRepository();
    jest.clearAllMocks();

    mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn(),
      update: jest.fn().mockReturnThis(),
    };

    (supabase.from as jest.Mock).mockReturnValue(mockQuery);
  });

  describe('getScenes', () => {
    it('should fetch scenes with pagination', async () => {
      const mockScenes = [
        {
          id: 'scene-1',
          name: 'Scene 1',
          description: 'Description 1',
          category: 'portrait',
          prompt_template: 'Template 1',
          is_active: true,
          likes: 10,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ];

      mockQuery.range.mockResolvedValue({
        data: mockScenes,
        error: null,
        count: 1,
      });

      const result = await repository.getScenes({ limit: 20, offset: 0 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(Scene);
      expect(result.hasMore).toBe(false);
      expect(supabase.from).toHaveBeenCalledWith('scenes');
    });

    it('should filter by category', async () => {
      mockQuery.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await repository.getScenes({ category: 'portrait', limit: 20, offset: 0 });

      expect(mockQuery.eq).toHaveBeenCalledWith('category', 'portrait');
    });

    it('should handle errors', async () => {
      mockQuery.range.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
        count: null,
      });

      await expect(repository.getScenes({})).rejects.toThrow();
    });
  });

  describe('getSceneById', () => {
    it('should return scene when found', async () => {
      const mockScene = {
        id: 'scene-1',
        name: 'Scene 1',
        description: 'Description 1',
        category: 'portrait',
        prompt_template: 'Template 1',
        is_active: true,
        likes: 10,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      mockQuery.single.mockResolvedValue({
        data: mockScene,
        error: null,
      });

      const result = await repository.getSceneById('scene-1');

      expect(result).toBeInstanceOf(Scene);
      expect(result?.id).toBe('scene-1');
    });

    it('should return null when scene not found', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await repository.getSceneById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('incrementLike', () => {
    it('should increment likes count', async () => {
      mockQuery.single.mockResolvedValue({
        data: { likes: 10 },
        error: null,
      });

      mockQuery.update.mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      const result = await repository.incrementLike('scene-1');

      expect(result).toBe(true);
    });

    it('should return false when scene not found', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await repository.incrementLike('non-existent');

      expect(result).toBe(false);
    });
  });
});
