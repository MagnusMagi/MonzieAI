import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
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
import { Scene } from '../domain/entities/Scene';
import { useHomeViewModel } from '../presentation/hooks/useHomeViewModel';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';
import { useFadeIn } from '../hooks/useFadeIn';
import { getSubcategoriesForCategory, getScenesForSubcategory } from '../utils/subcategoryMapping';
import { useMemo, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usageService } from '../services/usageService';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const fadeAnim = useFadeIn(400);
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [trendingImages, setTrendingImages] = useState<
    Array<{
      id: string;
      image_url: string;
      views: number;
      likes: number;
    }>
  >([]);
  const [_loadingTrending, setLoadingTrending] = useState(true);
  const [dailyCredits, setDailyCredits] = useState<{ count: number; limit: number } | null>(null);

  // Use ViewModel hook for business logic
  const { scenes, loading, error, loadScenes, refresh } = useHomeViewModel();

  // Load daily credits
  useEffect(() => {
    if (user?.id) {
      loadDailyCredits();
    }
  }, [user]);

  const loadDailyCredits = async () => {
    if (user?.id) {
      const usage = await usageService.getUserUsage(user.id);
      if (usage) {
        setDailyCredits({ count: usage.dailyCount, limit: usage.dailyLimit });
      }
    }
  };

  // Debug: Log scenes count
  React.useEffect(() => {
    logger.debug('HomeScreen scenes loaded', {
      scenesCount: scenes.length,
      categories: [...new Set(scenes.map(s => s.category))],
    });
  }, [scenes]);

  // Load trending images - DISABLED
  // React.useEffect(() => {
  //   loadTrendingImages();
  // }, []);

  // const loadTrendingImages = async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('trending_images')
  //       .select('*')
  //       .order('trending_score', { ascending: false })
  //       .limit(10);

  //     if (error) {
  //       logger.error(
  //         'Failed to load trending images',
  //         error instanceof Error ? error : new Error('Unknown error')
  //       );
  //       return;
  //     }

  //     setTrendingImages(data || []);
  //   } catch (error) {
  //     logger.error(
  //       'Failed to load trending images',
  //       error instanceof Error ? error : new Error('Unknown error')
  //     );
  //   } finally {
  //     setLoadingTrending(false);
  //   }
  // };

  // Get user display name
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refresh();
    // await loadTrendingImages(); // DISABLED
    setRefreshing(false);
  }, [refresh]);

  const handleMenuPress = () => {
    navigation.navigate('Profile');
  };

  const handleSubcategoryPress = useCallback(
    (categoryId: string, subcategoryName: string) => {
      // Get scene names for this subcategory
      const subcategorySceneNames = getScenesForSubcategory(categoryId, subcategoryName);
      // Find scenes that match this subcategory and category
      const categoryScenes = scenes.filter(scene => scene.category === categoryId);
      const subcategoryScenes = categoryScenes.filter(scene =>
        subcategorySceneNames.includes(scene.name)
      );

      navigation.navigate('SubcategoryScenes', {
        categoryId,
        subcategoryName,
        scenes: subcategoryScenes.map(scene => ({
          id: scene.id,
          name: scene.name,
          description: scene.description || undefined,
          category: scene.category,
          previewUrl: scene.previewUrl || undefined,
          promptTemplate: scene.promptTemplate || undefined,
        })),
      });
    },
    [navigation, scenes]
  );

  const handleViewAllPress = useCallback(
    (categoryId: string) => {
      navigation.navigate('CategoryDetail', { categoryId });
    },
    [navigation]
  );

  // Scene card width constant
  const SCENE_CARD_WIDTH = width * 0.7;
  const SCENE_CARD_MARGIN = spacing.md;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading scenes...</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerTop}>
              <Text style={styles.greeting}>{displayName} 👋</Text>
              {dailyCredits && dailyCredits.limit > 0 && (
                <View style={styles.creditsBadge}>
                  <Ionicons name="flash" size={14} color={colors.accent} />
                  <Text style={styles.creditsBadgeText}>
                    {Math.max(0, dailyCredits.limit - dailyCredits.count)}/{dailyCredits.limit}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.subtitle}>What would you like to create?</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleMenuPress}
            activeOpacity={0.7}
          >
            {user?.avatar_url ? (
              <View style={styles.profileImageContainer}>
                <Image
                  source={{ uri: user.avatar_url }}
                  style={styles.profileImage}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                  onError={error => {
                    logger.error(
                      'Home avatar image load failed',
                      error instanceof Error ? error : new Error('Unknown error'),
                      {
                        avatar_url: user?.avatar_url,
                      }
                    );
                  }}
                />
              </View>
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={32} color={colors.text.secondary} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          nestedScrollEnabled={true}
        >
          {/* Trending Section - DISABLED */}
          {/* {trendingImages.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trending</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trendingScrollContent}
              >
                {trendingImages.map(image => (
                  <TouchableOpacity
                    key={image.id}
                    style={styles.trendingCard}
                    onPress={() => {
                      // Navigate to image detail or gallery
                      navigation.navigate('Gallery');
                    }}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={{ uri: image.image_url }}
                      style={styles.trendingImage}
                      resizeMode="cover"
                    />
                    <View style={styles.trendingOverlay}>
                      <View style={styles.trendingStats}>
                        <Ionicons name="eye" size={14} color={colors.text.inverse} />
                        <Text style={styles.trendingStatText}>{image.views || 0}</Text>
                        <Ionicons
                          name="heart"
                          size={14}
                          color={colors.text.inverse}
                          style={{ marginLeft: spacing.xs }}
                        />
                        <Text style={styles.trendingStatText}>{image.likes || 0}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )} */}

          {/* Main Categories Section */}
          <View style={[styles.section, styles.firstSection]}>
            {[
              { id: 'professional', name: 'Professional', icon: 'briefcase' },
              { id: 'travel', name: 'Travel', icon: 'airplane' },
              { id: 'social_media', name: 'Social Media', icon: 'share-social' },
              { id: 'nostalgia', name: 'Nostalgia', icon: 'time' },
              { id: 'wedding', name: 'Wedding & Special Occasion', icon: 'heart' },
              { id: 'fantasy', name: 'Fantasy', icon: 'sparkles' },
              { id: 'sports', name: 'Sports & Fitness', icon: 'fitness' },
              { id: 'fashion', name: 'Fashion & Model', icon: 'shirt' },
              { id: 'art', name: 'Art & Illustration', icon: 'color-palette' },
              { id: 'funny', name: 'Funny, Meme & GTA', icon: 'happy' },
            ].map(category => {
              // Get scenes for this category
              const categoryScenes = scenes.filter(s => s.category === category.id);
              // Get subcategories from mapping
              const subcategories = getSubcategoriesForCategory(category.id);

              return (
                <View key={category.id} style={styles.categorySection}>
                  {/* Category Header */}
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryHeaderLeft}>
                      <Text style={styles.categoryHeaderTitle}>{category.name}</Text>
                      <Text style={styles.categoryHeaderCount}>
                        {categoryScenes.length} scene{categoryScenes.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.viewAllButton}
                      onPress={() => handleViewAllPress(category.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.viewAllText}>View All</Text>
                      <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>

                  {/* Subcategories Horizontal Scroll */}
                  {subcategories.length > 0 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.subcategoriesScrollContent}
                      nestedScrollEnabled={true}
                    >
                      {subcategories.map(subcategoryName => {
                        // Get scene names for this subcategory
                        const subcategorySceneNames = getScenesForSubcategory(
                          category.id,
                          subcategoryName
                        );
                        // Find the first scene from this subcategory for preview image
                        const representativeScene = categoryScenes.find(scene =>
                          subcategorySceneNames.includes(scene.name)
                        );
                        const previewUrl = representativeScene?.previewUrl;
                        const imageId = `${category.id}_${subcategoryName}`;

                        return (
                          <TouchableOpacity
                            key={subcategoryName}
                            style={styles.subcategoryCard}
                            onPress={() => handleSubcategoryPress(category.id, subcategoryName)}
                            activeOpacity={0.7}
                          >
                            {previewUrl ? (
                              <Image
                                source={{ uri: previewUrl }}
                                style={styles.subcategoryImage}
                                contentFit="cover"
                                transition={200}
                                cachePolicy="memory-disk"
                                placeholderContentFit="cover"
                              />
                            ) : (
                              <View style={styles.subcategoryPlaceholder}>
                                <Ionicons
                                  name={category.icon as any}
                                  size={32}
                                  color={colors.text.secondary}
                                />
                              </View>
                            )}
                            <View style={styles.subcategoryOverlay} pointerEvents="none">
                              <Text style={styles.subcategoryTitle} numberOfLines={2}>
                                {subcategoryName}
                              </Text>
                              <Text style={styles.subcategoryCount}>
                                {subcategorySceneNames.length} scene
                                {subcategorySceneNames.length !== 1 ? 's' : ''}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}
                </View>
              );
            })}
          </View>

          {/* Grid View for All Scenes - Deactivated for now */}
          {/* {scenes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons name="grid" size={20} color={colors.accent} />
                <Text style={styles.sectionTitle}>All Scenes</Text>
              </View>
            </View>
            <View style={styles.scenesGrid}>
              {scenes.map(scene => (
                <TouchableOpacity
                  key={scene.id}
                  style={styles.sceneGridCard}
                  onPress={() => handleScenePress(scene)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{
                      uri:
                        scene.previewUrl ||
                        'https://via.placeholder.com/400x600?text=' +
                          encodeURIComponent(scene.name),
                    }}
                    style={styles.sceneGridImage}
                    resizeMode="cover"
                    onLoadStart={() => handleImageLoadStart(scene.id + '_grid')}
                    onLoadEnd={() => handleImageLoadEnd(scene.id + '_grid')}
                  />
                  {imageStates[scene.id + '_grid']?.loading && (
                    <View style={styles.imageLoader}>
                      <ActivityIndicator size="small" color={colors.text.inverse} />
                    </View>
                  )}
                  <View style={styles.sceneGridOverlay} pointerEvents="none">
                    <Text style={styles.sceneGridTitle} numberOfLines={1}>
                      {scene.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )} */}
        </ScrollView>

        {/* Floating Action Button - Gallery */}
        <TouchableOpacity
          style={[
            styles.fab,
            {
              bottom: 20 + insets.bottom,
            },
          ]}
          onPress={() => navigation.navigate('Gallery')}
          activeOpacity={0.8}
        >
          <Ionicons name="images" size={24} color={colors.text.inverse} />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing.xs : spacing.sm,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  greeting: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  creditsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    gap: spacing.xs / 2,
  },
  creditsBadgeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.accent,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  profileButton: {
    padding: spacing.xs,
    marginLeft: spacing.md,
  },
  profileImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  section: {
    marginBottom: spacing.lg,
  },
  firstSection: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  sceneCount: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  categorySection: {
    marginBottom: spacing.xl,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  categoryHeaderLeft: {
    flex: 1,
  },
  categoryHeaderTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  categoryHeaderCount: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  viewAllText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  subcategoriesScrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  subcategoryCard: {
    width: (width - spacing.xl * 2 - spacing.sm) / 2.5,
    height: ((width - spacing.xl * 2 - spacing.sm) / 2.5) * (16 / 9) * 0.85, // 9:16 portrait ratio, reduced by 15%
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  subcategoryImage: {
    width: '100%',
    height: '100%',
  },
  subcategoryPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingScrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  trendingCard: {
    width: width * 0.6,
    height: width * 0.6 * 1.2,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginRight: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.text.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  trendingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  trendingStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  trendingStatText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.inverse,
    marginLeft: 2,
  },
  subcategoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  subcategoryTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  subcategoryCount: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.inverse,
    opacity: 0.9,
  },
  scenesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  sceneGridCard: {
    width: (width - spacing.xl * 2 - spacing.md) / 2,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sceneGridImage: {
    width: '100%',
    height: '100%',
  },
  sceneGridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sceneGridTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
