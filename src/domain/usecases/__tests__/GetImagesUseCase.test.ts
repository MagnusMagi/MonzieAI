import { GetImagesUseCase } from '../GetImagesUseCase';
import { IImageRepository } from '../../repositories/IImageRepository';
import { Image } from '../../entities/Image';

describe('GetImagesUseCase', () => {
  let useCase: GetImagesUseCase;
  let mockImageRepository: jest.Mocked<IImageRepository>;

  beforeEach(() => {
    mockImageRepository = {
      getImages: jest.fn(),
    } as unknown as jest.Mocked<IImageRepository>;

    useCase = new GetImagesUseCase(mockImageRepository);
  });

  describe('execute', () => {
    it('should return images with default limit and offset', async () => {
      const mockImages: Image[] = [
        Image.fromRecord({
          id: '1',
          title: 'Test Image',
          image_url: 'https://example.com/image.jpg',
          user_id: 'user1',
          created_at: new Date().toISOString(),
        }),
      ];

      mockImageRepository.getImages.mockResolvedValue({
        data: mockImages,
        hasMore: false,
      });

      const result = await useCase.execute({});

      expect(result.data).toEqual(mockImages);
      expect(result.hasMore).toBe(false);
      expect(mockImageRepository.getImages).toHaveBeenCalledWith({
        limit: 50,
        offset: 0,
        category: undefined,
      });
    });

    it('should pass custom parameters to repository', async () => {
      mockImageRepository.getImages.mockResolvedValue({
        data: [],
        hasMore: false,
      });

      await useCase.execute({
        category: 'portrait',
        limit: 20,
        offset: 10,
      });

      expect(mockImageRepository.getImages).toHaveBeenCalledWith({
        limit: 20,
        offset: 10,
        category: 'portrait',
      });
    });

    it('should handle repository errors', async () => {
      mockImageRepository.getImages.mockRejectedValue(new Error('Repository error'));

      await expect(useCase.execute({})).rejects.toThrow('Repository error');
    });
  });
});
