import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { falAIService } from '../../services/falAIService';
import { logger } from '../../utils/logger';
import { errorLoggingService } from '../../services/errorLoggingService';

/**
 * EnhanceViewModel
 * Handles image enhancement business logic and state management
 * Follows MVVM pattern for separation of concerns
 */

interface EnhanceState {
  sourceImage: string | null;
  enhancedImage: string | null;
  loading: boolean;
  progress: number;
  error: string | null;
  enhancing: boolean;
}

export class EnhanceViewModel {
  private state: EnhanceState = {
    sourceImage: null,
    enhancedImage: null,
    loading: false,
    progress: 0,
    error: null,
    enhancing: false,
  };

  private listeners: Set<(state: EnhanceState) => void> = new Set();

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: EnhanceState) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
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
  private setState(updates: Partial<EnhanceState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state snapshot
   */
  getState(): EnhanceState {
    return { ...this.state };
  }

  /**
   * Select image from gallery
   */
  async selectImage(): Promise<boolean> {
    try {
      this.setState({ loading: true, error: null });

      logger.debug('EnhanceViewModel: Requesting media library permissions');

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        throw new Error('Permission to access media library was denied');
      }

      logger.debug('EnhanceViewModel: Launching image picker');

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        aspect: [1, 1],
      });

      if (result.canceled) {
        logger.debug('EnhanceViewModel: Image selection cancelled');
        this.setState({ loading: false });
        return false;
      }

      const selectedUri = result.assets[0].uri;

      logger.info('EnhanceViewModel: Image selected', {
        uri: selectedUri.substring(0, 50) + '...',
      });

      this.setState({
        sourceImage: selectedUri,
        enhancedImage: null,
        loading: false,
        progress: 0,
      });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to select image. Please try again.';

      logger.error('EnhanceViewModel: Failed to select image', error as Error);

      errorLoggingService.logError(error, null, {
        service: 'IMAGE_PICKER',
        operation: 'selectImage',
      });

      this.setState({
        loading: false,
        error: errorMessage,
      });

      return false;
    }
  }

  /**
   * Take photo with camera
   */
  async takePhoto(): Promise<boolean> {
    try {
      this.setState({ loading: true, error: null });

      logger.debug('EnhanceViewModel: Requesting camera permissions');

      // Request permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        throw new Error('Permission to access camera was denied');
      }

      logger.debug('EnhanceViewModel: Launching camera');

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
        aspect: [1, 1],
      });

      if (result.canceled) {
        logger.debug('EnhanceViewModel: Photo capture cancelled');
        this.setState({ loading: false });
        return false;
      }

      const photoUri = result.assets[0].uri;

      logger.info('EnhanceViewModel: Photo captured', {
        uri: photoUri.substring(0, 50) + '...',
      });

      this.setState({
        sourceImage: photoUri,
        enhancedImage: null,
        loading: false,
        progress: 0,
      });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to take photo. Please try again.';

      logger.error('EnhanceViewModel: Failed to take photo', error as Error);

      errorLoggingService.logError(error, null, {
        service: 'CAMERA',
        operation: 'takePhoto',
      });

      this.setState({
        loading: false,
        error: errorMessage,
      });

      return false;
    }
  }

  /**
   * Enhance the selected image using AI
   */
  async enhanceImage(): Promise<boolean> {
    const { sourceImage } = this.state;

    if (!sourceImage) {
      this.setState({ error: 'Please select an image first' });
      return false;
    }

    try {
      this.setState({
        enhancing: true,
        loading: true,
        error: null,
        progress: 0,
      });

      logger.debug('EnhanceViewModel: Starting image enhancement', {
        sourceImage: sourceImage.substring(0, 50) + '...',
      });

      // Enhance image using Fal AI service
      const result = await falAIService.enhanceImage({
        imageUrl: sourceImage,
        onProgress: (progress, status) => {
          logger.debug('EnhanceViewModel: Enhancement progress', { progress, status });
          this.setState({ progress });
        },
      });

      if (!result.image?.url) {
        throw new Error('Enhancement failed: No enhanced image received');
      }

      logger.info('EnhanceViewModel: Image enhanced successfully', {
        enhancedUrl: result.image.url.substring(0, 50) + '...',
      });

      this.setState({
        enhancedImage: result.image.url,
        enhancing: false,
        loading: false,
        progress: 100,
      });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to enhance image. Please try again.';

      logger.error('EnhanceViewModel: Enhancement failed', error as Error);

      errorLoggingService.logError(error, null, {
        service: 'FAL_AI',
        operation: 'enhanceImage',
      });

      this.setState({
        enhancing: false,
        loading: false,
        error: errorMessage,
      });

      return false;
    }
  }

  /**
   * Save enhanced image to device
   */
  async saveEnhancedImage(): Promise<boolean> {
    const { enhancedImage } = this.state;

    if (!enhancedImage) {
      this.setState({ error: 'No enhanced image to save' });
      return false;
    }

    try {
      this.setState({ loading: true, error: null });

      logger.debug('EnhanceViewModel: Requesting media library permissions for save');

      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== 'granted') {
        throw new Error('Permission to save to media library was denied');
      }

      logger.debug('EnhanceViewModel: Saving enhanced image');

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(enhancedImage);

      logger.info('EnhanceViewModel: Enhanced image saved successfully', {
        assetId: asset.id,
      });

      this.setState({ loading: false });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save image. Please try again.';

      logger.error('EnhanceViewModel: Failed to save enhanced image', error as Error);

      errorLoggingService.logError(error, null, {
        service: 'MEDIA_LIBRARY',
        operation: 'saveEnhancedImage',
      });

      this.setState({
        loading: false,
        error: errorMessage,
      });

      return false;
    }
  }

  /**
   * Share enhanced image
   */
  async shareEnhancedImage(): Promise<boolean> {
    const { enhancedImage } = this.state;

    if (!enhancedImage) {
      this.setState({ error: 'No enhanced image to share' });
      return false;
    }

    try {
      this.setState({ loading: true, error: null });

      logger.debug('EnhanceViewModel: Checking sharing availability');

      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        throw new Error('Sharing is not available on this device');
      }

      logger.debug('EnhanceViewModel: Sharing enhanced image');

      await Sharing.shareAsync(enhancedImage, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Share Enhanced Image',
      });

      logger.info('EnhanceViewModel: Enhanced image shared successfully');

      this.setState({ loading: false });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to share image. Please try again.';

      logger.error('EnhanceViewModel: Failed to share enhanced image', error as Error);

      errorLoggingService.logError(error, null, {
        service: 'SHARING',
        operation: 'shareEnhancedImage',
      });

      this.setState({
        loading: false,
        error: errorMessage,
      });

      return false;
    }
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.setState({ error: null });
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.setState({
      sourceImage: null,
      enhancedImage: null,
      loading: false,
      progress: 0,
      error: null,
      enhancing: false,
    });

    logger.debug('EnhanceViewModel: State reset');
  }

  /**
   * Check if enhancement is ready
   */
  canEnhance(): boolean {
    return this.state.sourceImage !== null && !this.state.enhancing;
  }

  /**
   * Check if save/share is ready
   */
  canSaveOrShare(): boolean {
    return this.state.enhancedImage !== null && !this.state.loading;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.listeners.clear();
    logger.debug('EnhanceViewModel: Disposed');
  }
}

// Export singleton instance
export const enhanceViewModel = new EnhanceViewModel();
