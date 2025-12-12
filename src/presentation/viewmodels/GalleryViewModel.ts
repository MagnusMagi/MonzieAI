import { Image } from '../../domain/entities/Image';
import { GetImagesUseCase } from '../../domain/usecases/GetImagesUseCase';
import { logger } from '../../utils/logger';

/**
 * Gallery ViewModel
 * Manages state and business logic for Gallery screen
 */
export class GalleryViewModel {
  private images: Image[] = [];
  private loading = false;
  private refreshing = false;
  private loadingMore = false;
  private hasMore = true;
  private offset = 0;
  private error: string | null = null;
  private imageStates: { [key: string]: { loading: boolean; error: boolean } } = {};

  constructor(private getImagesUseCase: GetImagesUseCase) {}

  /**
   * Load images
   */
  async loadImages(reset: boolean = false, limit: number = 20): Promise<void> {
    try {
      if (reset) {
        this.loading = true;
        this.offset = 0;
        this.imageStates = {};
      } else {
        this.loadingMore = true;
      }

      const currentOffset = reset ? 0 : this.offset;
      const result = await this.getImagesUseCase.execute({
        limit,
        offset: currentOffset,
      });

      if (reset) {
        this.images = result.data;
      } else {
        this.images = [...this.images, ...result.data];
      }

      this.hasMore = result.hasMore;
      this.offset = currentOffset + result.data.length;
      this.error = null;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to load images';
      logger.error(
        'Failed to load images',
        error instanceof Error ? error : new Error('Unknown error')
      );
    } finally {
      this.loading = false;
      this.loadingMore = false;
      this.refreshing = false;
    }
  }

  /**
   * Refresh images
   */
  async refresh(): Promise<void> {
    this.refreshing = true;
    await this.loadImages(true);
  }

  /**
   * Load more images
   */
  async loadMore(): Promise<void> {
    if (!this.loadingMore && this.hasMore) {
      await this.loadImages(false);
    }
  }

  /**
   * Set image loading state
   */
  setImageLoading(id: string, loading: boolean): void {
    this.imageStates[id] = {
      ...this.imageStates[id],
      loading,
      error: false,
    };
  }

  /**
   * Set image error state
   */
  setImageError(id: string, error: boolean): void {
    this.imageStates[id] = {
      ...this.imageStates[id],
      loading: false,
      error,
    };
  }

  /**
   * Get image state
   */
  getImageState(id: string): { loading: boolean; error: boolean } | undefined {
    return this.imageStates[id];
  }

  /**
   * Get current state
   */
  getState() {
    return {
      images: this.images,
      loading: this.loading,
      refreshing: this.refreshing,
      loadingMore: this.loadingMore,
      hasMore: this.hasMore,
      error: this.error,
      imageStates: this.imageStates,
    };
  }
}
