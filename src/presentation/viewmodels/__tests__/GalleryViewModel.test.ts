import { GalleryViewModel } from '../GalleryViewModel';
import { GetImagesUseCase } from '../../../domain/usecases/GetImagesUseCase';
import { Image } from '../../../domain/entities/Image';

describe('GalleryViewModel', () => {
  let viewModel: GalleryViewModel;
  let mockGetImagesUseCase: jest.Mocked<GetImagesUseCase>;

  beforeEach(() => {
    mockGetImagesUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetImagesUseCase>;

    viewModel = new GalleryViewModel(mockGetImagesUseCase);
  });

  describe('loadImages', () => {
    it('should load images successfully', async () => {
      const mockImages: Image[] = [
        Image.fromRecord({
          id: '1',
          title: 'Test Image',
          image_url: 'https://example.com/image.jpg',
          user_id: 'user1',
          created_at: new Date().toISOString(),
        }),
      ];

      mockGetImagesUseCase.execute.mockResolvedValue({
        data: mockImages,
        hasMore: false,
      });

      await viewModel.loadImages(true);

      const state = viewModel.getState();
      expect(state.images).toEqual(mockImages);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle errors', async () => {
      mockGetImagesUseCase.execute.mockRejectedValue(new Error('Failed to load'));

      await viewModel.loadImages(true);

      const state = viewModel.getState();
      expect(state.images).toEqual([]);
      expect(state.error).toBe('Failed to load');
      expect(state.loading).toBe(false);
    });

    it('should append images when loading more', async () => {
      const initialImages: Image[] = [
        Image.fromRecord({
          id: '1',
          title: 'Image 1',
          image_url: 'https://example.com/image1.jpg',
          user_id: 'user1',
          created_at: new Date().toISOString(),
        }),
      ];

      const moreImages: Image[] = [
        Image.fromRecord({
          id: '2',
          title: 'Image 2',
          image_url: 'https://example.com/image2.jpg',
          user_id: 'user1',
          created_at: new Date().toISOString(),
        }),
      ];

      mockGetImagesUseCase.execute
        .mockResolvedValueOnce({ data: initialImages, hasMore: true })
        .mockResolvedValueOnce({ data: moreImages, hasMore: false });

      await viewModel.loadImages(true);
      await viewModel.loadImages(false);

      const state = viewModel.getState();
      expect(state.images).toHaveLength(2);
      expect(state.images[0].id).toBe('1');
      expect(state.images[1].id).toBe('2');
    });
  });

  describe('refresh', () => {
    it('should reset and reload images', async () => {
      const mockImages: Image[] = [
        Image.fromRecord({
          id: '1',
          title: 'Test Image',
          image_url: 'https://example.com/image.jpg',
          user_id: 'user1',
          created_at: new Date().toISOString(),
        }),
      ];

      mockGetImagesUseCase.execute.mockResolvedValue({
        data: mockImages,
        hasMore: false,
      });

      await viewModel.refresh();

      const state = viewModel.getState();
      expect(state.images).toEqual(mockImages);
      expect(state.refreshing).toBe(false);
    });
  });

  describe('image state management', () => {
    it('should set image loading state', () => {
      viewModel.setImageLoading('image1', true);
      const state = viewModel.getImageState('image1');
      expect(state?.loading).toBe(true);
      expect(state?.error).toBe(false);
    });

    it('should set image error state', () => {
      viewModel.setImageError('image1', true);
      const state = viewModel.getImageState('image1');
      expect(state?.loading).toBe(false);
      expect(state?.error).toBe(true);
    });
  });
});
