import { Scene } from '../../domain/entities/Scene';
import { GetScenesUseCase } from '../../domain/usecases/GetScenesUseCase';
import { GetSceneCategoriesUseCase } from '../../domain/usecases/GetSceneCategoriesUseCase';

/**
 * Scene Selection ViewModel
 * Manages state and business logic for Scene Selection screen
 */
export class SceneSelectionViewModel {
  private scenes: Scene[] = [];
  private categories: string[] = [];
  private selectedScene: Scene | null = null;
  private selectedCategory: string | null = null;
  private loading = false;
  private error: string | null = null;

  constructor(
    private getScenesUseCase: GetScenesUseCase,
    private getSceneCategoriesUseCase: GetSceneCategoriesUseCase
  ) {}

  /**
   * Load scenes and categories
   */
  async loadScenes(category?: string): Promise<void> {
    try {
      this.loading = true;
      this.error = null;

      const [scenesResult, categoriesResult] = await Promise.all([
        this.getScenesUseCase.execute({
          category,
          limit: 100,
          offset: 0,
        }),
        this.getSceneCategoriesUseCase.execute(),
      ]);

      this.scenes = scenesResult.data;
      this.categories = categoriesResult.data;

      if (this.categories.length > 0 && !category) {
        this.selectedCategory = this.categories[0];
      } else if (category) {
        this.selectedCategory = category;
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to load scenes';
      this.scenes = [];
      this.categories = [];
    } finally {
      this.loading = false;
    }
  }

  /**
   * Select category
   */
  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  /**
   * Get filtered scenes by selected category
   */
  getFilteredScenes(): Scene[] {
    if (!this.selectedCategory) {
      return this.scenes;
    }
    return this.scenes.filter(scene => scene.category === this.selectedCategory);
  }

  /**
   * Select scene
   */
  selectScene(scene: Scene): void {
    this.selectedScene = scene;
  }

  /**
   * Get selected scene
   */
  getSelectedScene(): Scene | null {
    return this.selectedScene;
  }

  /**
   * Get current state
   */
  getState() {
    return {
      scenes: this.scenes,
      categories: this.categories,
      filteredScenes: this.getFilteredScenes(),
      selectedScene: this.selectedScene,
      selectedCategory: this.selectedCategory,
      loading: this.loading,
      error: this.error,
    };
  }
}
