import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';

type GenderSelectionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GenderSelection'
>;
type GenderSelectionScreenRouteProp = RouteProp<RootStackParamList, 'GenderSelection'>;

export default function GenderSelectionScreen() {
  const navigation = useNavigation<GenderSelectionScreenNavigationProp>();
  const route = useRoute<GenderSelectionScreenRouteProp>();
  const { sceneId, sceneName, scenePrompt, sceneCategory } = route.params || {};
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Gender</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Choose Gender</Text>
          <Text style={styles.subtitle}>Select the gender for your AI image generation</Text>
        </View>

        <View style={styles.genderOptions}>
          <TouchableOpacity
            style={[styles.genderCard, selectedGender === 'male' && styles.genderCardSelected]}
            onPress={() => setSelectedGender('male')}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.genderIconWrapper,
                selectedGender === 'male' && styles.genderIconWrapperSelected,
              ]}
            >
              <Ionicons
                name="male"
                size={36}
                color={selectedGender === 'male' ? colors.text.inverse : colors.text.primary}
              />
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
            style={[styles.genderCard, selectedGender === 'female' && styles.genderCardSelected]}
            onPress={() => setSelectedGender('female')}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.genderIconWrapper,
                selectedGender === 'female' && styles.genderIconWrapperSelected,
              ]}
            >
              <Ionicons
                name="female"
                size={36}
                color={selectedGender === 'female' ? colors.text.inverse : colors.text.primary}
              />
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
            color={selectedGender ? colors.text.inverse : colors.text.tertiary}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? spacing.xs : spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 22,
  },
  genderOptions: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  genderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
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
  genderCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
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
  genderIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.lg,
  },
  genderIconWrapperSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    color: colors.text.primary,
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
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    gap: spacing.sm,
    width: '100%',
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
  continueButtonDisabled: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  continueButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.inverse,
  },
  continueButtonTextDisabled: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.tertiary,
  },
});
