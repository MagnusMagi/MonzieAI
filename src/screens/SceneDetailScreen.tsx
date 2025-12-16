import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type SceneDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SceneDetail'>;

type SceneDetailScreenRouteProp = RouteProp<RootStackParamList, 'SceneDetail'>;

export default function SceneDetailScreen() {
  const navigation = useNavigation<SceneDetailScreenNavigationProp>();
  const route = useRoute<SceneDetailScreenRouteProp>();
  const { image, title, description, likes, sceneId, sceneName, scenePrompt, sceneCategory } =
    route.params;

  // Filter out prompt template from description
  const displayDescription =
    description && description !== scenePrompt && !description.includes('{gender}')
      ? description
      : null;

  const handleGenerate = () => {
    // Pass scene information to GenderSelection if available
    navigation.navigate('GenderSelection', {
      sceneId,
      sceneName,
      scenePrompt,
      sceneCategory,
      sceneImage: image,
    });
  };

  return (
    <View style={styles.container}>
      {/* Full Screen Image */}
      <Image
        source={{ uri: image }}
        style={styles.fullImage}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />

      {/* Transparent Header */}
      <SafeAreaView style={styles.headerContainer} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.inverse} />
          </TouchableOpacity>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      {/* Transparent Content Overlay at Bottom */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.95)']}
        style={styles.contentOverlay}
        locations={[0, 0.3, 1]}
      >
        <SafeAreaView style={styles.contentSafeArea} edges={['bottom']}>
          {/* Title and Likes */}
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <View style={styles.likesContainer}>
              <Ionicons name="heart" size={18} color={colors.error} />
              <Text style={styles.likesText}>{likes}</Text>
            </View>
          </View>

          {/* Description */}
          {displayDescription && (
            <View style={styles.descriptionSection}>
              <Text style={styles.description} numberOfLines={1}>
                {displayDescription}
              </Text>
            </View>
          )}

          {/* Generate Button */}
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerate}
            activeOpacity={0.8}
          >
            <Text style={styles.generateButtonText}>Generate Image</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
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
  headerRight: {
    width: 40,
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
  likesContainer: {
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
  likesText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
  descriptionSection: {
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text.inverse,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    marginTop: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  generateButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
});
