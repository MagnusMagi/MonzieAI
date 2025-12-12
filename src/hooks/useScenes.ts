import { useQuery, useQueryClient } from '@tanstack/react-query';
import { sceneService, Scene } from '../services/sceneService';

/**
 * React Query hook for fetching scenes with caching
 */
export function useScenes(category?: string, limit: number = 50, offset: number = 0) {
  const queryKey = ['scenes', category, limit, offset];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const result = await sceneService.getScenes(category, limit, offset);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * React Query hook for fetching scenes by category
 */
export function useScenesByCategory(category: string, limit: number = 20, offset: number = 0) {
  const queryKey = ['scenes', 'category', category, limit, offset];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const result = await sceneService.getScenesByCategory(category, limit, offset);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!category, // Only fetch if category is provided
  });
}

/**
 * React Query hook for fetching single scene by ID
 */
export function useSceneById(sceneId: string | undefined) {
  return useQuery({
    queryKey: ['scene', sceneId],
    queryFn: async () => {
      if (!sceneId) return null;
      return await sceneService.getSceneById(sceneId);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (scenes don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!sceneId,
  });
}

/**
 * React Query hook for fetching scene categories
 */
export function useSceneCategories() {
  return useQuery({
    queryKey: ['sceneCategories'],
    queryFn: async () => {
      return await sceneService.getSceneCategories();
    },
    staleTime: 15 * 60 * 1000, // 15 minutes (categories change rarely)
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to invalidate scenes cache
 */
export function useInvalidateScenes() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ['scenes'] });
    },
    invalidateCategory: (category: string) => {
      queryClient.invalidateQueries({ queryKey: ['scenes', 'category', category] });
    },
    invalidateScene: (sceneId: string) => {
      queryClient.invalidateQueries({ queryKey: ['scene', sceneId] });
    },
  };
}
