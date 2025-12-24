import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Modal,
  Alert,
  Platform,
  Share,
  Linking,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { useGeneratedViewModel } from '../presentation/hooks/useGeneratedViewModel';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';
import { useRealtimeImage } from '../hooks/useRealtimeImage';
import { container } from '../infrastructure/di/Container';
import { errorLoggingService } from '../services/errorLoggingService';
import { getUserFriendlyErrorMessage } from '../utils/errorMessages';
import { useFadeIn } from '../hooks/useFadeIn';

const { width, height } = Dimensions.get('window');
const fullScreenImageHeight = height * 0.9;

type GeneratedScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Generated'>;

type GeneratedScreenRouteProp = RouteProp<RootStackParamList, 'Generated'>;

export default function GeneratedScreen() {
  const navigation = useNavigation<GeneratedScreenNavigationProp>();
  const route = useRoute<GeneratedScreenRouteProp>();
  const { imageUrl, generatedImages = [], imageId, sceneId } = route.params;
  const { user } = useAuth();
  const fadeAnim = useFadeIn(400);

  // Use DI Container for repository instances
  const imageRepository = React.useMemo(() => container.imageRepository, []);
  const sceneRepository = React.useMemo(() => container.sceneRepository, []);
  const favoriteRepository = React.useMemo(() => container.favoriteRepository, []);

  const { initialize, likeImage, saveToHistory } = useGeneratedViewModel();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [fullScreenImageLoading, setFullScreenImageLoading] = useState(false);
  const [imageKey, setImageKey] = useState(0);
  const imageLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const downloadInProgressRef = useRef(false);
  const shareInProgressRef = useRef(false);

  // Real-time subscription for image updates (likes, views, etc.)
  const { image: realtimeImage, isSubscribed } = useRealtimeImage(imageId || null);

  // Initialize ViewModel with image
  useEffect(() => {
    initialize(imageUrl, generatedImages[0]?.id);

    // Validate image URL
    if (!imageUrl || imageUrl.trim() === '' || !imageUrl.startsWith('http')) {
      setImageLoading(false);
      setImageError(true);
      logger.warn('Invalid image URL', { imageUrl });
      return;
    }

    setImageLoading(true);
    setImageError(false);
    setImageKey(0); // Reset key for new image

    // Timeout fallback - if image doesn't load in 5 seconds, hide loading
    if (imageLoadTimeoutRef.current) {
      clearTimeout(imageLoadTimeoutRef.current);
    }
    imageLoadTimeoutRef.current = setTimeout(() => {
      setImageLoading(false);
      setImageError(true);
      logger.warn('Image load timeout', { imageUrl });
    }, 5000);

    return () => {
      if (imageLoadTimeoutRef.current) {
        clearTimeout(imageLoadTimeoutRef.current);
      }
    };
  }, [imageUrl, initialize]);

  // Log real-time subscription status
  useEffect(() => {
    if (imageId) {
      logger.debug('Real-time subscription status', { imageId, isSubscribed });
      if (realtimeImage) {
        logger.debug('Real-time image data received', {
          likes: realtimeImage.likes,
          views: realtimeImage.views,
        });
      }
    }
  }, [imageId, isSubscribed, realtimeImage]);

  // Increment view count and scene like when image is opened
  useEffect(() => {
    const incrementCounts = async () => {
      try {
        // Increment image view count if imageId is provided
        if (imageId) {
          await imageRepository.incrementViewCount(imageId);
        }

        // Increment scene like if sceneId is provided
        if (sceneId) {
          await sceneRepository.incrementLike(sceneId);
        }
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error');
        errorLoggingService.logError(errorObj, null, {
          service: 'GENERATED',
          operation: 'INCREMENT_COUNTS',
          imageId,
          sceneId,
        });
        // Don't show error to user, just log it
      }
    };

    incrementCounts();
  }, [imageId, sceneId]);

  // Check if image is favorited
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user?.id || !imageId) return;

      try {
        const favorited = await favoriteRepository.isFavorited(user.id, imageId);
        setIsFavorited(favorited);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error');
        errorLoggingService.logError(errorObj, null, {
          service: 'GENERATED',
          operation: 'CHECK_FAVORITE',
          userId: user?.id,
          imageId,
        });
      }
    };

    checkFavoriteStatus();
  }, [user?.id, imageId]);

  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    if (!user?.id || !imageId) {
      Alert.alert('Error', 'Please sign in to add favorites.');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        const success = await favoriteRepository.removeFavorite(user.id, imageId);
        if (success) {
          setIsFavorited(false);
          // Silent success - no alert needed
        } else {
          Alert.alert('Error', 'Failed to remove from favorites');
        }
      } else {
        const success = await favoriteRepository.addFavorite(user.id, imageId);
        if (success) {
          setIsFavorited(true);
          // Silent success - no alert needed
        } else {
          Alert.alert('Error', 'Failed to add to favorites');
        }
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      errorLoggingService.logError(errorObj, null, {
        service: 'GENERATED',
        operation: 'TOGGLE_FAVORITE',
        userId: user?.id,
        imageId,
      });
      const userMessage = getUserFriendlyErrorMessage(error, {
        service: 'SUPABASE',
        operation: 'FAVORITE',
      });
      Alert.alert('Error', userMessage);
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Get current image
  const currentImage =
    generatedImages.length > 0 ? generatedImages[currentIndex] : { url: imageUrl, id: 'current' };

  // Navigation handlers
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setImageLoading(true);
      setImageError(false);
      // Clear existing timeout
      if (imageLoadTimeoutRef.current) {
        clearTimeout(imageLoadTimeoutRef.current);
      }
      // Set timeout for new image
      imageLoadTimeoutRef.current = setTimeout(() => {
        setImageLoading(false);
        setImageError(true);
        logger.warn('Image load timeout', { imageUrl: generatedImages[currentIndex - 1]?.url });
      }, 5000);
    }
  };

  const handleNext = () => {
    if (currentIndex < generatedImages.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setImageLoading(true);
      setImageError(false);
      // Clear existing timeout
      if (imageLoadTimeoutRef.current) {
        clearTimeout(imageLoadTimeoutRef.current);
      }
      // Set timeout for new image
      imageLoadTimeoutRef.current = setTimeout(() => {
        setImageLoading(false);
        setImageError(true);
        logger.warn('Image load timeout', { imageUrl: generatedImages[currentIndex + 1]?.url });
      }, 5000);
    }
  };

  // Download image
  const handleDownload = async () => {
    // Prevent double-tap/double-call - check both state and ref
    if (downloading || downloadInProgressRef.current || sharing || shareInProgressRef.current) {
      logger.warn('Download already in progress, ignoring duplicate call');
      return;
    }

    try {
      // Set both guard mechanisms immediately
      downloadInProgressRef.current = true;
      setDownloading(true);

      // Request media library permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library access to save images.', [
          { text: 'OK' },
        ]);
        downloadInProgressRef.current = false;
        setDownloading(false);
        return;
      }

      // Download image using legacy downloadAsync API
      const fileUri = FileSystem.documentDirectory + `image_${Date.now()}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(currentImage.url, fileUri);

      if (!downloadResult || !downloadResult.uri) {
        throw new Error('Failed to download image: No URI returned');
      }

      // Double-check guard before saving (prevent race conditions)
      if (!downloadInProgressRef.current) {
        logger.warn('Download was cancelled, skipping save');
        return;
      }

      // Save to media library (only once)
      await MediaLibrary.createAssetAsync(downloadResult.uri);

      logger.info('Image saved to gallery successfully', { imageId, imageUrl: currentImage.url });
      Alert.alert('Success', 'Image saved to gallery!');
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      errorLoggingService.logError(errorObj, null, {
        service: 'GENERATED',
        operation: 'DOWNLOAD_IMAGE',
        imageId,
        imageUrl: currentImage.url,
      });
      const userMessage = getUserFriendlyErrorMessage(error, {
        service: 'FILE_SYSTEM',
        operation: 'DOWNLOAD',
      });
      Alert.alert('Error', userMessage);
    } finally {
      // Always reset both guards
      downloadInProgressRef.current = false;
      setDownloading(false);
    }
  };

  // Share image
  const handleShare = async () => {
    // Prevent double-tap/double-call - check both state and ref, and also check if download is in progress
    if (sharing || shareInProgressRef.current || downloading || downloadInProgressRef.current) {
      logger.warn('Share already in progress or download in progress, ignoring duplicate call');
      return;
    }

    try {
      // Set both guard mechanisms immediately
      shareInProgressRef.current = true;
      setSharing(true);

      const result = await Share.share({
        message: `Check out this AI-generated image! ${currentImage.url}`,
        url: currentImage.url,
        title: 'AI Generated Image',
      });

      if (result.action === Share.sharedAction) {
        logger.info('Image shared successfully', { imageId, imageUrl: currentImage.url });
        // Note: On iOS, if user selects "Save Image" from share sheet, it's handled by iOS
        // We don't need to save it again - iOS handles it automatically
      }
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      errorLoggingService.logError(errorObj, null, {
        service: 'GENERATED',
        operation: 'SHARE_IMAGE',
        imageId,
      });
      const userMessage = getUserFriendlyErrorMessage(error, {
        service: 'SHARE',
        operation: 'SHARE',
      });
      Alert.alert('Error', userMessage);
    } finally {
      // Always reset both guards
      shareInProgressRef.current = false;
      setSharing(false);
    }
  };

  // Open image in browser (fallback)
  const handleOpenInBrowser = () => {
    Linking.openURL(currentImage.url).catch(err => {
      logger.error('Failed to open URL', err instanceof Error ? err : new Error(String(err)));
      Alert.alert('Error', 'Failed to open image in browser.');
    });
  };

  // Reset full screen loading when modal opens
  useEffect(() => {
    if (fullScreenVisible) {
      setFullScreenImageLoading(true);
      // Timeout for full screen image - shorter timeout
      const timeout = setTimeout(() => {
        setFullScreenImageLoading(false);
        logger.warn('Full screen image load timeout', { imageUrl: currentImage.url });
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [fullScreenVisible, currentImage.url]);

  // Get scene name for display
  const sceneNameDisplay = realtimeImage?.sceneName || 'AI Generated Image';

  // Get image info for display
  const imageViews = realtimeImage?.views || 0;

  return (
    <View style={styles.container}>
      {/* Full Screen Image */}
      {!imageError && (
        <Image
          key={`${currentImage.url}-${currentIndex}-${imageKey}`}
          source={{ uri: currentImage.url }}
          style={styles.fullImage}
          resizeMode="cover"
          onLoadStart={() => {
            setImageLoading(true);
            setImageError(false);
            if (imageLoadTimeoutRef.current) {
              clearTimeout(imageLoadTimeoutRef.current);
            }
            imageLoadTimeoutRef.current = setTimeout(() => {
              setImageLoading(false);
              setImageError(true);
              logger.warn('Image load timeout', { imageUrl: currentImage.url });
            }, 5000);
          }}
          onLoad={() => {
            setImageLoading(false);
            setImageError(false);
            if (imageLoadTimeoutRef.current) {
              clearTimeout(imageLoadTimeoutRef.current);
              imageLoadTimeoutRef.current = null;
            }
          }}
          onLoadEnd={() => {
            setImageLoading(false);
            setImageError(false);
            if (imageLoadTimeoutRef.current) {
              clearTimeout(imageLoadTimeoutRef.current);
              imageLoadTimeoutRef.current = null;
            }
          }}
          onError={error => {
            setImageLoading(false);
            setImageError(true);
            if (imageLoadTimeoutRef.current) {
              clearTimeout(imageLoadTimeoutRef.current);
              imageLoadTimeoutRef.current = null;
            }
            logger.error(
              'Image failed to load',
              error.nativeEvent?.error || new Error('Image load error'),
              {
                imageUrl: currentImage.url,
              }
            );
          }}
        />
      )}

      {/* Loading Overlay */}
      {imageLoading && !imageError && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.text.inverse} />
          <Text style={styles.loadingText}>Loading image...</Text>
        </View>
      )}

      {/* Error Overlay */}
      {imageError && (
        <View style={styles.errorOverlay}>
          <Ionicons name="image-outline" size={48} color={colors.text.inverse} />
          <Text style={styles.errorText}>Failed to load image</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setImageError(false);
              setImageLoading(true);
              setImageKey(prev => prev + 1);
              if (imageLoadTimeoutRef.current) {
                clearTimeout(imageLoadTimeoutRef.current);
              }
              imageLoadTimeoutRef.current = setTimeout(() => {
                setImageLoading(false);
                setImageError(true);
                logger.warn('Image load timeout on retry', { imageUrl: currentImage.url });
              }, 5000);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Transparent Header */}
      <SafeAreaView style={styles.headerContainer} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.inverse} />
          </TouchableOpacity>
          {imageId && (
            <TouchableOpacity
              style={styles.favoriteButtonHeader}
              onPress={handleToggleFavorite}
              disabled={favoriteLoading}
              activeOpacity={0.7}
            >
              {favoriteLoading ? (
                <ActivityIndicator size="small" color={colors.text.inverse} />
              ) : (
                <Ionicons
                  name={isFavorited ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFavorited ? colors.error : colors.text.inverse}
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {/* Transparent Content Overlay at Bottom */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.95)']}
        style={styles.contentOverlay}
        locations={[0, 0.3, 1]}
      >
        <SafeAreaView style={styles.contentSafeArea} edges={['bottom']}>
          {/* Scene Name and Views */}
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {sceneNameDisplay}
            </Text>
            <View style={styles.viewsContainer}>
              <Ionicons name="eye" size={18} color={colors.text.inverse} />
              <Text style={styles.viewsText}>{imageViews}</Text>
            </View>
          </View>

          {/* Navigation Controls */}
          {generatedImages.length > 1 && (
            <View style={styles.navigationControls}>
              <TouchableOpacity
                style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
                onPress={handlePrevious}
                disabled={currentIndex === 0}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={currentIndex === 0 ? 'rgba(255, 255, 255, 0.5)' : colors.text.inverse}
                />
              </TouchableOpacity>

              <Text style={styles.imageCounter}>
                {currentIndex + 1} / {generatedImages.length}
              </Text>

              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentIndex === generatedImages.length - 1 && styles.navButtonDisabled,
                ]}
                onPress={handleNext}
                disabled={currentIndex === generatedImages.length - 1}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={
                    currentIndex === generatedImages.length - 1
                      ? 'rgba(255, 255, 255, 0.5)'
                      : colors.text.inverse
                  }
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDownload}
              disabled={
                downloading ||
                downloadInProgressRef.current ||
                sharing ||
                shareInProgressRef.current
              }
              activeOpacity={0.8}
            >
              <Ionicons
                name="download"
                size={20}
                color={
                  downloading || downloadInProgressRef.current
                    ? 'rgba(255, 255, 255, 0.5)'
                    : colors.text.inverse
                }
              />
              <Text
                style={[
                  styles.actionButtonText,
                  (downloading || downloadInProgressRef.current) && styles.actionButtonTextDisabled,
                ]}
              >
                {downloading ? 'Downloading...' : 'Download'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShare}
              disabled={
                sharing ||
                shareInProgressRef.current ||
                downloading ||
                downloadInProgressRef.current
              }
              activeOpacity={0.8}
            >
              <Ionicons
                name="share-social"
                size={20}
                color={
                  sharing || shareInProgressRef.current
                    ? 'rgba(255, 255, 255, 0.5)'
                    : colors.text.inverse
                }
              />
              <Text
                style={[
                  styles.actionButtonText,
                  (sharing || shareInProgressRef.current) && styles.actionButtonTextDisabled,
                ]}
              >
                {sharing ? 'Sharing...' : 'Share'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setFullScreenVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="expand" size={20} color={colors.text.inverse} />
              <Text style={styles.actionButtonText}>Full Screen</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Full Screen Modal */}
      <Modal
        visible={fullScreenVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenVisible(false)}
      >
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity
            style={styles.fullScreenCloseButton}
            onPress={() => setFullScreenVisible(false)}
          >
            <Ionicons name="close" size={32} color={colors.text.inverse} />
          </TouchableOpacity>
          <ScrollView
            contentContainerStyle={styles.fullScreenScroll}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            bouncesZoom={true}
          >
            {fullScreenImageLoading && (
              <View style={styles.fullScreenLoader}>
                <ActivityIndicator size="large" color={colors.text.inverse} />
                <Text style={styles.fullScreenLoadingText}>Loading...</Text>
              </View>
            )}
            <Image
              source={{ uri: currentImage.url }}
              style={styles.fullScreenImage}
              resizeMode="contain"
              onLoadStart={() => setFullScreenImageLoading(true)}
              onLoadEnd={() => {
                setFullScreenImageLoading(false);
              }}
              onError={error => {
                setFullScreenImageLoading(false);
                logger.error(
                  'Full screen image failed to load',
                  error.nativeEvent?.error || new Error('Image load error'),
                  {
                    imageUrl: currentImage.url,
                  }
                );
              }}
            />
          </ScrollView>
          {generatedImages.length > 1 && (
            <View style={styles.fullScreenNav}>
              <TouchableOpacity
                style={[
                  styles.fullScreenNavButton,
                  currentIndex === 0 && styles.fullScreenNavButtonDisabled,
                ]}
                onPress={handlePrevious}
                disabled={currentIndex === 0}
              >
                <Ionicons
                  name="chevron-back"
                  size={28}
                  color={currentIndex === 0 ? colors.text.tertiary : colors.text.inverse}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.fullScreenNavButton,
                  currentIndex === generatedImages.length - 1 && styles.fullScreenNavButtonDisabled,
                ]}
                onPress={handleNext}
                disabled={currentIndex === generatedImages.length - 1}
              >
                <Ionicons
                  name="chevron-forward"
                  size={28}
                  color={
                    currentIndex === generatedImages.length - 1
                      ? colors.text.tertiary
                      : colors.text.inverse
                  }
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fullImage: {
    width: width,
    height: height,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.inverse,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    padding: spacing.xl,
  },
  errorText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.inverse,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing.xs : spacing.sm,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  favoriteButtonHeader: {
    padding: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: spacing['3xl'],
  },
  contentSafeArea: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  title: {
    flex: 1,
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.inverse,
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  viewsText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
  fullScreenLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  fullScreenLoadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.inverse,
  },
  navigationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  imageCounter: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
  actionButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: 52, // spacing.xl (32) + 20
    right: spacing.lg,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: spacing.sm,
  },
  fullScreenScroll: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: height,
    paddingVertical: spacing['2xl'],
  },
  fullScreenImage: {
    width: width,
    height: fullScreenImageHeight,
  },
  fullScreenNav: {
    position: 'absolute',
    bottom: 52, // spacing.xl (32) + 20
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  fullScreenNavButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: spacing.md,
  },
  fullScreenNavButtonDisabled: {
    opacity: 0.3,
  },
});
