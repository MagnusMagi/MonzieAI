import { GetScenesUseCase } from '../GetScenesUseCase';
import { ISceneRepository } from '../../repositories/ISceneRepository';
import { Scene } from '../../entities/Scene';

describe('GetScenesUseCase', () => {
  let useCase: GetScenesUseCase;
  let mockRepository: jest.Mocked<ISceneRepository>;

  beforeEach(() => {
    mockRepository = {
      getScenes: jest.fn(),
      getSceneById: jest.fn(),
      getScenesByCategory: jest.fn(),
      getSceneCategories: jest.fn(),
    };

    useCase = new GetScenesUseCase(mockRepository);
  });

  it('should return scenes successfully', async () => {
    const mockScenes = [
      new Scene('1', 'Scene 1', 'Desc 1', 'Category 1', 'Prompt 1', null, new Date(), null),
      new Scene('2', 'Scene 2', 'Desc 2', 'Category 2', 'Prompt 2', null, new Date(), null),
    ];

    mockRepository.getScenes.mockResolvedValue({
      data: mockScenes,
      hasMore: false,
    });

    const result = await useCase.execute({ limit: 10, offset: 0 });

    expect(result.data).toEqual(mockScenes);
    expect(result.hasMore).toBe(false);
    expect(mockRepository.getScenes).toHaveBeenCalledWith({
      limit: 10,
      offset: 0,
    });
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Repository error');
    mockRepository.getScenes.mockRejectedValue(error);

    await expect(useCase.execute({})).rejects.toThrow('Repository error');
  });

  it('should filter by category when provided', async () => {
    const mockScenes = [
      new Scene('1', 'Scene 1', 'Desc 1', 'Category 1', 'Prompt 1', null, new Date(), null),
    ];

    mockRepository.getScenes.mockResolvedValue({
      data: mockScenes,
      hasMore: false,
    });

    await useCase.execute({ category: 'Category 1', limit: 10, offset: 0 });

    expect(mockRepository.getScenes).toHaveBeenCalledWith({
      category: 'Category 1',
      limit: 10,
      offset: 0,
    });
  });
});
