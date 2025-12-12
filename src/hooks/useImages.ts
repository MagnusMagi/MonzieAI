import { useQuery, useQueryClient } from '@tanstack/react-query';
import { databaseService, ImageRecord } from '../services/databaseService';

/**
 * React Query hook for fetching images with caching
 */
export function useImages(category?: string, limit: number = 50, offset: number = 0) {
  const queryKey = ['images', category, limit, offset];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const result = await databaseService.getImages(category, limit, offset);
      return result;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (images change more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * React Query hook for fetching trending images
 */
export function useTrendingImages(limit: number = 10, offset: number = 0) {
  return useQuery({
    queryKey: ['images', 'trending', limit, offset],
    queryFn: async () => {
      const result = await databaseService.getTrendingImages(limit, offset);
      return result;
    },
    staleTime: 1 * 60 * 1000, // 1 minute (trending changes frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * React Query hook for fetching single image by ID
 */
export function useImageById(imageId: string | undefined) {
  return useQuery({
    queryKey: ['image', imageId],
    queryFn: async () => {
      if (!imageId) return null;
      return await databaseService.getImageById(imageId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!imageId,
  });
}

/**
 * React Query hook for fetching user images
 */
export function useUserImages(userId: string | undefined, limit: number = 50, offset: number = 0) {
  return useQuery({
    queryKey: ['images', 'user', userId, limit, offset],
    queryFn: async () => {
      if (!userId) return { data: [], hasMore: false };
      const result = await databaseService.getUserImages(userId, limit, offset);
      return result;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId,
  });
}

/**
 * Hook to invalidate images cache
 */
export function useInvalidateImages() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
    invalidateImage: (imageId: string) => {
      queryClient.invalidateQueries({ queryKey: ['image', imageId] });
    },
    invalidateUserImages: (userId: string) => {
      queryClient.invalidateQueries({ queryKey: ['images', 'user', userId] });
    },
    invalidateTrending: () => {
      queryClient.invalidateQueries({ queryKey: ['images', 'trending'] });
    },
  };
}
