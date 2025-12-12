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
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [fullScreenImageLoading, setFullScreenImageLoading] = useState(false);
  const [imageKey, setImageKey] = useState(0);
  const imageLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    try {
      setDownloading(true);

      // Request media library permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library access to save images.', [
          { text: 'OK' },
        ]);
        setDownloading(false);
        return;
      }

      // Download image using legacy downloadAsync API
      const fileUri = FileSystem.documentDirectory + `image_${Date.now()}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(currentImage.url, fileUri);

      if (!downloadResult || !downloadResult.uri) {
        throw new Error('Failed to download image: No URI returned');
      }

      // Save to media library
      await MediaLibrary.createAssetAsync(downloadResult.uri);

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
      setDownloading(false);
    }
  };

  // Share image
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this AI-generated image! ${currentImage.url}`,
        url: currentImage.url,
        title: 'AI Generated Image',
      });

      if (result.action === Share.sharedAction) {
        logger.info('Image shared successfully');
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            // Navigate to Home and reset navigation stack
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Generated Image</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Image Container */}
        <View style={styles.imageContainerWrapper}>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => setFullScreenVisible(true)}
            activeOpacity={0.9}
            disabled={imageLoading}
          >
            {imageLoading && !imageError && (
              <View style={styles.imageLoader}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading image...</Text>
              </View>
            )}
            {imageError && (
              <View style={styles.imageErrorContainer}>
                <Ionicons name="image-outline" size={48} color={colors.text.tertiary} />
                <Text style={styles.imageErrorText}>Failed to load image</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    setImageError(false);
                    setImageLoading(true);
                    setImageKey(prev => prev + 1); // Force image reload
                    // Clear timeout
                    if (imageLoadTimeoutRef.current) {
                      clearTimeout(imageLoadTimeoutRef.current);
                    }
                    // Set new timeout
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
            {!imageError && (
              <Image
                key={`${currentImage.url}-${currentIndex}-${imageKey}`}
                source={{ uri: currentImage.url }}
                style={[styles.image, imageLoading && styles.imageHidden]}
                resizeMode="contain"
                onLoadStart={() => {
                  setImageLoading(true);
                  setImageError(false);
                  // Clear existing timeout
                  if (imageLoadTimeoutRef.current) {
                    clearTimeout(imageLoadTimeoutRef.current);
                  }
                  // Set new timeout - shorter for better UX
                  imageLoadTimeoutRef.current = setTimeout(() => {
                    setImageLoading(false);
                    setImageError(true);
                    logger.warn('Image load timeout', { imageUrl: currentImage.url });
                  }, 5000);
                }}
                onLoad={() => {
                  // onLoad fires even when image is loaded from cache
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
                onError={(error) => {
                  setImageLoading(false);
                  setImageError(true);
                  if (imageLoadTimeoutRef.current) {
                    clearTimeout(imageLoadTimeoutRef.current);
                    imageLoadTimeoutRef.current = null;
                  }
                  logger.error('Image failed to load', error.nativeEvent?.error || new Error('Image load error'), {
                    imageUrl: currentImage.url,
                  });
                }}
              />
            )}
            {!imageLoading && !imageError && (
              <View style={styles.imageOverlay}>
                <Ionicons name="expand" size={24} color={colors.text.inverse} />
                <Text style={styles.tapToExpand}>Tap to expand</Text>
              </View>
            )}
          </TouchableOpacity>
          {/* Favorite Button */}
          {imageId && (
            <TouchableOpacity
              style={styles.favoriteButton}
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

        {/* Navigation Controls */}
        {generatedImages.length > 1 && (
          <View style={styles.navigationControls}>
            <TouchableOpacity
              style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
              onPress={handlePrevious}
              disabled={currentIndex === 0}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={currentIndex === 0 ? colors.text.tertiary : colors.text.primary}
              />
              <Text
                style={[styles.navButtonText, currentIndex === 0 && styles.navButtonTextDisabled]}
              >
                Previous
              </Text>
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
            >
              <Text
                style={[
                  styles.navButtonText,
                  currentIndex === generatedImages.length - 1 && styles.navButtonTextDisabled,
                ]}
              >
                Next
              </Text>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={
                  currentIndex === generatedImages.length - 1
                    ? colors.text.tertiary
                    : colors.text.primary
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
            disabled={downloading}
            activeOpacity={0.7}
          >
            <Ionicons
              name="download"
              size={24}
              color={downloading ? colors.text.tertiary : colors.primary}
            />
            <Text style={[styles.actionButtonText, downloading && styles.actionButtonTextDisabled]}>
              {downloading ? 'Downloading...' : 'Download'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare} activeOpacity={0.7}>
            <Ionicons name="share-social" size={24} color={colors.primary} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Gallery Button */}
        <TouchableOpacity
          style={styles.galleryButton}
          onPress={() => navigation.navigate('Gallery')}
          activeOpacity={0.8}
        >
          <Ionicons name="images" size={20} color={colors.text.inverse} />
          <Text style={styles.galleryButtonText}>Galeriye Git</Text>
        </TouchableOpacity>
      </ScrollView>

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
              style={[styles.fullScreenImage, fullScreenImageLoading && styles.imageHidden]}
              resizeMode="contain"
              onLoadStart={() => setFullScreenImageLoading(true)}
              onLoadEnd={() => {
                setFullScreenImageLoading(false);
              }}
              onError={(error) => {
                setFullScreenImageLoading(false);
                logger.error('Full screen image failed to load', error.nativeEvent?.error || new Error('Image load error'), {
                  imageUrl: currentImage.url,
                });
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
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? spacing.xs : spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  imageContainerWrapper: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  imageContainer: {
    width: '100%',
    height: width * 1.2,
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageHidden: {
    opacity: 0,
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  imageErrorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    zIndex: 1,
  },
  imageErrorText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: typography.fontSize.base,
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
  imageOverlay: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tapToExpand: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.inverse,
  },
  navigationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  navButtonTextDisabled: {
    color: colors.text.tertiary,
  },
  imageCounter: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
  },
  actionButtonTextDisabled: {
    color: colors.text.tertiary,
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.secondary || colors.primary,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.secondary || colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  galleryButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.inverse,
  },
  generateMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  generateMoreText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.inverse,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: spacing.xl + 20,
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
    height: height * 0.9,
  },
  fullScreenNav: {
    position: 'absolute',
    bottom: spacing.xl + 20,
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
