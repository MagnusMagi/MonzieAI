import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Pressable,
  Image,
  Dimensions,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Platform,
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
import { Scene } from '../domain/entities/Scene';
import { useHomeViewModel } from '../presentation/hooks/useHomeViewModel';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';
import { useFadeIn } from '../hooks/useFadeIn';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const fadeAnim = useFadeIn(400);
  // Combined image state for better memory management
  const [imageStates, setImageStates] = useState<{
    [key: string]: { loading: boolean };
  }>({});
  const [refreshing, setRefreshing] = useState(false);

  // Use ViewModel hook for business logic
  const { scenes, loading, error, searchQuery, setSearchQuery, loadScenes, refresh } =
    useHomeViewModel();

  // Get user display name
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleImageLoadStart = useCallback((id: string) => {
    setImageStates(prev => ({
      ...prev,
      [id]: { loading: true },
    }));
  }, []);

  const handleImageLoadEnd = useCallback((id: string) => {
    setImageStates(prev => ({
      ...prev,
      [id]: { loading: false },
    }));
  }, []);

  const handleMenuPress = () => {
    navigation.navigate('Profile');
  };

  const handleScenePress = useCallback(
    (scene: Scene) => {
      navigation.navigate('SceneDetail', {
        image:
          scene.previewUrl ||
          'https://via.placeholder.com/400x600?text=' + encodeURIComponent(scene.name),
        title: scene.name,
        description: scene.description || undefined,
        likes: 0, // Scene'ler için likes yok, 0 olarak ayarlıyoruz
        sceneId: scene.id,
        sceneName: scene.name,
        scenePrompt: scene.promptTemplate || undefined,
        sceneCategory: scene.category,
      });
    },
    [navigation]
  );

  // Filter scenes based on search query
  const filteredScenes = useMemo(() => {
    if (!searchQuery) return scenes;
    const query = searchQuery.toLowerCase();
    return scenes.filter(
      scene =>
        scene.name.toLowerCase().includes(query) ||
        scene.description?.toLowerCase().includes(query) ||
        scene.category.toLowerCase().includes(query)
    );
  }, [scenes, searchQuery]);

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
          <Text style={styles.greeting}>{displayName} 👋</Text>
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
                resizeMode="cover"
                onError={(error) => {
                  logger.error(
                    'Home avatar image load failed',
                    error?.nativeEvent ? new Error('Image load error') : new Error('Unknown error'),
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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search scenes..."
          placeholderTextColor={colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
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
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Gallery')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="images" size={24} color={colors.accent} />
            </View>
            <Text style={styles.actionTitle}>Galeri</Text>
            <Text style={styles.actionSubtitle}>View all images</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Enhance')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="color-filter" size={24} color={colors.accent} />
            </View>
            <Text style={styles.actionTitle}>Enhance</Text>
            <Text style={styles.actionSubtitle}>Improve existing</Text>
          </TouchableOpacity>
        </View>

        {/* Realistic Scenes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="sparkles" size={20} color={colors.accent} />
              <Text style={styles.sectionTitle}>Realistic Scenes</Text>
            </View>
            <Text style={styles.sceneCount}>{scenes.length} scenes</Text>
          </View>

          {scenes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="image-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>No scenes found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try a different search term' : 'Scenes will appear here'}
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scenesContainer}
              nestedScrollEnabled={true}
            >
              {filteredScenes.map(scene => (
                <TouchableOpacity
                  key={scene.id}
                  style={styles.sceneCardWrapper}
                  onPress={() => handleScenePress(scene)}
                  activeOpacity={0.7}
                >
                  <View style={styles.sceneCard}>
                    <Image
                      source={{
                        uri:
                          scene.previewUrl ||
                          'https://via.placeholder.com/400x600?text=' + encodeURIComponent(scene.name),
                      }}
                      style={styles.sceneImage}
                      resizeMode="cover"
                      onLoadStart={() => handleImageLoadStart(scene.id + '_horizontal')}
                      onLoadEnd={() => handleImageLoadEnd(scene.id + '_horizontal')}
                      onLoad={() => handleImageLoadEnd(scene.id + '_horizontal')}
                    />
                    {imageStates[scene.id + '_horizontal']?.loading && (
                      <View style={styles.imageLoader} pointerEvents="none">
                        <ActivityIndicator size="small" color={colors.text.inverse} />
                      </View>
                    )}
                    <View style={styles.sceneOverlay} pointerEvents="none">
                      <View style={styles.sceneInfo}>
                        <Text style={styles.sceneTitle} numberOfLines={2}>
                          {scene.name}
                        </Text>
                        {scene.description && (
                          <Text style={styles.sceneDescription} numberOfLines={2}>
                            {scene.description}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Grid View for All Scenes */}
        {scenes.length > 0 && (
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
        )}
      </ScrollView>
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
  greeting: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  actionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  actionSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: spacing.xl,
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
  scenesContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    gap: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sceneCardWrapper: {
    marginRight: spacing.md,
  },
  sceneCard: {
    width: width * 0.7,
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sceneImage: {
    width: '100%',
    height: '100%',
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  sceneOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sceneInfo: {
    gap: spacing.xs,
  },
  sceneTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
  sceneDescription: {
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
