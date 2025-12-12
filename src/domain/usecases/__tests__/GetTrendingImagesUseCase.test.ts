import { GetTrendingImagesUseCase } from '../GetTrendingImagesUseCase';
import { IImageRepository } from '../../repositories/IImageRepository';
import { Image } from '../../entities/Image';

describe('GetTrendingImagesUseCase', () => {
  let useCase: GetTrendingImagesUseCase;
  let mockImageRepository: jest.Mocked<IImageRepository>;

  beforeEach(() => {
    mockImageRepository = {
      getTrendingImages: jest.fn(),
    } as unknown as jest.Mocked<IImageRepository>;

    useCase = new GetTrendingImagesUseCase(mockImageRepository);
  });

  describe('execute', () => {
    it('should return trending images with default limit', async () => {
      const mockImages: Image[] = [
        Image.fromRecord({
          id: '1',
          title: 'Trending Image',
          image_url: 'https://example.com/image.jpg',
          user_id: 'user1',
          created_at: new Date().toISOString(),
        }),
      ];

      mockImageRepository.getTrendingImages.mockResolvedValue({
        data: mockImages,
        hasMore: false,
      });

      const result = await useCase.execute({});

      expect(result.data).toEqual(mockImages);
      expect(result.hasMore).toBe(false);
      expect(mockImageRepository.getTrendingImages).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
      });
    });

    it('should pass custom parameters to repository', async () => {
      mockImageRepository.getTrendingImages.mockResolvedValue({
        data: [],
        hasMore: false,
      });

      await useCase.execute({
        limit: 10,
        offset: 5,
      });

      expect(mockImageRepository.getTrendingImages).toHaveBeenCalledWith({
        limit: 10,
        offset: 5,
      });
    });
  });
});
