import { GenerateImageUseCase } from '../../domain/usecases/GenerateImageUseCase';
import { Image } from '../../domain/entities/Image';

/**
 * Generating ViewModel
 * Manages state and business logic for Image Generation screen
 */
export interface GeneratingState {
  progress: number;
  status: string;
  isGenerating: boolean;
  error: string | null;
  generatedImage: Image | null;
}

export class GeneratingViewModel {
  private state: GeneratingState = {
    progress: 0,
    status: 'Initializing...',
    isGenerating: false,
    error: null,
    generatedImage: null,
  };

  constructor(private generateImageUseCase: GenerateImageUseCase) {}

  /**
   * Generate image
   */
  async generateImage(params: {
    gender: string;
    imageUri: string;
    sceneId?: string;
    sceneName?: string;
    scenePrompt?: string;
    sceneCategory?: string;
    userId?: string;
  }): Promise<void> {
    try {
      this.state.isGenerating = true;
      this.state.error = null;
      this.state.progress = 0;
      this.state.status = 'Preparing...';

      const result = await this.generateImageUseCase.execute({
        ...params,
        onProgress: (progress, status) => {
          this.state.progress = progress;
          this.state.status = status;
        },
      });

      if (result.success && result.image) {
        this.state.generatedImage = result.image;
        this.state.progress = 100;
        this.state.status = 'Complete!';
      } else {
        this.state.error = result.error || 'Image generation failed';
        this.state.status = 'Failed';
      }
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Unknown error occurred';
      this.state.status = 'Failed';
    } finally {
      this.state.isGenerating = false;
    }
  }

  /**
   * Reset state
   */
  reset(): void {
    this.state = {
      progress: 0,
      status: 'Initializing...',
      isGenerating: false,
      error: null,
      generatedImage: null,
    };
  }

  /**
   * Get current state
   */
  getState(): GeneratingState {
    return { ...this.state };
  }
}
