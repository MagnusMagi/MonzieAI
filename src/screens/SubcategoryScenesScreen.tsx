import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { useFadeIn } from '../hooks/useFadeIn';

const { width } = Dimensions.get('window');

type SubcategoryScenesScreenRouteProp = RouteProp<RootStackParamList, 'SubcategoryScenes'>;
type SubcategoryScenesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SubcategoryScenes'
>;

interface SceneItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  previewUrl?: string;
  promptTemplate?: string;
}

export default function SubcategoryScenesScreen() {
  const navigation = useNavigation<SubcategoryScenesScreenNavigationProp>();
  const route = useRoute<SubcategoryScenesScreenRouteProp>();
  const { categoryId, subcategoryName, scenes } = route.params;
  const fadeAnim = useFadeIn(400);

  const [imageStates, setImageStates] = useState<{ [key: string]: { loading: boolean } }>({});

  const handleImageLoadStart = useCallback((id: string) => {
    setImageStates(prev => ({ ...prev, [id]: { loading: true } }));
  }, []);

  const handleImageLoadEnd = useCallback((id: string) => {
    setImageStates(prev => ({ ...prev, [id]: { loading: false } }));
  }, []);

  const handleScenePress = useCallback(
    (scene: SceneItem) => {
      navigation.navigate('SceneDetail', {
        image:
          scene.previewUrl ||
          'https://via.placeholder.com/400x600?text=' + encodeURIComponent(scene.name),
        title: scene.name,
        description: scene.description,
        likes: 0,
        sceneId: scene.id,
        sceneName: scene.name,
        scenePrompt: scene.promptTemplate,
        sceneCategory: scene.category,
      });
    },
    [navigation]
  );

  const renderSceneCard = useCallback(
    ({ item: scene }: { item: SceneItem }) => {
      return (
        <TouchableOpacity
          style={styles.sceneCard}
          onPress={() => handleScenePress(scene)}
          activeOpacity={0.7}
        >
          {scene.previewUrl ? (
            <Image
              source={{ uri: scene.previewUrl }}
              style={styles.sceneImage}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              placeholderContentFit="cover"
            />
          ) : (
            <View style={styles.scenePlaceholder}>
              <Ionicons name="image-outline" size={32} color={colors.text.secondary} />
            </View>
          )}
          {imageStates[scene.id]?.loading && (
            <View style={styles.imageLoader} pointerEvents="none">
              <ActivityIndicator size="small" color={colors.text.inverse} />
            </View>
          )}
          <View style={styles.sceneOverlay} pointerEvents="none">
            <Text style={styles.sceneTitle} numberOfLines={2}>
              {scene.name}
            </Text>
            {scene.description &&
              scene.description !== scene.promptTemplate &&
              !scene.description.includes('{gender}') && (
                <Text style={styles.sceneDescription} numberOfLines={2}>
                  {scene.description}
                </Text>
              )}
          </View>
        </TouchableOpacity>
      );
    },
    [handleScenePress, handleImageLoadStart, handleImageLoadEnd, imageStates]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {subcategoryName}
          </Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Scenes</Text>
          <Text style={styles.sectionSubtitle}>
            {scenes.length} scene{scenes.length !== 1 ? 's' : ''}
          </Text>

          {scenes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="image-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>No scenes found</Text>
            </View>
          ) : (
            <FlatList
              data={scenes}
              renderItem={renderSceneCard}
              keyExtractor={item => item.id}
              numColumns={2}
              contentContainerStyle={styles.listContent}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  listContent: {
    paddingBottom: spacing['3xl'],
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sceneCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    height: 240,
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
  scenePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
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
  sceneTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  sceneDescription: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.inverse,
    opacity: 0.9,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
});
