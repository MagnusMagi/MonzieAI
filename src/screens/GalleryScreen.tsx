import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { Image as ImageEntity } from '../domain/entities/Image';
import { logger } from '../utils/logger';
import { useRealtimeImages } from '../hooks/useRealtimeImage';
import { useAuth } from '../contexts/AuthContext';
import { container } from '../infrastructure/di/Container';
import { errorLoggingService } from '../services/errorLoggingService';
import { getUserFriendlyErrorMessage } from '../utils/errorMessages';
import { useFadeIn } from '../hooks/useFadeIn';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 2;
const ITEM_MARGIN = spacing.sm;
const ITEM_SIZE = (width - spacing.xl * 2 - ITEM_MARGIN) / NUM_COLUMNS;
const ITEM_HEIGHT = ITEM_SIZE * 1.2;

type GalleryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Gallery'>;

export default function GalleryScreen() {
  const navigation = useNavigation<GalleryScreenNavigationProp>();
  const { user } = useAuth();
  const fadeAnim = useFadeIn(400);
  const imageRepository = useMemo(() => container.imageRepository, []);

  // State
  const [images, setImages] = useState<ImageEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, { loading: boolean; error: boolean }>>({});

  // Realtime subscription
  const { images: realtimeImages, isSubscribed } = useRealtimeImages({
    userId: user?.id,
  });

  // Load images
  const loadImages = useCallback(
    async (reset: boolean = false) => {
      if (!user?.id || searchQuery.trim()) return;

      try {
        if (reset) {
          setLoading(true);
          setOffset(0);
        } else {
          setLoadingMore(true);
        }

        const currentOffset = reset ? 0 : offset;
        const result = await imageRepository.getUserImages(user.id, 20, currentOffset);

        if (reset) {
          setImages(result.data);
          // Initialize load states only for new images
          setImageLoadStates(prev => {
            const newStates: Record<string, { loading: boolean; error: boolean }> = {};
            result.data.forEach(img => {
              // Keep existing state if image was already loaded, otherwise set to loading
              if (prev[img.id] && !prev[img.id].loading) {
                newStates[img.id] = { loading: false, error: false };
              } else {
                newStates[img.id] = { loading: true, error: false };
              }
            });
            return newStates;
          });
        } else {
          setImages(prev => [...prev, ...result.data]);
          // Initialize load states for new images only
          setImageLoadStates(prev => {
            const newStates = { ...prev };
            result.data.forEach(img => {
              if (!newStates[img.id]) {
                newStates[img.id] = { loading: true, error: false };
              }
            });
            return newStates;
          });
        }

        setHasMore(result.hasMore);
        setOffset(reset ? result.data.length : offset + result.data.length);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error');
        errorLoggingService.logError(errorObj, null, {
          service: 'GALLERY',
          operation: 'LOAD_IMAGES',
          userId: user?.id,
        });
        const userMessage = getUserFriendlyErrorMessage(error, {
          service: 'SUPABASE',
          operation: 'LOAD_IMAGES',
        });
        Alert.alert('Error', userMessage);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [user?.id, offset, searchQuery, imageRepository]
  );

  // Search images
  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim() || !user?.id) {
        if (!query.trim()) {
          loadImages(true);
        }
        return;
      }

      try {
        setLoading(true);
        const allResults = await imageRepository.fullTextSearch(query.trim(), 100);
        const userResults = allResults.filter(img => img.userId === user.id);
        
        setImages(userResults);
        setHasMore(false);
        setOffset(0);
        
        // Initialize load states
        const states: Record<string, { loading: boolean; error: boolean }> = {};
        userResults.forEach(img => {
          states[img.id] = { loading: true, error: false };
        });
        setImageLoadStates(states);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error');
        errorLoggingService.logError(errorObj, null, {
          service: 'GALLERY',
          operation: 'SEARCH_IMAGES',
          userId: user?.id,
          query,
        });
        const userMessage = getUserFriendlyErrorMessage(error, {
          service: 'SUPABASE',
          operation: 'SEARCH',
        });
        Alert.alert('Error', userMessage);
      } finally {
        setLoading(false);
      }
    },
    [user?.id, imageRepository, loadImages]
  );

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        loadImages(true);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch, loadImages]);

  // Initial load
  useEffect(() => {
    if (user?.id && !searchQuery.trim()) {
      loadImages(true);
    }
  }, [user?.id]);

  // Sync realtime images - only update if there are actual changes
  useEffect(() => {
    if (realtimeImages.length > 0 && isSubscribed && user?.id) {
      setImages(prev => {
        const userRealtimeImages = realtimeImages.filter(img => img.userId === user.id);
        
        // Quick check: if counts don't match, there might be new images
        if (userRealtimeImages.length !== prev.length) {
          const imageMap = new Map(prev.map(img => [img.id, img]));
          let hasNewImages = false;
          
          userRealtimeImages.forEach(img => {
            const isNew = !imageMap.has(img.id);
            imageMap.set(img.id, img);
            
            if (isNew) {
              hasNewImages = true;
              // Only set loading state for truly new images
              setImageLoadStates(prevStates => {
                if (!prevStates[img.id]) {
                  return {
                    ...prevStates,
                    [img.id]: { loading: true, error: false },
                  };
                }
                return prevStates;
              });
            }
          });
          
          if (hasNewImages) {
            return Array.from(imageMap.values())
              .filter(img => img.userId === user.id)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          }
        }
        
        // For existing images, only update if views/likes changed (not imageUrl)
        // This prevents re-rendering images that are already loaded
        const hasSignificantChanges = userRealtimeImages.some(realtimeImg => {
          const existingImg = prev.find(img => img.id === realtimeImg.id);
          if (!existingImg) return false;
          
          // Only update if views or likes changed (not imageUrl - that would cause reload)
          return (
            existingImg.views !== realtimeImg.views ||
            existingImg.likes !== realtimeImg.likes
          );
        });
        
        if (hasSignificantChanges) {
          const imageMap = new Map(prev.map(img => [img.id, img]));
          userRealtimeImages.forEach(realtimeImg => {
            const existing = imageMap.get(realtimeImg.id);
            if (existing) {
              // Create new Image entity with updated views/likes but keep original imageUrl
              // Use fromRecord to create new instance with updated values
              const updatedImage = ImageEntity.fromRecord({
                id: existing.id,
                title: existing.title,
                image_url: existing.imageUrl, // Keep original URL to prevent image reload
                category: existing.category,
                likes: realtimeImg.likes, // Updated likes
                views: realtimeImg.views, // Updated views
                created_at: existing.createdAt.toISOString(),
                updated_at: existing.updatedAt?.toISOString() || null,
                user_id: existing.userId,
                scene_id: existing.sceneId,
                scene_name: existing.sceneName,
                prompt: existing.prompt,
                gender: existing.gender,
                seed: existing.seed,
                model: existing.model,
                description: existing.description,
                features: existing.features,
              });
              imageMap.set(realtimeImg.id, updatedImage);
            } else {
              imageMap.set(realtimeImg.id, realtimeImg);
            }
          });
          
          return Array.from(imageMap.values())
            .filter(img => img.userId === user.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        
        // No significant changes, return previous to prevent re-render
        return prev;
      });
    }
  }, [realtimeImages, isSubscribed, user?.id]);

  // Handlers
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadImages(true);
  }, [loadImages]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !searchQuery.trim()) {
      loadImages(false);
    }
  }, [loadingMore, hasMore, searchQuery, loadImages]);

  const handleImagePress = useCallback(
    (image: ImageEntity) => {
      navigation.navigate('Generated', {
        imageUrl: image.imageUrl,
        generatedImages: [{ id: image.id, url: image.imageUrl }],
        imageId: image.id,
        sceneId: image.sceneId || undefined,
      });
    },
    [navigation]
  );

  const handleImageLoadStart = useCallback((id: string) => {
    // Clear any existing timeout
    if (imageTimeoutsRef.current[id]) {
      clearTimeout(imageTimeoutsRef.current[id]);
      delete imageTimeoutsRef.current[id];
    }
    
    setImageLoadStates(prev => ({
      ...prev,
      [id]: { loading: true, error: false },
    }));
    
    // Set timeout fallback - if image doesn't load in 5 seconds, mark as error
    imageTimeoutsRef.current[id] = setTimeout(() => {
      setImageLoadStates(prev => {
        if (prev[id]?.loading) {
          logger.warn('Image load timeout in Gallery', { imageId: id });
          return {
            ...prev,
            [id]: { loading: false, error: true },
          };
        }
        return prev;
      });
      delete imageTimeoutsRef.current[id];
    }, 5000);
  }, []);

  const handleImageLoadEnd = useCallback((id: string) => {
    setImageLoadStates(prev => ({
      ...prev,
      [id]: { loading: false, error: false },
    }));
  }, []);

  const handleImageError = useCallback((id: string) => {
    // Clear timeout since we have an error
    if (imageTimeoutsRef.current[id]) {
      clearTimeout(imageTimeoutsRef.current[id]);
      delete imageTimeoutsRef.current[id];
    }
    
    setImageLoadStates(prev => ({
      ...prev,
      [id]: { loading: false, error: true },
    }));
    logger.warn('Image failed to load', { imageId: id });
  }, []);

  // Timeout refs for each image to prevent stuck loading states
  const imageTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Render Image Card
  const renderImageCard = useCallback(
    ({ item }: { item: ImageEntity }) => {
      const loadState = imageLoadStates[item.id];
      // If state doesn't exist yet, assume loading (will be set by onLoadStart)
      // If state exists, use its loading value
      const isLoading = loadState === undefined ? true : loadState.loading;
      const hasError = loadState?.error || false;

      return (
        <TouchableOpacity
          style={styles.imageCard}
          onPress={() => handleImagePress(item)}
          activeOpacity={0.9}
        >
          <View style={styles.imageContainer}>
            {isLoading && !hasError && (
              <View style={styles.imageLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
            
            {hasError ? (
              <View style={styles.imageError}>
                <Ionicons name="image-outline" size={32} color={colors.text.tertiary} />
                <Text style={styles.imageErrorText}>Failed to load</Text>
              </View>
            ) : (
              <Image
                key={`${item.id}-${item.imageUrl}`}
                source={{ uri: item.imageUrl, cache: 'default' }}
                style={styles.image}
                resizeMode="cover"
                onLoadStart={() => {
                  handleImageLoadStart(item.id);
                }}
                onLoadEnd={() => {
                  handleImageLoadEnd(item.id);
                }}
                onError={() => {
                  handleImageError(item.id);
                }}
                onLoad={() => {
                  // Also handle onLoad event (fired when image is loaded, even from cache)
                  handleImageLoadEnd(item.id);
                }}
              />
            )}

            {/* Overlay */}
            <View style={styles.imageOverlay}>
              <View style={styles.imageInfo}>
                <View style={styles.viewsBadge}>
                  <Ionicons name="eye" size={12} color={colors.text.inverse} />
                  <Text style={styles.viewsText}>{item.views || 0}</Text>
                </View>
              </View>
              {item.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [imageLoadStates, handleImagePress, handleImageLoadStart, handleImageLoadEnd, handleImageError]
  );

  // Render empty state
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="images-outline" size={64} color={colors.text.tertiary} />
        <Text style={styles.emptyTitle}>No Images Yet</Text>
        <Text style={styles.emptyText}>
          Start creating amazing AI images{'\n'}to see them here!
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}
        >
          <Text style={styles.emptyButtonText}>Create Your First Image</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  // Loading state
  if (loading && images.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gallery</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading images...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gallery</Text>
        <View style={styles.backButton} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search images..."
          placeholderTextColor={colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Image Grid */}
      <FlatList
        data={images}
        renderItem={renderImageCard}
        keyExtractor={item => item.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={NUM_COLUMNS > 1 ? styles.row : undefined}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
      />
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
    padding: 0,
  },
  clearButton: {
    padding: spacing.xs,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: ITEM_MARGIN,
  },
  imageCard: {
    width: ITEM_SIZE,
    marginBottom: ITEM_MARGIN,
  },
  imageContainer: {
    width: '100%',
    height: ITEM_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
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
  imageError: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  imageErrorText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  imageInfo: {
    flex: 1,
  },
  viewsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  viewsText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
    marginLeft: spacing.xs,
  },
  categoryBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
});
