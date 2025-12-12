import { LikeImageUseCase } from '../LikeImageUseCase';
import { IImageRepository } from '../../repositories/IImageRepository';

describe('LikeImageUseCase', () => {
  let useCase: LikeImageUseCase;
  let mockImageRepository: jest.Mocked<IImageRepository>;

  beforeEach(() => {
    mockImageRepository = {
      likeImage: jest.fn(),
    } as unknown as jest.Mocked<IImageRepository>;

    useCase = new LikeImageUseCase(mockImageRepository);
  });

  describe('execute', () => {
    it('should like image successfully', async () => {
      const mockImage = {
        id: 'image1',
        title: 'Test Image',
        imageUrl: 'https://example.com/image.jpg',
        category: 'portrait',
        likes: 0,
        views: 0,
        incrementLikes: jest.fn().mockReturnThis(),
      };

      mockImageRepository.getImageById = jest.fn().mockResolvedValue(mockImage as any);
      mockImageRepository.updateImageLikes = jest.fn().mockResolvedValue(true);

      const result = await useCase.execute('image1');

      expect(mockImageRepository.getImageById).toHaveBeenCalledWith('image1');
      expect(mockImageRepository.updateImageLikes).toHaveBeenCalledWith('image1', 1);
      expect(result).not.toBeNull();
    });

    it('should return null when image not found', async () => {
      mockImageRepository.getImageById = jest.fn().mockResolvedValue(null);

      const result = await useCase.execute('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle repository errors', async () => {
      mockImageRepository.getImageById = jest.fn().mockRejectedValue(new Error('Repository error'));

      await expect(useCase.execute('image1')).rejects.toThrow('Repository error');
    });
  });
});
