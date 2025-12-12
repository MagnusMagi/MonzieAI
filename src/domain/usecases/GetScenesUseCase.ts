import { Scene } from '../entities/Scene';
import { ISceneRepository } from '../repositories/ISceneRepository';

/**
 * Use Case: Get Scenes
 * Business logic for retrieving scenes
 */
export class GetScenesUseCase {
  constructor(private sceneRepository: ISceneRepository) {}

  /**
   * Execute use case
   */
  async execute(params: {
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Scene[]; hasMore: boolean }> {
    // Business logic: Only return active scenes
    const result = await this.sceneRepository.getScenes({
      ...params,
      limit: params.limit || 50,
      offset: params.offset || 0,
    });

    // Filter out inactive scenes (additional safety check)
    const activeScenes = result.data.filter(scene => scene.isAvailable());

    return {
      data: activeScenes,
      hasMore: result.hasMore,
    };
  }
}
