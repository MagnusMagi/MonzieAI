import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { Image as ImageEntity } from '../domain/entities/Image';
// import { logger } from '../utils/logger'; // Temporarily unused
import { useRealtimeImages } from '../hooks/useRealtimeImage';
import { useAuth } from '../contexts/AuthContext';
import { container } from '../infrastructure/di/Container';
import { errorLoggingService } from '../services/errorLoggingService';
import { getUserFriendlyErrorMessage } from '../utils/errorMessages';
import { useFadeIn } from '../hooks/useFadeIn';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const ITEM_MARGIN = 2;
const ITEM_SIZE = (width - spacing.lg * 2 - ITEM_MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
const ITEM_HEIGHT = ITEM_SIZE;

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
  const [_offset, setOffset] = useState(0);

  // Realtime subscription
  const { images: realtimeImages, isSubscribed } = useRealtimeImages({
    userId: user?.id,
  });

  // Load images
  const loadImages = useCallback(
    async (reset: boolean = false) => {
      if (!user?.id) return;

      try {
        if (reset) {
          setLoading(true);
          setOffset(0);
        } else {
          setLoadingMore(true);
        }

        // Get current offset using functional update
        let currentOffset = 0;
        setOffset(prev => {
          currentOffset = reset ? 0 : prev;
          return currentOffset;
        });

        const result = await imageRepository.getUserImages(user.id, 20, currentOffset);

        if (reset) {
          setImages(result.data);
        } else {
          // Prevent duplicates when loading more
          setImages(prev => {
            const existingIds = new Set(prev.map(img => img.id));
            const newImages = result.data.filter(img => !existingIds.has(img.id));
            return [...prev, ...newImages];
          });
        }

        setHasMore(result.hasMore);
        setOffset(reset ? result.data.length : currentOffset + result.data.length);
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
    [user?.id, imageRepository]
  );

  // Initial load - only run once when user is available
  useEffect(() => {
    if (user?.id) {
      loadImages(true);
    }
  }, [user?.id, loadImages]);

  // Sync realtime images - only add new images or update existing ones
  // Don't replace the entire list to avoid duplicates
  // Only sync after initial load is complete
  useEffect(() => {
    // Don't sync if still loading initial images
    if (loading) return;

    if (realtimeImages.length > 0 && isSubscribed && user?.id) {
      setImages(prev => {
        // If prev is empty, don't sync yet (initial load might not be complete)
        if (prev.length === 0) return prev;

        const userRealtimeImages = realtimeImages.filter(img => img.userId === user.id);

        // Create a map of existing images by ID for quick lookup
        const imageMap = new Map(prev.map(img => [img.id, img]));
        let hasChanges = false;

        userRealtimeImages.forEach(realtimeImg => {
          const existing = imageMap.get(realtimeImg.id);

          if (!existing) {
            // New image - add it to the map (only if it's truly new, not from initial load)
            // Check if this image was just loaded in the last few seconds
            const imageAge = Date.now() - new Date(realtimeImg.createdAt).getTime();
            // Only add if image is older than 5 seconds (to avoid duplicates from initial load)
            if (imageAge > 5000) {
              imageMap.set(realtimeImg.id, realtimeImg);
              hasChanges = true;
            }
          } else {
            // Existing image - only update if views/likes changed
            if (existing.views !== realtimeImg.views || existing.likes !== realtimeImg.likes) {
              // Create updated image with new views/likes but keep original imageUrl
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
              hasChanges = true;
            }
          }
        });

        // Only update state if there are actual changes
        if (hasChanges) {
          return Array.from(imageMap.values())
            .filter(img => img.userId === user.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        // No changes, return previous to prevent unnecessary re-render
        return prev;
      });
    }
  }, [realtimeImages, isSubscribed, user?.id, loading]);

  // Handlers
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadImages(true);
  }, [loadImages]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadImages(false);
    }
  }, [loadingMore, hasMore, loadImages]);

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

  // Render Image Card
  const renderImageCard = useCallback(
    ({ item }: { item: ImageEntity }) => {
      return (
        <TouchableOpacity
          style={styles.imageCard}
          onPress={() => handleImagePress(item)}
          activeOpacity={0.9}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              placeholderContentFit="cover"
            />
          </View>
        </TouchableOpacity>
      );
    },
    [handleImagePress]
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
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.emptyButtonText}>Go Back</Text>
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
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
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
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gallery</Text>
          <View style={styles.backButton} />
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
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: ITEM_MARGIN,
  },
  imageCard: {
    width: ITEM_SIZE,
    marginRight: ITEM_MARGIN,
    marginBottom: ITEM_MARGIN,
  },
  imageContainer: {
    width: '100%',
    height: ITEM_HEIGHT,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
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
