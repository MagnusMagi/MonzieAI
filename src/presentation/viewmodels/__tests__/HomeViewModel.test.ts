import { HomeViewModel } from '../HomeViewModel';
import { GetScenesUseCase } from '../../../domain/usecases/GetScenesUseCase';
import { GetTrendingImagesUseCase } from '../../../domain/usecases/GetTrendingImagesUseCase';
import { Scene } from '../../../domain/entities/Scene';
import { Image } from '../../../domain/entities/Image';

describe('HomeViewModel', () => {
  let viewModel: HomeViewModel;
  let mockGetScenesUseCase: jest.Mocked<GetScenesUseCase>;
  let mockGetTrendingImagesUseCase: jest.Mocked<GetTrendingImagesUseCase>;

  beforeEach(() => {
    mockGetScenesUseCase = {
      execute: jest.fn(),
    } as any;

    mockGetTrendingImagesUseCase = {
      execute: jest.fn(),
    } as any;

    viewModel = new HomeViewModel(mockGetScenesUseCase, mockGetTrendingImagesUseCase);
  });

  it('should load data successfully', async () => {
    const mockScenes = [
      new Scene('1', 'Scene 1', 'Desc', 'Category', 'Prompt', null, new Date(), null),
    ];
    const mockImages = [
      new Image(
        '1',
        'Image 1',
        'https://example.com/image.jpg',
        'Category',
        10,
        5,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        new Date(),
        null
      ),
    ];

    mockGetScenesUseCase.execute.mockResolvedValue({
      data: mockScenes,
      hasMore: false,
    });
    mockGetTrendingImagesUseCase.execute.mockResolvedValue({
      data: mockImages,
      hasMore: false,
    });

    await viewModel.loadData();

    const state = viewModel.getState();
    expect(state.scenes).toEqual(mockScenes);
    expect(state.trendingImages).toEqual(mockImages);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle errors', async () => {
    const error = new Error('Failed to load');
    mockGetScenesUseCase.execute.mockRejectedValue(error);

    await viewModel.loadData();

    const state = viewModel.getState();
    expect(state.error).toBe('Failed to load');
    expect(state.loading).toBe(false);
  });

  it('should refresh data', async () => {
    mockGetScenesUseCase.execute.mockResolvedValue({
      data: [],
      hasMore: false,
    });
    mockGetTrendingImagesUseCase.execute.mockResolvedValue({
      data: [],
      hasMore: false,
    });

    await viewModel.refresh();

    expect(mockGetScenesUseCase.execute).toHaveBeenCalled();
    expect(mockGetTrendingImagesUseCase.execute).toHaveBeenCalled();
  });
});
