import { ISceneRepository } from '../repositories/ISceneRepository';

/**
 * Use Case: Get Scene Categories
 * Business logic for retrieving scene categories
 */
export class GetSceneCategoriesUseCase {
  constructor(private sceneRepository: ISceneRepository) {}

  /**
   * Execute use case
   */
  async execute(): Promise<{ data: string[] }> {
    const categories = await this.sceneRepository.getSceneCategories();
    return { data: categories };
  }
}
