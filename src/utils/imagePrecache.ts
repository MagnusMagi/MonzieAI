import { Image } from 'expo-image';
import { logger } from './logger';
import { subcategoryMapping, getSubcategoriesForCategory } from './subcategoryMapping';
import { sceneService } from '../services/sceneService';

/**
 * Pre-cache subcategory preview images during splash screen
 * This improves perceived performance by loading images before they're needed
 */
export async function precacheSubcategoryImages(): Promise<void> {
  try {
    logger.debug('Starting image pre-cache for subcategories');

    // Fetch all scenes once
    const { data: allScenes } = await sceneService.getScenes(undefined, 200);

    if (!allScenes || allScenes.length === 0) {
      logger.warn('No scenes found for pre-caching');
      return;
    }

    // Collect preview URLs for each subcategory
    const previewUrls: string[] = [];
    const categories = Object.keys(subcategoryMapping);

    for (const categoryId of categories) {
      const subcategories = getSubcategoriesForCategory(categoryId);
      const categoryScenes = allScenes.filter(s => s.category === categoryId);

      for (const subcategoryName of subcategories) {
        // Get scene names for this subcategory
        const subcategorySceneNames = subcategoryMapping[categoryId]?.[subcategoryName] || [];

        // Find the first scene from this subcategory for preview
        const representativeScene = categoryScenes.find(scene =>
          subcategorySceneNames.includes(scene.name)
        );

        // sceneService returns Scene interface with preview_url
        if (representativeScene?.preview_url) {
          previewUrls.push(representativeScene.preview_url);
        }
      }
    }

    if (previewUrls.length === 0) {
      logger.warn('No preview URLs found for pre-caching');
      return;
    }

    logger.debug(`Pre-caching ${previewUrls.length} images`);

    // Pre-cache images in parallel (but limit concurrency to avoid overwhelming)
    const BATCH_SIZE = 5;
    for (let i = 0; i < previewUrls.length; i += BATCH_SIZE) {
      const batch = previewUrls.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(
        batch.map(url =>
          Image.prefetch(url, {
            cachePolicy: 'memory-disk',
          }).catch(error => {
            // Silently fail individual image prefetch - don't block the app
            logger.debug('Failed to pre-cache image', { url, error });
          })
        )
      );
    }

    logger.debug('Image pre-cache completed', {
      totalImages: previewUrls.length,
    });
  } catch (error) {
    // Don't throw - pre-caching is a performance optimization, not critical
    logger.error(
      'Failed to pre-cache images',
      error instanceof Error ? error : new Error('Unknown error')
    );
  }
}
