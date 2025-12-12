import { Image } from '../../domain/entities/Image';
import { IImageRepository } from '../../domain/repositories/IImageRepository';
import { supabase } from '../../config/supabase';
import { logger } from '../../utils/logger';

/**
 * Image Repository Implementation
 * Data access layer for images using Supabase
 */
export class ImageRepository implements IImageRepository {
  async getImages(params: {
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Image[]; hasMore: boolean }> {
    try {
      let query = supabase
        .from('images')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
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
        data: (data || []).map(record => Image.fromRecord(record)),
        hasMore,
      };
    } catch (error) {
      logger.error(
        'Failed to fetch images',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          category: params.category,
          limit: params.limit,
          offset: params.offset,
        }
      );
      if (error instanceof Error) {
        throw new Error(`Failed to fetch images: ${error.message}`);
      }
      throw new Error('Failed to fetch images: Unknown error');
    }
  }

  async getImageById(id: string): Promise<Image | null> {
    try {
      const { data, error } = await supabase.from('images').select('*').eq('id', id).single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data ? Image.fromRecord(data) : null;
    } catch (error) {
      logger.error(
        'Failed to fetch image by id',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          imageId: id,
        }
      );
      if (error instanceof Error) {
        throw new Error(`Failed to fetch image: ${error.message}`);
      }
      throw new Error('Failed to fetch image: Unknown error');
    }
  }

  async getTrendingImages(params: {
    limit?: number;
    offset?: number;
  }): Promise<{ data: Image[]; hasMore: boolean }> {
    try {
      const { data, error, count } = await supabase
        .from('images')
        .select('*', { count: 'exact' })
        .order('likes', { ascending: false })
        .order('views', { ascending: false })
        .range(params.offset || 0, (params.offset || 0) + (params.limit || 10) - 1);

      if (error) {
        throw error;
      }

      const hasMore = count !== null && (params.offset || 0) + (data?.length || 0) < count;

      return {
        data: (data || []).map(record => Image.fromRecord(record)),
        hasMore,
      };
    } catch (error) {
      logger.error(
        'Failed to fetch trending images',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          limit: params.limit,
          offset: params.offset,
        }
      );
      if (error instanceof Error) {
        throw new Error(`Failed to fetch trending images: ${error.message}`);
      }
      throw new Error('Failed to fetch trending images: Unknown error');
    }
  }

  async getImagesByCategory(
    category: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ data: Image[]; hasMore: boolean }> {
    return this.getImages({ category, limit, offset });
  }

  async getUserImages(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ data: Image[]; hasMore: boolean }> {
    try {
      logger.debug('Fetching user images from Supabase', { userId, limit, offset });
      const { data, error, count } = await supabase
        .from('images')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error('Supabase error fetching user images', error instanceof Error ? error : new Error('Unknown error'), {
          userId,
          errorCode: (error as any)?.code,
          errorMessage: (error as any)?.message,
          errorDetails: (error as any)?.details,
        });
        throw error;
      }

      logger.debug('User images fetched successfully', {
        userId,
        count: data?.length || 0,
        totalCount: count,
        offset,
      });

      const hasMore = count !== null && offset + (data?.length || 0) < count;

      return {
        data: (data || []).map(record => Image.fromRecord(record)),
        hasMore,
      };
    } catch (error) {
      logger.error(
        'Failed to fetch user images',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          userId,
          limit,
          offset,
        }
      );
      if (error instanceof Error) {
        throw new Error(`Failed to fetch user images: ${error.message}`);
      }
      throw new Error('Failed to fetch user images: Unknown error');
    }
  }

  async searchImages(query: string, limit: number = 20): Promise<Image[]> {
    try {
      // Use PostgreSQL full-text search with pg_trgm for better results
      // Fallback to ilike if full-text search fails
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) {
        // Fallback to simple ilike search
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('images')
          .select('*')
          .ilike('title', `%${query}%`)
          .limit(limit);

        if (fallbackError) {
          throw fallbackError;
        }

        return (fallbackData || []).map(record => Image.fromRecord(record));
      }

      return (data || []).map((record: any) => Image.fromRecord(record));
    } catch (error) {
      logger.error(
        'Failed to search images',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          query,
          limit,
        }
      );
      if (error instanceof Error) {
        throw new Error(`Failed to search images: ${error.message}`);
      }
      throw new Error('Failed to search images: Unknown error');
    }
  }

  /**
   * Full-text search using PostgreSQL trigram similarity
   * More accurate than simple ilike search
   */
  async fullTextSearch(query: string, limit: number = 20): Promise<Image[]> {
    try {
      // Use RPC function for full-text search with trigram similarity
      // First, try using the similarity operator if available
      const { data, error } = await supabase.rpc('search_images_fulltext', {
        search_query: query,
        result_limit: limit,
      });

      if (error) {
        // If RPC doesn't exist, fallback to regular search
        logger.warn('Full-text search RPC not available, using fallback', {
          query,
          error: error.message,
        });
        return this.searchImages(query, limit);
      }

      return (data || []).map((record: any) => Image.fromRecord(record));
    } catch (error) {
      logger.error(
        'Failed to full-text search images',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          query,
          limit,
        }
      );
      // Fallback to regular search
      return this.searchImages(query, limit);
    }
  }

  async createImage(image: {
    title: string;
    imageUrl: string;
    category: string;
    description?: string;
    userId?: string;
    sceneId?: string;
    sceneName?: string;
    prompt?: string;
    seed?: number;
    features?: string[];
  }): Promise<Image> {
    try {
      const { data, error } = await supabase
        .from('images')
        .insert({
          title: image.title,
          image_url: image.imageUrl,
          category: image.category,
          description: image.description,
          user_id: image.userId,
          scene_id: image.sceneId,
          scene_name: image.sceneName,
          prompt: image.prompt,
          seed: image.seed,
          features: image.features,
          likes: 0,
          views: 0,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from insert');
      }

      return Image.fromRecord(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as any)?.message || (error as any)?.details || 'Unknown error';
      const errorObj = error instanceof Error ? error : new Error(errorMessage);

      logger.error('Failed to create image', errorObj, {
        title: image.title,
        category: image.category,
        userId: image.userId,
        supabaseError: error,
        errorDetails: (error as any)?.details,
        errorCode: (error as any)?.code,
        errorHint: (error as any)?.hint,
      });
      throw new Error(`Failed to create image: ${errorMessage}`);
    }
  }

  async updateImageLikes(id: string, increment: number): Promise<boolean> {
    try {
      const { data: currentImage } = await supabase
        .from('images')
        .select('likes')
        .eq('id', id)
        .single();

      if (!currentImage) {
        return false;
      }

      const { error } = await supabase
        .from('images')
        .update({ likes: (currentImage.likes || 0) + increment })
        .eq('id', id);

      return !error;
    } catch (error) {
      logger.error(
        'Failed to update image likes',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          imageId: id,
          increment,
        }
      );
      return false;
    }
  }

  async incrementViewCount(id: string): Promise<boolean> {
    try {
      const { data: currentImage } = await supabase
        .from('images')
        .select('views')
        .eq('id', id)
        .single();

      if (!currentImage) {
        return false;
      }

      const { error } = await supabase
        .from('images')
        .update({ views: (currentImage.views || 0) + 1 })
        .eq('id', id);

      if (error) {
        logger.error(
          'Failed to increment view count',
          error instanceof Error ? error : new Error('Unknown error'),
          {
            imageId: id,
          }
        );
        return false;
      }

      logger.info('View count incremented', { imageId: id });
      return true;
    } catch (error) {
      logger.error(
        'Failed to increment view count',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          imageId: id,
        }
      );
      return false;
    }
  }
}
