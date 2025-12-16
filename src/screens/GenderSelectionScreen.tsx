import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
// import { BlurView } from 'expo-blur'; // Disabled - using CSS-based glassmorphism instead
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type GenderSelectionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GenderSelection'
>;
type GenderSelectionScreenRouteProp = RouteProp<RootStackParamList, 'GenderSelection'>;

export default function GenderSelectionScreen() {
  const navigation = useNavigation<GenderSelectionScreenNavigationProp>();
  const route = useRoute<GenderSelectionScreenRouteProp>();
  const { sceneId, sceneName, scenePrompt, sceneCategory, sceneImage } = route.params || {};
  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedGender) {
      // Pass scene information if available (from SceneDetail)
      navigation.navigate('PhotoUpload', {
        gender: selectedGender,
        sceneId,
        sceneName,
        scenePrompt,
        sceneCategory,
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Full Screen Background - Image or Gradient */}
      {sceneImage ? (
        <Image
          source={{ uri: sceneImage }}
          style={styles.fullImage}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
      ) : (
        <LinearGradient
          colors={[colors.primary, colors.primary + 'DD', colors.primary + 'BB']}
          style={styles.fullImage}
        />
      )}

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
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Choose Gender</Text>
            <Text style={styles.subtitle}>Select the gender for your AI image generation</Text>
          </View>

          {/* Gender Options */}
          <View style={styles.genderOptions}>
            <TouchableOpacity
              onPress={() => setSelectedGender('male')}
              activeOpacity={0.8}
              style={[styles.genderCard, selectedGender === 'male' && styles.genderCardSelected]}
            >
              <View
                style={[
                  styles.genderIconWrapper,
                  selectedGender === 'male' && styles.genderIconWrapperSelected,
                ]}
              >
                <Ionicons name="male" size={36} color={colors.text.inverse} />
              </View>
              <View style={styles.genderInfo}>
                <Text
                  style={[
                    styles.genderLabel,
                    selectedGender === 'male' && styles.genderLabelSelected,
                  ]}
                >
                  Male
                </Text>
                {selectedGender === 'male' && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.text.inverse} />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedGender('female')}
              activeOpacity={0.8}
              style={[styles.genderCard, selectedGender === 'female' && styles.genderCardSelected]}
            >
              <View
                style={[
                  styles.genderIconWrapper,
                  selectedGender === 'female' && styles.genderIconWrapperSelected,
                ]}
              >
                <Ionicons name="female" size={36} color={colors.text.inverse} />
              </View>
              <View style={styles.genderInfo}>
                <Text
                  style={[
                    styles.genderLabel,
                    selectedGender === 'female' && styles.genderLabelSelected,
                  ]}
                >
                  Female
                </Text>
                {selectedGender === 'female' && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.text.inverse} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.continueButton, !selectedGender && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!selectedGender}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.continueButtonText,
                !selectedGender && styles.continueButtonTextDisabled,
              ]}
            >
              Continue
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={selectedGender ? colors.text.primary : colors.text.tertiary}
            />
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
  titleSection: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.inverse,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  genderOptions: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  genderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  genderCardSelected: {
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  genderIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginRight: spacing.lg,
    overflow: 'hidden',
  },
  genderIconWrapperSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  genderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  genderLabel: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.inverse,
  },
  genderLabelSelected: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.inverse,
  },
  checkmarkContainer: {
    marginLeft: spacing.sm,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text.inverse,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    gap: spacing.sm,
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
  continueButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  continueButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  continueButtonTextDisabled: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
