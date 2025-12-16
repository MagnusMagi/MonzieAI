import { Scene } from '../../domain/entities/Scene';
import { GetScenesUseCase } from '../../domain/usecases/GetScenesUseCase';
import { GetSceneCategoriesUseCase } from '../../domain/usecases/GetSceneCategoriesUseCase';

/**
 * Home ViewModel
 * Manages state and business logic for Home screen
 */
export class HomeViewModel {
  private scenes: Scene[] = [];
  private categories: string[] = [];
  private loading = false;
  private error: string | null = null;
  private searchQuery = '';

  constructor(
    private getScenesUseCase: GetScenesUseCase,
    private getSceneCategoriesUseCase: GetSceneCategoriesUseCase
  ) {}

  /**
   * Load scenes - Load all scenes (200 limit to cover all 150+ scenes)
   */
  async loadScenes(category?: string, limit: number = 200, offset: number = 0): Promise<void> {
    try {
      this.loading = true;
      this.error = null;

      const result = await this.getScenesUseCase.execute({
        category,
        limit,
        offset,
      });

      if (offset === 0) {
        this.scenes = result.data;
      } else {
        this.scenes = [...this.scenes, ...result.data];
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to load scenes';
      this.scenes = [];
    } finally {
      this.loading = false;
    }
  }

  /**
   * Load scene categories
   */
  async loadCategories(): Promise<void> {
    try {
      const result = await this.getSceneCategoriesUseCase.execute();
      this.categories = result.data;
    } catch (error) {
      // Error already logged in use case
      this.error = error instanceof Error ? error.message : 'Failed to load categories';
      this.categories = [];
    }
  }

  /**
   * Filter scenes by search query
   */
  getFilteredScenes(): Scene[] {
    if (!this.searchQuery.trim()) {
      return this.scenes;
    }

    const query = this.searchQuery.toLowerCase();
    return this.scenes.filter(
      scene =>
        scene.name.toLowerCase().includes(query) ||
        (scene.description && scene.description.toLowerCase().includes(query))
    );
  }

  /**
   * Set search query
   */
  setSearchQuery(query: string): void {
    this.searchQuery = query;
  }

  /**
   * Get current state
   */
  getState() {
    return {
      scenes: this.getFilteredScenes(),
      allScenes: this.scenes,
      categories: this.categories,
      loading: this.loading,
      error: this.error,
      searchQuery: this.searchQuery,
    };
  }

  /**
   * Refresh scenes
   */
  async refresh(): Promise<void> {
    await this.loadScenes();
  }

  /**
   * Update scenes directly (for real-time updates)
   */
  updateScenes(scenes: Scene[]): void {
    this.scenes = scenes;
  }
}
