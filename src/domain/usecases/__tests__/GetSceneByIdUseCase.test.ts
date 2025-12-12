import { GetSceneByIdUseCase } from '../GetSceneByIdUseCase';
import { ISceneRepository } from '../../repositories/ISceneRepository';
import { Scene } from '../../entities/Scene';

describe('GetSceneByIdUseCase', () => {
  let useCase: GetSceneByIdUseCase;
  let mockSceneRepository: jest.Mocked<ISceneRepository>;

  beforeEach(() => {
    mockSceneRepository = {
      getSceneById: jest.fn(),
    } as unknown as jest.Mocked<ISceneRepository>;

    useCase = new GetSceneByIdUseCase(mockSceneRepository);
  });

  describe('execute', () => {
    it('should return active scene', async () => {
      const mockScene = Scene.fromRecord({
        id: 'scene1',
        name: 'Test Scene',
        description: 'Test Description',
        category: 'portrait',
        prompt_template: 'Test prompt',
        preview_url: 'https://example.com/preview.jpg',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      mockSceneRepository.getSceneById.mockResolvedValue(mockScene);

      const result = await useCase.execute('scene1');

      expect(result).toEqual(mockScene);
      expect(mockSceneRepository.getSceneById).toHaveBeenCalledWith('scene1');
    });

    it('should return null for inactive scene', async () => {
      const mockScene = Scene.fromRecord({
        id: 'scene1',
        name: 'Test Scene',
        description: 'Test Description',
        category: 'portrait',
        prompt_template: 'Test prompt',
        preview_url: 'https://example.com/preview.jpg',
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      mockSceneRepository.getSceneById.mockResolvedValue(mockScene);

      const result = await useCase.execute('scene1');

      expect(result).toBeNull();
    });

    it('should return null when scene not found', async () => {
      mockSceneRepository.getSceneById.mockResolvedValue(null);

      const result = await useCase.execute('nonexistent');

      expect(result).toBeNull();
    });
  });
});
