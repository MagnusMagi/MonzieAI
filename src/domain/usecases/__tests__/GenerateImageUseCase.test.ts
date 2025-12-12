import { GenerateImageUseCase } from '../GenerateImageUseCase';
import { IImageRepository } from '../../repositories/IImageRepository';
import { ISceneRepository } from '../../repositories/ISceneRepository';
import { Image } from '../../entities/Image';
import { Scene } from '../../entities/Scene';

// Mock image generation service
const mockImageGenerationService = {
  generateImage: jest.fn(),
};

describe('GenerateImageUseCase', () => {
  let useCase: GenerateImageUseCase;
  let mockImageRepository: jest.Mocked<IImageRepository>;
  let mockSceneRepository: jest.Mocked<ISceneRepository>;

  beforeEach(() => {
    mockImageRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      getAll: jest.fn(),
      getTrending: jest.fn(),
      getUserImages: jest.fn(),
      search: jest.fn(),
      like: jest.fn(),
    };

    mockSceneRepository = {
      getScenes: jest.fn(),
      getSceneById: jest.fn(),
      getScenesByCategory: jest.fn(),
      getSceneCategories: jest.fn(),
    };

    useCase = new GenerateImageUseCase(
      mockImageRepository,
      mockSceneRepository,
      mockImageGenerationService as any
    );
  });

  it('should generate image successfully', async () => {
    const mockScene = new Scene(
      'scene1',
      'Test Scene',
      'Description',
      'Category',
      'Prompt template with {gender}',
      null,
      new Date(),
      null
    );

    const mockGeneratedImage = new Image(
      'img1',
      'Generated Image',
      'https://example.com/generated.jpg',
      'Category',
      0,
      0,
      'user1',
      'scene1',
      'Test Scene',
      'Prompt template with male',
      'male',
      'seed123',
      'model1',
      new Date(),
      null
    );

    mockSceneRepository.getSceneById.mockResolvedValue(mockScene);
    mockImageGenerationService.generateImage.mockResolvedValue({
      imageUrl: 'https://example.com/generated.jpg',
      seed: 'seed123',
    });
    mockImageRepository.create.mockResolvedValue(mockGeneratedImage);

    const result = await useCase.execute({
      userId: 'user1',
      imageUri: 'https://example.com/input.jpg',
      sceneId: 'scene1',
      gender: 'male',
    });

    expect(result).toEqual(mockGeneratedImage);
    expect(mockSceneRepository.getSceneById).toHaveBeenCalledWith('scene1');
    expect(mockImageGenerationService.generateImage).toHaveBeenCalled();
    expect(mockImageRepository.create).toHaveBeenCalled();
  });

  it('should throw error if scene not found', async () => {
    mockSceneRepository.getSceneById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user1',
        imageUri: 'https://example.com/input.jpg',
        sceneId: 'invalid',
        gender: 'male',
      })
    ).rejects.toThrow('Scene not found');
  });

  it('should handle image generation errors', async () => {
    const mockScene = new Scene(
      'scene1',
      'Test Scene',
      'Description',
      'Category',
      'Prompt template',
      null,
      new Date(),
      null
    );

    mockSceneRepository.getSceneById.mockResolvedValue(mockScene);
    mockImageGenerationService.generateImage.mockRejectedValue(new Error('Generation failed'));

    await expect(
      useCase.execute({
        userId: 'user1',
        imageUri: 'https://example.com/input.jpg',
        sceneId: 'scene1',
        gender: 'male',
      })
    ).rejects.toThrow('Generation failed');
  });
});
