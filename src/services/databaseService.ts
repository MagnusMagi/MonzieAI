import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

/**
 * Database Service
 * Provides high-level database operations via Supabase (deploy gerektirmiyor!)
 */

export interface ImageRecord {
  id: string;
  title: string;
  image_url: string;
  category: string;
  likes: number;
  views: number;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  scene_id?: string;
  scene_name?: string;
  prompt?: string;
  seed?: number;
  description?: string;
  features?: string[];
}

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

class DatabaseService {
  /**
   * Get all images with optional filtering via Supabase
   */

  /**
   * Get all images with optional filtering via Supabase
   * @param category Optional category filter
   * @param limit Maximum number of records to return
   * @param offset Number of records to skip (for pagination)
   */
  async getImages(
    category?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ data: ImageRecord[]; hasMore: boolean }> {
    try {
      let query = supabase
        .from('images')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error, count } = await query;

      if (error) {
        logger.error(
          'Supabase error in databaseService',
          error instanceof Error ? error : new Error('Unknown error')
        );
        return { data: [], hasMore: false };
      }

      const hasMore = count !== null && offset + (data?.length || 0) < count;

      return {
        data: (data || []) as ImageRecord[],
        hasMore,
      };
    } catch (error) {
      logger.error(
        'Failed to fetch images',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return { data: [], hasMore: false };
    }
  }

  /**
   * Get trending images via Supabase
   * @param limit Maximum number of records to return
   * @param offset Number of records to skip (for pagination)
   */
  async getTrendingImages(
    limit: number = 10,
    offset: number = 0
  ): Promise<{ data: ImageRecord[]; hasMore: boolean }> {
    try {
      const { data, error, count } = await supabase
        .from('images')
        .select('*', { count: 'exact' })
        .order('likes', { ascending: false })
        .order('views', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error(
          'Supabase error in databaseService',
          error instanceof Error ? error : new Error('Unknown error')
        );
        return { data: [], hasMore: false };
      }

      const hasMore = count !== null && offset + (data?.length || 0) < count;

      return {
        data: (data || []) as ImageRecord[],
        hasMore,
      };
    } catch (error) {
      logger.error(
        'Failed to fetch trending images',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return { data: [], hasMore: false };
    }
  }

  /**
   * Get images by category
   * @param category Category to filter by
   * @param limit Maximum number of records to return
   * @param offset Number of records to skip (for pagination)
   */
  async getImagesByCategory(
    category: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ data: ImageRecord[]; hasMore: boolean }> {
    return this.getImages(category, limit, offset);
  }

  /**
   * Get single image by ID via Supabase
   */
  async getImageById(id: string): Promise<ImageRecord | null> {
    try {
      const { data, error } = await supabase.from('images').select('*').eq('id', id).single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error(
          'Supabase error in databaseService',
          error instanceof Error ? error : new Error('Unknown error')
        );
        return null;
      }

      return data as ImageRecord;
    } catch (error) {
      logger.error(
        'Failed to fetch image',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return null;
    }
  }

  /**
   * Create a new image record via Supabase
   */
  async createImage(
    image: Omit<ImageRecord, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ImageRecord | null> {
    try {
      const { data, error } = await supabase
        .from('images')
        .insert({
          ...image,
          likes: image.likes || 0,
          views: image.views || 0,
        })
        .select()
        .single();

      if (error) {
        logger.error(
          'Supabase error in databaseService',
          error instanceof Error ? error : new Error('Unknown error')
        );
        return null;
      }

      logger.info('Image saved to Supabase', { imageId: data?.id });
      return data as ImageRecord;
    } catch (error) {
      logger.error(
        'Failed to create image',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return null;
    }
  }

  /**
   * Update image likes via Supabase
   */
  async updateImageLikes(id: string, increment: number = 1): Promise<boolean> {
    try {
      // Önce mevcut likes'ı al
      const { data: currentImage } = await supabase
        .from('images')
        .select('likes')
        .eq('id', id)
        .single();

      if (!currentImage) {
        return false;
      }

      // Likes'ı güncelle
      const { error } = await supabase
        .from('images')
        .update({ likes: (currentImage.likes || 0) + increment })
        .eq('id', id);

      return !error;
    } catch (error) {
      logger.error(
        'Failed to update image likes',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return false;
    }
  }

  /**
   * Search images by title via Supabase
   */
  async searchImages(query: string, limit: number = 20): Promise<ImageRecord[]> {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .ilike('title', `%${query}%`)
        .limit(limit);

      if (error) {
        logger.error(
          'Supabase error in databaseService',
          error instanceof Error ? error : new Error('Unknown error')
        );
        return [];
      }

      return (data || []) as ImageRecord[];
    } catch (error) {
      logger.error(
        'Failed to search images',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return [];
    }
  }

  /**
   * Get images by user ID via Supabase
   * @param userId User ID to filter by
   * @param limit Maximum number of records to return
   * @param offset Number of records to skip (for pagination)
   */
  async getUserImages(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ data: ImageRecord[]; hasMore: boolean }> {
    try {
      const { data, error, count } = await supabase
        .from('images')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error(
          'Supabase error in databaseService',
          error instanceof Error ? error : new Error('Unknown error')
        );
        return { data: [], hasMore: false };
      }

      const hasMore = count !== null && offset + (data?.length || 0) < count;

      return {
        data: (data || []) as ImageRecord[],
        hasMore,
      };
    } catch (error) {
      logger.error(
        'Failed to fetch user images',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return { data: [], hasMore: false };
    }
  }
}

export const databaseService = new DatabaseService();
