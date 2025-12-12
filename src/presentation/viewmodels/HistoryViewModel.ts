import { Image } from '../../domain/entities/Image';
import { IImageRepository } from '../../domain/repositories/IImageRepository';

/**
 * History ViewModel
 * Manages state and business logic for History screen
 */
export class HistoryViewModel {
  private history: Image[] = [];
  private loading = false;
  private error: string | null = null;

  constructor(private imageRepository: IImageRepository) {}

  /**
   * Load history for user
   */
  async loadHistory(userId: string): Promise<void> {
    try {
      this.loading = true;
      this.error = null;

      const result = await this.imageRepository.getUserImages(userId, 100, 0);
      this.history = result.data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to load history';
      this.history = [];
    } finally {
      this.loading = false;
    }
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Get current state
   */
  getState() {
    return {
      history: this.history,
      loading: this.loading,
      error: this.error,
    };
  }
}
