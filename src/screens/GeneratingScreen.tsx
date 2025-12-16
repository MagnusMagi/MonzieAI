import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Platform, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
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

  // Animated values using React Native Animated API
  const gradientRotationAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Use ViewModel hook for business logic
  const { progress, status, error, generatedImage, generateImage, reset } =
    useGeneratingViewModel();

  // Animate mesh gradient rotation
  useEffect(() => {
    const rotationAnimation = Animated.loop(
      Animated.timing(gradientRotationAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    );
    rotationAnimation.start();
    return () => rotationAnimation.stop();
  }, []);

  // Update progress with smooth animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress / 100,
      duration: 500,
      useNativeDriver: false, // width animation doesn't support native driver
    }).start();
  }, [progress]);

  // Haptic feedback at milestones
  useEffect(() => {
    if (Platform.OS === 'ios') {
      if (progress === 25 || progress === 50 || progress === 75) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (progress === 100) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [progress]);

  useEffect(() => {
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

  // Animated styles for mesh gradient rotation
  const gradientRotation = gradientRotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Mesh Gradient Background with Rotation */}
      <View style={styles.gradientContainer}>
        {/* Base gradient layer */}
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb', '#4facfe']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Rotating mesh gradient layers */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [{ rotate: gradientRotation }],
            },
          ]}
        >
          <LinearGradient
            colors={['#f093fb', 'transparent', '#4facfe', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [
                {
                  rotate: gradientRotationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '-360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['transparent', '#764ba2', 'transparent', '#667eea']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [
                {
                  rotate: gradientRotationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#4facfe', 'transparent', '#f093fb', 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Generating Your Image</Text>
        <Text style={styles.subtitle}>Our AI is creating something amazing for you...</Text>

        {/* Enhanced Progress Container */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            >
              <LinearGradient
                colors={['#fff', '#f0f0f0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
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
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    zIndex: 1,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.inverse,
    marginBottom: spacing.md,
    textAlign: 'center',
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
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.inverse,
    opacity: 0.9,
    marginBottom: spacing['2xl'],
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.inverse,
    opacity: 0.9,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  progressPercent: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.inverse,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
