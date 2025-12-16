import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

/**
 * Scene Service
 * Handles scene data from Supabase (deploy gerektirmiyor!)
 */

export interface Scene {
  id: string;
  name: string;
  description?: string;
  category: string;
  preview_url?: string;
  prompt_template?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class SceneService {
  /**
   * Get all scenes from Supabase
   * @param category Optional category filter
   * @param limit Maximum number of records to return
   * @param offset Number of records to skip (for pagination)
   */
  async getScenes(
    category?: string,
    limit: number = 200, // Increased to load all 150+ scenes
    offset: number = 0
  ): Promise<{ data: Scene[]; hasMore: boolean }> {
    try {
      let query = supabase
        .from('scenes')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error, count } = await query;

      if (error) {
        logger.error(
          'Supabase error in sceneService',
          error instanceof Error ? error : new Error('Unknown error')
        );
        return { data: [], hasMore: false };
      }

      const hasMore = count !== null && offset + (data?.length || 0) < count;

      logger.debug('Successfully fetched scenes from Supabase', {
        count: data?.length || 0,
        offset,
        hasMore,
      });

      return {
        data: (data || []) as Scene[],
        hasMore,
      };
    } catch (error) {
      logger.error(
        'Failed to fetch scenes from Supabase',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return { data: [], hasMore: false };
    }
  }

  /**
   * Get scene by ID from Supabase
   */
  async getSceneById(id: string): Promise<Scene | null> {
    try {
      const { data, error } = await supabase
        .from('scenes')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        logger.error(
          'Supabase error in sceneService',
          error instanceof Error ? error : new Error('Unknown error')
        );
        return null;
      }

      return data as Scene;
    } catch (error) {
      logger.error(
        'Failed to fetch scene from Supabase',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return null;
    }
  }

  /**
   * Get scenes by category from Supabase
   * @param category Category to filter by
   * @param limit Maximum number of records to return
   * @param offset Number of records to skip (for pagination)
   */
  async getScenesByCategory(
    category: string,
    limit: number = 50, // Increased to cover all scenes per category (15 scenes per category)
    offset: number = 0
  ): Promise<{ data: Scene[]; hasMore: boolean }> {
    try {
      const { data, error, count } = await supabase
        .from('scenes')
        .select('*', { count: 'exact' })
        .eq('category', category)
        .eq('is_active', true)
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error(
          'Supabase error in sceneService',
          error instanceof Error ? error : new Error('Unknown error')
        );
        return { data: [], hasMore: false };
      }

      const hasMore = count !== null && offset + (data?.length || 0) < count;

      logger.debug('Successfully fetched scenes by category from Supabase', {
        category,
        count: data?.length || 0,
        offset,
        hasMore,
      });

      return {
        data: (data || []) as Scene[],
        hasMore,
      };
    } catch (error) {
      logger.error(
        'Failed to fetch scenes by category from Supabase',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return { data: [], hasMore: false };
    }
  }

  /**
   * Get scene categories from Neon DB
   */
  async getSceneCategories(): Promise<string[]> {
    try {
      const scenesResult = await this.getScenes();
      const categories = [...new Set(scenesResult.data.map((scene: Scene) => scene.category))];
      return categories.sort();
    } catch (error) {
      logger.error(
        'Failed to fetch categories from Supabase',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return [];
    }
  }
}

export const sceneService = new SceneService();
