import { GetSceneCategoriesUseCase } from '../GetSceneCategoriesUseCase';
import { ISceneRepository } from '../../repositories/ISceneRepository';

describe('GetSceneCategoriesUseCase', () => {
  let useCase: GetSceneCategoriesUseCase;
  let mockSceneRepository: jest.Mocked<ISceneRepository>;

  beforeEach(() => {
    mockSceneRepository = {
      getSceneCategories: jest.fn(),
    } as unknown as jest.Mocked<ISceneRepository>;

    useCase = new GetSceneCategoriesUseCase(mockSceneRepository);
  });

  describe('execute', () => {
    it('should return categories', async () => {
      const mockCategories = ['portrait', 'landscape', 'fantasy'];

      mockSceneRepository.getSceneCategories.mockResolvedValue(mockCategories);

      const result = await useCase.execute();

      expect(result.data).toEqual(mockCategories);
      expect(mockSceneRepository.getSceneCategories).toHaveBeenCalled();
    });

    it('should handle empty categories', async () => {
      mockSceneRepository.getSceneCategories.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result.data).toEqual([]);
    });
  });
});
