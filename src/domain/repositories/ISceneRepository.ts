import { Scene } from '../entities/Scene';

/**
 * Scene Repository Interface
 * Defines contract for scene data access
 */
export interface ISceneRepository {
  /**
   * Get all scenes with optional filtering
   */
  getScenes(params: {
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Scene[]; hasMore: boolean }>;

  /**
   * Get scene by ID
   */
  getSceneById(id: string): Promise<Scene | null>;

  /**
   * Get scenes by category
   */
  getScenesByCategory(
    category: string,
    limit?: number,
    offset?: number
  ): Promise<{ data: Scene[]; hasMore: boolean }>;

  /**
   * Get all scene categories
   */
  getSceneCategories(): Promise<string[]>;

  /**
   * Increment scene like count
   */
  incrementLike(id: string): Promise<boolean>;
}
