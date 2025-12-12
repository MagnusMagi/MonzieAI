import { Scene } from '../entities/Scene';
import { ISceneRepository } from '../repositories/ISceneRepository';

/**
 * Use Case: Get Scene By ID
 * Business logic for retrieving a single scene
 */
export class GetSceneByIdUseCase {
  constructor(private sceneRepository: ISceneRepository) {}

  /**
   * Execute use case
   */
  async execute(id: string): Promise<Scene | null> {
    const scene = await this.sceneRepository.getSceneById(id);

    // Business rule: Only return if scene is active
    if (scene && !scene.isAvailable()) {
      return null;
    }

    return scene;
  }
}
