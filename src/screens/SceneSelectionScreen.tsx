import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { useSceneSelectionViewModel } from '../presentation/hooks/useSceneSelectionViewModel';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { useState, useEffect } from 'react';

type SceneSelectionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SceneSelection'
>;

type SceneSelectionScreenRouteProp = RouteProp<RootStackParamList, 'SceneSelection'>;

export default function SceneSelectionScreen() {
  const navigation = useNavigation<SceneSelectionScreenNavigationProp>();
  const route = useRoute<SceneSelectionScreenRouteProp>();
  const { gender, imageUri } = route.params;
  const { user } = useAuth();
  const [recommendedScenes, setRecommendedScenes] = useState<
    Array<{
      scene_id: string;
      scene_name: string;
      category: string;
      match_reason: string;
      match_score: number;
    }>
  >([]);
  const [_loadingRecommendations, setLoadingRecommendations] = useState(true);

  const {
    filteredScenes,
    categories,
    selectedCategory,
    selectedScene,
    loading,
    error,
    selectCategory,
    selectScene,
  } = useSceneSelectionViewModel();

  // Load user recommendations
  useEffect(() => {
    if (user?.id) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user?.id) {
      setLoadingRecommendations(false);
      return;
    }

    try {
      const { data, error: rpcError } = await supabase.rpc('get_user_recommendations', {
        user_id: user.id,
      });

      if (rpcError) {
        logger.error(
          'Failed to load recommendations',
          rpcError instanceof Error ? rpcError : new Error('Unknown error')
        );
        return;
      }

      setRecommendedScenes(data || []);
    } catch (error) {
      logger.error(
        'Failed to load recommendations',
        error instanceof Error ? error : new Error('Unknown error')
      );
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleContinue = () => {
    if (selectedScene) {
      navigation.navigate('Generating', {
        gender,
        imageUri,
        sceneId: selectedScene.id,
        sceneName: selectedScene.name,
        scenePrompt: selectedScene.promptTemplate || undefined,
        sceneCategory: selectedScene.category,
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading scenes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.loadingText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Scene</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Recommended for You Section */}
        {recommendedScenes.length > 0 && (
          <View style={styles.recommendedSection}>
            <View style={styles.recommendedHeader}>
              <Ionicons name="star" size={20} color={colors.accent} />
              <Text style={styles.recommendedTitle}>Recommended for You</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendedScrollContent}
            >
              {recommendedScenes.map((rec, index) => {
                // Find the actual scene from filteredScenes
                const scene = filteredScenes.find(s => s.id === rec.scene_id);
                if (!scene) return null;

                return (
                  <TouchableOpacity
                    key={`rec-${rec.scene_id}-${index}`}
                    style={[
                      styles.recommendedCard,
                      selectedScene?.id === scene.id && styles.recommendedCardSelected,
                    ]}
                    onPress={() => selectScene(scene)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.recommendedPreviewContainer}>
                      {scene.previewUrl ? (
                        <Image
                          source={{ uri: scene.previewUrl }}
                          style={styles.recommendedPreview}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.recommendedPreviewPlaceholder}>
                          <Ionicons name="image-outline" size={24} color={colors.text.secondary} />
                        </View>
                      )}
                    </View>
                    <View style={styles.recommendedInfo}>
                      <Text style={styles.recommendedName} numberOfLines={1}>
                        {scene.name}
                      </Text>
                      <Text style={styles.recommendedReason} numberOfLines={1}>
                        {rec.match_reason}
                      </Text>
                    </View>
                    {selectedScene?.id === scene.id && (
                      <View style={styles.recommendedSelectedBadge}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.text.inverse} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
          style={styles.categoryScroll}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipSelected,
              ]}
              onPress={() => selectCategory(category)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextSelected,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Scenes Grid */}
        <View style={styles.scenesGrid}>
          {filteredScenes.map(scene => (
            <TouchableOpacity
              key={scene.id}
              style={[styles.sceneCard, selectedScene?.id === scene.id && styles.sceneCardSelected]}
              onPress={() => selectScene(scene)}
              activeOpacity={0.7}
            >
              <View style={styles.scenePreviewContainer}>
                {scene.previewUrl ? (
                  <Image
                    source={{ uri: scene.previewUrl }}
                    style={styles.scenePreview}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.scenePreviewPlaceholder}>
                    <Ionicons name="image-outline" size={32} color={colors.text.secondary} />
                  </View>
                )}
              </View>
              <View style={styles.sceneOverlay}>
                {selectedScene?.id === scene.id && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.text.inverse} />
                  </View>
                )}
              </View>
              <View style={styles.sceneInfo}>
                <Text
                  style={[
                    styles.sceneName,
                    selectedScene?.id === scene.id && styles.sceneNameSelected,
                  ]}
                  numberOfLines={1}
                >
                  {scene.name}
                </Text>
                {scene.description && (
                  <Text style={styles.sceneDescription} numberOfLines={2}>
                    {scene.description}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Continue Button */}
      {selectedScene && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.text.inverse} />
          </TouchableOpacity>
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  categoryScroll: {
    marginBottom: spacing.lg,
  },
  categoryContainer: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  categoryChipTextSelected: {
    color: colors.text.inverse,
  },
  recommendedSection: {
    marginBottom: spacing.xl,
  },
  recommendedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  recommendedTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  recommendedScrollContent: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  recommendedCard: {
    width: 140,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  recommendedCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  recommendedPreviewContainer: {
    width: '100%',
    height: 140,
    backgroundColor: colors.surface,
  },
  recommendedPreview: {
    width: '100%',
    height: '100%',
  },
  recommendedPreviewPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendedInfo: {
    padding: spacing.sm,
  },
  recommendedName: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  recommendedReason: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  recommendedSelectedBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  scenesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sceneCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  scenePreviewContainer: {
    width: '100%',
    height: 120,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  sceneCardSelected: {
    borderColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  scenePreview: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
  },
  scenePreviewPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sceneOverlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  selectedBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  sceneInfo: {
    padding: spacing.md,
  },
  sceneName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sceneNameSelected: {
    color: colors.primary,
  },
  sceneDescription: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  continueButton: {
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
  continueButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.inverse,
  },
});
