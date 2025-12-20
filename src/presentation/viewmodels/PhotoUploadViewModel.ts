import * as ImagePicker from 'expo-image-picker';
import { logger } from '../../utils/logger';
import { errorLoggingService } from '../../services/errorLoggingService';

/**
 * PhotoUploadViewModel
 * Handles photo selection, validation, and optimization logic
 * Follows MVVM pattern for separation of concerns
 */

export type PhotoSource = 'gallery' | 'camera' | null;

interface ValidationError {
  type: 'size' | 'format' | 'dimensions' | 'permission' | 'general';
  message: string;
}

interface PhotoUploadState {
  selectedPhoto: string | null;
  photoSource: PhotoSource;
  validationError: ValidationError | null;
  loading: boolean;
  isValid: boolean;
}

interface PhotoValidationRules {
  maxSizeBytes?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  allowedFormats?: string[];
}

const DEFAULT_VALIDATION_RULES: PhotoValidationRules = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  minWidth: 256,
  minHeight: 256,
  maxWidth: 4096,
  maxHeight: 4096,
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
};

export class PhotoUploadViewModel {
  private state: PhotoUploadState = {
    selectedPhoto: null,
    photoSource: null,
    validationError: null,
    loading: false,
    isValid: false,
  };

  private validationRules: PhotoValidationRules = DEFAULT_VALIDATION_RULES;
  private listeners: Set<(state: PhotoUploadState) => void> = new Set();

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: PhotoUploadState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  /**
   * Update state and notify listeners
   */
  private setState(updates: Partial<PhotoUploadState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state snapshot
   */
  getState(): PhotoUploadState {
    return { ...this.state };
  }

  /**
   * Set custom validation rules
   */
  setValidationRules(rules: Partial<PhotoValidationRules>): void {
    this.validationRules = { ...DEFAULT_VALIDATION_RULES, ...rules };
    logger.debug('PhotoUploadViewModel: Validation rules updated', this.validationRules);
  }

  /**
   * Pick photo from gallery
   */
  async pickFromGallery(): Promise<boolean> {
    try {
      this.setState({ loading: true, validationError: null });

      logger.debug('PhotoUploadViewModel: Requesting gallery permissions');

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        const error: ValidationError = {
          type: 'permission',
          message: 'Permission to access photo library was denied',
        };
        this.setState({ loading: false, validationError: error, isValid: false });
        return false;
      }

      logger.debug('PhotoUploadViewModel: Launching image picker');

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        aspect: [1, 1],
      });

      if (result.canceled) {
        logger.debug('PhotoUploadViewModel: Gallery selection cancelled');
        this.setState({ loading: false });
        return false;
      }

      const asset = result.assets[0];
      const photoUri = asset.uri;

      logger.info('PhotoUploadViewModel: Photo selected from gallery', {
        uri: photoUri.substring(0, 50) + '...',
        width: asset.width,
        height: asset.height,
      });

      // Validate the selected photo
      const isValid = await this.validatePhoto(photoUri, asset);

      if (isValid) {
        this.setState({
          selectedPhoto: photoUri,
          photoSource: 'gallery',
          loading: false,
          isValid: true,
          validationError: null,
        });
      } else {
        this.setState({
          loading: false,
          isValid: false,
        });
      }

