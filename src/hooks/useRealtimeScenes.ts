import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { Scene } from '../domain/entities/Scene';

/**
 * Real-time subscription hook for scenes
 * Listens for new scenes, updates, and deletions
 */
export function useRealtimeScenes(params?: { category?: string; isActive?: boolean }) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Callback to update scenes from outside
  const updateScenes = useCallback((newScenes: Scene[]) => {
    setScenes(newScenes);
  }, []);

  useEffect(() => {
    // Initial fetch
    const fetchScenes = async () => {
      try {
        let query = supabase
          .from('scenes')
          .select('*')
          .order('name', { ascending: true })
          .limit(200);

        if (params?.category) {
          query = query.eq('category', params.category);
        }

        if (params?.isActive !== undefined) {
          query = query.eq('is_active', params.isActive);
        } else {
          // Default: only active scenes
          query = query.eq('is_active', true);
        }

        const { data, error } = await query;

        if (error) {
          logger.error(
            'Failed to fetch scenes for realtime',
            error instanceof Error ? error : new Error('Unknown error'),
            { params }
          );
          return;
        }

        if (data) {
          setScenes(data.map(record => Scene.fromRecord(record)));
        }
      } catch (error) {
        logger.error(
          'Error fetching scenes for realtime',
          error instanceof Error ? error : new Error('Unknown error'),
          { params }
        );
      }
    };

    fetchScenes();

    // Build filter for subscription
    let filter = '';
    if (params?.category) {
      filter = `category=eq.${params.category}`;
    }

    // Set up real-time subscription
    const channelName = `scenes:${params?.category || 'all'}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scenes',
          ...(filter ? { filter } : {}),
        },
        payload => {
          logger.debug('Scenes changed via realtime', { payload, params });

          if (payload.eventType === 'INSERT' && payload.new) {
            const newScene = Scene.fromRecord(
              payload.new as {
                id: string;
                name: string;
                description?: string | null;
                category: string;
                preview_url?: string | null;
                prompt_template?: string | null;
                is_active: boolean;
                created_at: string;
                updated_at: string;
              }
            );
            // Only add if it matches our filters
            if (
              (!params?.category || newScene.category === params.category) &&
              (!params?.isActive || newScene.isActive === params.isActive)
            ) {
              setScenes(prev => {
                // Check if scene already exists
                if (prev.find(s => s.id === newScene.id)) {
                  return prev;
                }
                // Add new scene and sort by name
                return [...prev, newScene].sort((a, b) => a.name.localeCompare(b.name));
              });
            }
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedScene = Scene.fromRecord(
              payload.new as {
                id: string;
                name: string;
                description?: string | null;
                category: string;
                preview_url?: string | null;
                prompt_template?: string | null;
                is_active: boolean;
                created_at: string;
                updated_at: string;
              }
            );
            setScenes(prev => {
              // Check if scene matches our filters
              const matchesFilter =
                (!params?.category || updatedScene.category === params.category) &&
                (!params?.isActive || updatedScene.isActive === params.isActive);

              if (matchesFilter) {
                // Update existing scene or add if not present
                const existingIndex = prev.findIndex(s => s.id === updatedScene.id);
                if (existingIndex >= 0) {
                  const updated = [...prev];
                  updated[existingIndex] = updatedScene;
                  return updated.sort((a, b) => a.name.localeCompare(b.name));
                } else {
                  return [...prev, updatedScene].sort((a, b) => a.name.localeCompare(b.name));
                }
              } else {
                // Remove if it no longer matches filter
                return prev.filter(s => s.id !== updatedScene.id);
              }
            });
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setScenes(prev => prev.filter(s => s.id !== payload.old.id));
          }
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
          logger.info('Subscribed to scenes realtime updates', { params, channelName });
        } else if (status === 'CHANNEL_ERROR') {
          // Create a more descriptive error with context
          const errorMessage = `Supabase realtime channel subscription failed. Channel: ${channelName}`;
          const error = new Error(errorMessage);

          logger.error('Failed to subscribe to scenes realtime', error, {
            params,
            channelName,
            status,
            filter,
            possibleCauses: [
              'Network connectivity issues',
              'Supabase realtime service unavailable',
              'Authentication problems',
              'Channel configuration error',
            ],
          });
        } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
          logger.warn(`Scenes realtime subscription ${status.toLowerCase()}`, {
            params,
            channelName,
            status,
          });
        }
      });

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
      setIsSubscribed(false);
      logger.debug('Unsubscribed from scenes realtime updates', { params });
    };
  }, [params?.category, params?.isActive]);

  return { scenes, isSubscribed, updateScenes };
}
