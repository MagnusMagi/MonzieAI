import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { useGeneratingViewModel } from '../presentation/hooks/useGeneratingViewModel';
import { useAuth } from '../contexts/AuthContext';
import { useFadeIn } from '../hooks/useFadeIn';

type GeneratingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Generating'>;

type GeneratingScreenRouteProp = RouteProp<RootStackParamList, 'Generating'>;

export default function GeneratingScreen() {
  const navigation = useNavigation<GeneratingScreenNavigationProp>();
  const route = useRoute<GeneratingScreenRouteProp>();
  const { gender, imageUri, sceneId, sceneName, scenePrompt, sceneCategory } = route.params;
  const { user } = useAuth();
  const fadeAnim = useFadeIn(400);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Use ViewModel hook for business logic
  const { progress, status, isGenerating, error, generatedImage, generateImage, reset } =
    useGeneratingViewModel();

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 30000, // 30 seconds max
      useNativeDriver: false,
    }).start();

    // Generate image using ViewModel
    generateImage({
      gender,
      imageUri,
      sceneId,
      sceneName,
      scenePrompt,
      sceneCategory,
      userId: user?.id,
    });

    return () => {
      reset();
    };
  }, []);

  // Handle generation completion - navigate to Generated screen to show the image
  useEffect(() => {
    if (generatedImage) {
      setTimeout(() => {
        // Navigate to Generated screen to show the created image
        navigation.replace('Generated', {
          imageUrl: generatedImage.imageUrl,
          generatedImages: [{ id: generatedImage.id, url: generatedImage.imageUrl }],
          imageId: generatedImage.id,
        });
      }, 1000);
    }
  }, [generatedImage, navigation]);

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert('Generation Failed', error || 'Failed to generate image. Please try again.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    }
  }, [error, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.iconContainer}>
          <Ionicons name="sparkles" size={80} color={colors.accent} />
        </View>
        <Text style={styles.title}>Generating Your Image</Text>
        <Text style={styles.subtitle}>Our AI is creating something amazing for you...</Text>

        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{status}</Text>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginBottom: spacing['2xl'],
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  loaderContainer: {
    marginBottom: spacing['2xl'],
  },
  progressContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  progressPercent: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});
