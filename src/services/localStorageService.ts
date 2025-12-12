import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

/**
 * Local Storage Service
 * Handles local storage for generated images, history, favorites
 * No backend required - everything stored locally
 */

export interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  gender: string;
  sceneName?: string;
  sceneCategory?: string;
  createdAt: string;
  seed?: number;
}

const HISTORY_KEY = '@monzieai:history';
const FAVORITES_KEY = '@monzieai:favorites';

class LocalStorageService {
  /**
   * Save generated image to history
   */
  async saveToHistory(image: GeneratedImage): Promise<void> {
    try {
      const history = await this.getHistory();
      history.unshift(image); // Add to beginning

      // Keep only last 100 images
      const limitedHistory = history.slice(0, 100);

      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
      logger.debug('Image saved to history', { imageId: image.id });
    } catch (error) {
      logger.error(
        'Failed to save to history',
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Get history of generated images
   */
  async getHistory(limit: number = 50): Promise<GeneratedImage[]> {
    try {
      const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
      if (!historyJson) return [];

      const history = JSON.parse(historyJson) as GeneratedImage[];
      return history.slice(0, limit);
    } catch (error) {
      logger.error(
        'Failed to get history',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return [];
    }
  }

  /**
   * Clear history
   */
  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      logger.error(
        'Failed to clear history',
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Add to favorites
   */
  async addToFavorites(imageId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      if (!favorites.includes(imageId)) {
        favorites.push(imageId);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      logger.error(
        'Failed to add to favorites',
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Remove from favorites
   */
  async removeFromFavorites(imageId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const filtered = favorites.filter(id => id !== imageId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    } catch (error) {
      logger.error(
        'Failed to remove from favorites',
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Get favorites
   */
  async getFavorites(): Promise<string[]> {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
      if (!favoritesJson) return [];
      return JSON.parse(favoritesJson) as string[];
    } catch (error) {
      logger.error(
        'Failed to get favorites',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return [];
    }
  }

  /**
   * Check if image is favorited
   */
  async isFavorited(imageId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.includes(imageId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get favorite images from history
   */
  async getFavoriteImages(): Promise<GeneratedImage[]> {
    try {
      const favorites = await this.getFavorites();
      const history = await this.getHistory(1000); // Get all history
      return history.filter(img => favorites.includes(img.id));
    } catch (error) {
      logger.error(
        'Failed to get favorite images',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return [];
    }
  }
}

export const localStorageService = new LocalStorageService();
