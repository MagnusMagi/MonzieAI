import { Scene } from '../../domain/entities/Scene';
import { ISceneRepository } from '../../domain/repositories/ISceneRepository';
import { supabase } from '../../config/supabase';
import { logger } from '../../utils/logger';

/**
 * Scene Repository Implementation
 * Data access layer for scenes using Supabase
 */
export class SceneRepository implements ISceneRepository {
  async getScenes(params: {
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Scene[]; hasMore: boolean }> {
    try {
      logger.debug('Fetching scenes from Supabase', {
        category: params.category,
        limit: params.limit,
        offset: params.offset,
      });

      let query = supabase
        .from('scenes')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('name', { ascending: true })
        .range(params.offset || 0, (params.offset || 0) + (params.limit || 50) - 1);

      if (params.category) {
        query = query.eq('category', params.category);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const hasMore = count !== null && (params.offset || 0) + (data?.length || 0) < count;

      return {
        data: (data || []).map(record => Scene.fromRecord(record)),
        hasMore,
      };
    } catch (error) {
      // Supabase errors are not Error instances, so we need to handle them differently
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as any)?.message || (error as any)?.details || 'Unknown error';
      const errorObj = error instanceof Error ? error : new Error(errorMessage);

      logger.error('Failed to fetch scenes', errorObj, {
        category: params.category,
        limit: params.limit,
        offset: params.offset,
        supabaseError: error,
      });

      throw new Error(`Failed to fetch scenes: ${errorMessage}`);
    }
  }

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
          return null;
        }
        throw error;
      }

      return data ? Scene.fromRecord(data) : null;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as any)?.message || (error as any)?.details || 'Unknown error';
      const errorObj = error instanceof Error ? error : new Error(errorMessage);

      logger.error('Failed to fetch scene by id', errorObj, {
        sceneId: id,
        supabaseError: error,
      });

      throw new Error(`Failed to fetch scene: ${errorMessage}`);
    }
  }

  async getScenesByCategory(
    category: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ data: Scene[]; hasMore: boolean }> {
    return this.getScenes({ category, limit, offset });
  }

  async getSceneCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('scenes')
        .select('category')
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      const categories = [...new Set((data || []).map(item => item.category))];
      return categories.sort();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as any)?.message || (error as any)?.details || 'Unknown error';
      const errorObj = error instanceof Error ? error : new Error(errorMessage);

      logger.error('Failed to fetch scene categories', errorObj, {
        supabaseError: error,
      });

      throw new Error(`Failed to fetch scene categories: ${errorMessage}`);
    }
  }

  async incrementLike(id: string): Promise<boolean> {
    try {
      const { data: currentScene } = await supabase
        .from('scenes')
        .select('likes')
        .eq('id', id)
        .single();

      if (!currentScene) {
        logger.warn('Scene not found for like increment', { sceneId: id });
        return false;
      }

      const currentLikes = currentScene.likes || 0;
      const { error } = await supabase
        .from('scenes')
        .update({ likes: currentLikes + 1 })
        .eq('id', id);

      if (error) {
        logger.error(
          'Failed to increment scene like',
          error instanceof Error ? error : new Error('Unknown error'),
          {
            sceneId: id,
          }
        );
        return false;
      }

      logger.info('Scene like incremented', { sceneId: id });
      return true;
    } catch (error) {
      logger.error(
        'Failed to increment scene like',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          sceneId: id,
        }
      );
      return false;
    }
  }
}
