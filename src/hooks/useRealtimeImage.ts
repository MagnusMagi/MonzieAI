import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { Image } from '../domain/entities/Image';

/**
 * Real-time subscription hook for image updates
 * Listens for changes to image likes, views, and other fields
 */
export function useRealtimeImage(imageId: string | null) {
  const [image, setImage] = useState<Image | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!imageId) {
      return;
    }

    // Initial fetch
    const fetchImage = async () => {
      try {
        const { data, error } = await supabase
          .from('images')
          .select('*')
          .eq('id', imageId)
          .single();

        if (error) {
          logger.error(
            'Failed to fetch image for realtime',
            error instanceof Error ? error : new Error('Unknown error'),
            { imageId }
          );
          return;
        }

        if (data) {
          setImage(Image.fromRecord(data));
        }
      } catch (error) {
        logger.error(
          'Error fetching image for realtime',
          error instanceof Error ? error : new Error('Unknown error'),
          { imageId }
        );
      }
    };

    fetchImage();

    // Set up real-time subscription
    const channel = supabase
      .channel(`image:${imageId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'images',
          filter: `id=eq.${imageId}`,
        },
        payload => {
          logger.debug('Image updated via realtime', { imageId, payload });
          if (payload.new) {
            setImage(Image.fromRecord(payload.new as any));
          }
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
          logger.info('Subscribed to image realtime updates', { imageId });
        } else if (status === 'CHANNEL_ERROR') {
          logger.error('Failed to subscribe to image realtime', new Error('Channel error'), {
            imageId,
          });
        }
      });

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
      setIsSubscribed(false);
      logger.debug('Unsubscribed from image realtime updates', { imageId });
    };
  }, [imageId]);

  return { image, isSubscribed };
}

/**
 * Real-time subscription hook for multiple images (e.g., feed)
 * Listens for new images, updates, and deletions
 */
export function useRealtimeImages(params?: { category?: string; userId?: string }) {
  const [images, setImages] = useState<Image[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Don't do initial fetch - let the component handle initial loading
    // This hook is only for realtime updates to avoid duplicates

    // Build filter for subscription
    let filter = '';
    if (params?.category) {
      filter = `category=eq.${params.category}`;
    } else if (params?.userId) {
      filter = `user_id=eq.${params.userId}`;
    }

    // Set up real-time subscription
    const channelName = `images:${params?.category || params?.userId || 'all'}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'images',
          ...(filter ? { filter } : {}),
        },
        payload => {
          logger.debug('Images changed via realtime', { payload, params });

          if (payload.eventType === 'INSERT' && payload.new) {
            setImages(prev => [Image.fromRecord(payload.new as any), ...prev]);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setImages(prev =>
              prev.map(img =>
                img.id === payload.new.id ? Image.fromRecord(payload.new as any) : img
              )
            );
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setImages(prev => prev.filter(img => img.id !== payload.old.id));
          }
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
          logger.info('Subscribed to images realtime updates', { params });
        } else if (status === 'CHANNEL_ERROR') {
          logger.error('Failed to subscribe to images realtime', new Error('Channel error'), {
            params,
          });
        }
      });

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
      setIsSubscribed(false);
      logger.debug('Unsubscribed from images realtime updates', { params });
    };
  }, [params?.category, params?.userId]);

  return { images, isSubscribed };
}
