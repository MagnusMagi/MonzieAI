import { useState, useEffect, useCallback } from 'react';
import {
  photoUploadViewModel,
  PhotoUploadViewModel,
  PhotoSource,
} from '../viewmodels/PhotoUploadViewModel';

/**
 * usePhotoUpload Hook
 * React hook for accessing PhotoUploadViewModel state and methods
 * Provides automatic state updates and cleanup
 */

interface UsePhotoUploadResult {
  // State
  selectedPhoto: string | null;
  photoSource: PhotoSource;
  validationError: string | null;
  loading: boolean;
  isValid: boolean;

  // Actions
  pickFromGallery: () => Promise<boolean>;
  pickFromCamera: () => Promise<boolean>;
  clearSelection: () => void;
  clearError: () => void;

  // Helpers
  hasValidPhoto: () => boolean;
  getPhotoUri: () => string | null;
  getValidationErrorMessage: () => string | null;
}

export function usePhotoUpload(): UsePhotoUploadResult {
  // Subscribe to ViewModel state
  const [state, setState] = useState(photoUploadViewModel.getState());

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = photoUploadViewModel.subscribe(newState => {
      setState(newState);
    });

    // Initial state sync
    setState(photoUploadViewModel.getState());

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Memoized action handlers
  const pickFromGallery = useCallback(async () => {
    return photoUploadViewModel.pickFromGallery();
  }, []);

  const pickFromCamera = useCallback(async () => {
    return photoUploadViewModel.pickFromCamera();
  }, []);

  const clearSelection = useCallback(() => {
    photoUploadViewModel.clearSelection();
  }, []);

  const clearError = useCallback(() => {
    photoUploadViewModel.clearError();
  }, []);

  const hasValidPhoto = useCallback(() => {
    return photoUploadViewModel.hasValidPhoto();
  }, []);

  const getPhotoUri = useCallback(() => {
    return photoUploadViewModel.getPhotoUri();
  }, []);

  const getValidationErrorMessage = useCallback(() => {
    return photoUploadViewModel.getValidationErrorMessage();
  }, []);

  return {
    // State
    selectedPhoto: state.selectedPhoto,
    photoSource: state.photoSource,
    validationError: state.validationError?.message || null,
    loading: state.loading,
    isValid: state.isValid,

    // Actions
    pickFromGallery,
    pickFromCamera,
    clearSelection,
    clearError,

    // Helpers
    hasValidPhoto,
    getPhotoUri,
    getValidationErrorMessage,
  };
}