      return isValid;
    } catch (error) {
      const validationError: ValidationError = {
        type: 'general',
        message: error instanceof Error ? error.message : 'Failed to pick photo from gallery',
      };

      logger.error('PhotoUploadViewModel: Failed to pick from gallery', error as Error);

      errorLoggingService.logError(error, null, {
        service: 'IMAGE_PICKER',
        operation: 'pickFromGallery',
      });

      this.setState({
        loading: false,
        validationError,
        isValid: false,
      });

      return false;
    }
  }

  /**
   * Take photo with camera
   */
  async pickFromCamera(): Promise<boolean> {
    try {
      this.setState({ loading: true, validationError: null });

      logger.debug('PhotoUploadViewModel: Requesting camera permissions');

      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        const error: ValidationError = {
          type: 'permission',
          message: 'Permission to access camera was denied',
        };
        this.setState({ loading: false, validationError: error, isValid: false });
        return false;
      }

      logger.debug('PhotoUploadViewModel: Launching camera');

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
        aspect: [1, 1],
      });

      if (result.canceled) {
        logger.debug('PhotoUploadViewModel: Camera capture cancelled');
        this.setState({ loading: false });
        return false;
      }

      const asset = result.assets[0];
      const photoUri = asset.uri;

      logger.info('PhotoUploadViewModel: Photo captured from camera', {
        uri: photoUri.substring(0, 50) + '...',
        width: asset.width,
        height: asset.height,
      });

      // Validate the captured photo
      const isValid = await this.validatePhoto(photoUri, asset);

      if (isValid) {
        this.setState({
          selectedPhoto: photoUri,
          photoSource: 'camera',
          loading: false,
          isValid: true,
          validationError: null,
        });
      } else {
        this.setState({
          loading: false,
          isValid: false,
        });
      }

      return isValid;
    } catch (error) {
      const validationError: ValidationError = {
        type: 'general',
        message: error instanceof Error ? error.message : 'Failed to take photo with camera',
      };

      logger.error('PhotoUploadViewModel: Failed to pick from camera', error as Error);

      errorLoggingService.logError(error, null, {
        service: 'CAMERA',
        operation: 'pickFromCamera',
      });

      this.setState({
        loading: false,
        validationError,
        isValid: false,
      });

      return false;
    }
  }

  /**
   * Validate photo against validation rules
   */
  private async validatePhoto(
    uri: string,
    asset: ImagePicker.ImagePickerAsset
  ): Promise<boolean> {
    try {
      logger.debug('PhotoUploadViewModel: Validating photo', {
        uri: uri.substring(0, 50) + '...',
        width: asset.width,
        height: asset.height,
      });

      // Validate dimensions
      if (this.validationRules.minWidth && asset.width < this.validationRules.minWidth) {
        const error: ValidationError = {
          type: 'dimensions',
          message: `Image width must be at least ${this.validationRules.minWidth}px`,
        };
        this.setState({ validationError: error });
        logger.warn('PhotoUploadViewModel: Photo validation failed - width too small', {
          width: asset.width,
          minWidth: this.validationRules.minWidth,
        });
        return false;
      }

      if (this.validationRules.minHeight && asset.height < this.validationRules.minHeight) {
        const error: ValidationError = {
          type: 'dimensions',
          message: `Image height must be at least ${this.validationRules.minHeight}px`,
        };
        this.setState({ validationError: error });
        logger.warn('PhotoUploadViewModel: Photo validation failed - height too small', {
          height: asset.height,
          minHeight: this.validationRules.minHeight,
        });
        return false;
      }

      if (this.validationRules.maxWidth && asset.width > this.validationRules.maxWidth) {
        const error: ValidationError = {
          type: 'dimensions',
          message: `Image width must be at most ${this.validationRules.maxWidth}px`,
        };
        this.setState({ validationError: error });
        logger.warn('PhotoUploadViewModel: Photo validation failed - width too large', {
          width: asset.width,
          maxWidth: this.validationRules.maxWidth,
        });
        return false;
      }

      if (this.validationRules.maxHeight && asset.height > this.validationRules.maxHeight) {
        const error: ValidationError = {
          type: 'dimensions',
          message: `Image height must be at most ${this.validationRules.maxHeight}px`,
        };
        this.setState({ validationError: error });
        logger.warn('PhotoUploadViewModel: Photo validation failed - height too large', {
          height: asset.height,
          maxHeight: this.validationRules.maxHeight,
        });
        return false;
      }

      // Validate file size (if available)
      if (asset.fileSize && this.validationRules.maxSizeBytes) {
        if (asset.fileSize > this.validationRules.maxSizeBytes) {
          const maxSizeMB = this.validationRules.maxSizeBytes / (1024 * 1024);
          const error: ValidationError = {
            type: 'size',
            message: `Image size must be less than ${maxSizeMB.toFixed(1)}MB`,
          };
          this.setState({ validationError: error });
          logger.warn('PhotoUploadViewModel: Photo validation failed - file too large', {
            fileSize: asset.fileSize,
            maxSize: this.validationRules.maxSizeBytes,
          });
          return false;
        }
      }

      // Validate format
      if (this.validationRules.allowedFormats) {
        const extension = uri.split('.').pop()?.toLowerCase();
        if (extension && !this.validationRules.allowedFormats.includes(extension)) {
          const error: ValidationError = {
            type: 'format',
            message: `Image format must be one of: ${this.validationRules.allowedFormats.join(', ')}`,
          };
          this.setState({ validationError: error });
          logger.warn('PhotoUploadViewModel: Photo validation failed - invalid format', {
            extension,
            allowedFormats: this.validationRules.allowedFormats,
          });
          return false;
        }
      }

      logger.info('PhotoUploadViewModel: Photo validation successful');
      return true;
    } catch (error) {
      const validationError: ValidationError = {
        type: 'general',
        message: 'Failed to validate photo',
      };
      this.setState({ validationError });

      logger.error('PhotoUploadViewModel: Photo validation error', error as Error);
      return false;
    }
  }

  /**
   * Get formatted validation error message
   */
  getValidationErrorMessage(): string | null {
    return this.state.validationError?.message || null;
  }

  /**
   * Clear current selection
   */
  clearSelection(): void {
    this.setState({
      selectedPhoto: null,
      photoSource: null,
      validationError: null,
      loading: false,
      isValid: false,
    });

    logger.debug('PhotoUploadViewModel: Selection cleared');
  }

  /**
   * Clear validation error
   */
  clearError(): void {
    this.setState({ validationError: null });
  }

  /**
   * Check if a photo is selected and valid
   */
  hasValidPhoto(): boolean {
    return this.state.isValid && this.state.selectedPhoto !== null;
  }

  /**
   * Get the selected photo URI
   */
  getPhotoUri(): string | null {
    return this.state.selectedPhoto;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.listeners.clear();
    logger.debug('PhotoUploadViewModel: Disposed');
  }
}

// Export singleton instance
export const photoUploadViewModel = new PhotoUploadViewModel();
