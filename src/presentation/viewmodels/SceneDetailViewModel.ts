import { Scene } from '../../domain/entities/Scene';
import { GetSceneByIdUseCase } from '../../domain/usecases/GetSceneByIdUseCase';

/**
 * Scene Detail ViewModel
 * Manages state and business logic for Scene Detail screen
 */
export class SceneDetailViewModel {
  private scene: Scene | null = null;
  private loading = false;
  private error: string | null = null;

  constructor(private getSceneByIdUseCase: GetSceneByIdUseCase) {}

  /**
   * Load scene by ID
   */
  async loadScene(sceneId: string): Promise<void> {
    try {
      this.loading = true;
      this.error = null;

      this.scene = await this.getSceneByIdUseCase.execute(sceneId);

      if (!this.scene) {
        this.error = 'Scene not found';
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to load scene';
      this.scene = null;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Get formatted prompt for gender
   */
  getFormattedPrompt(gender: string): string {
    if (!this.scene) {
      return `A professional ${gender} portrait`;
    }
    return this.scene.getFormattedPrompt(gender);
  }

  /**
   * Get current state
   */
  getState() {
    return {
      scene: this.scene,
      loading: this.loading,
      error: this.error,
    };
  }
}
