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

type SceneSelectionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SceneSelection'
>;

type SceneSelectionScreenRouteProp = RouteProp<RootStackParamList, 'SceneSelection'>;

export default function SceneSelectionScreen() {
  const navigation = useNavigation<SceneSelectionScreenNavigationProp>();
  const route = useRoute<SceneSelectionScreenRouteProp>();
  const { gender, imageUri } = route.params;

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
