import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { logger } from '../utils/logger';

type PhotoUploadScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PhotoUpload'>;

type PhotoUploadScreenRouteProp = RouteProp<RootStackParamList, 'PhotoUpload'>;

export default function PhotoUploadScreen() {
  const navigation = useNavigation<PhotoUploadScreenNavigationProp>();
  const route = useRoute<PhotoUploadScreenRouteProp>();
  const { gender, sceneId, sceneName, scenePrompt, sceneCategory } = route.params;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const requestPermission = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library access to upload images.', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync(),
          },
        ]);
        return false;
      }
      return true;
    } catch (error) {
      logger.error(
        'Permission request failed',
        error instanceof Error ? error : new Error('Unknown error')
      );
      Alert.alert('Error', 'Failed to request permission. Please try again.');
      return false;
    }
  };

  const requestCameraPermission = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera access to take photos.', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => ImagePicker.requestCameraPermissionsAsync(),
          },
        ]);
        return false;
      }
      return true;
    } catch (error) {
      logger.error(
        'Camera permission request failed',
        error instanceof Error ? error : new Error('Unknown error')
      );
      Alert.alert('Error', 'Failed to request camera permission. Please try again.');
      return false;
    }
  };

  const pickImage = async () => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      logger.error(
        'Image picker failed',
        error instanceof Error ? error : new Error('Unknown error')
      );
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      logger.error('Camera failed', error instanceof Error ? error : new Error('Unknown error'));
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleContinue = () => {
    if (selectedImage) {
      // If scene information exists (from SceneDetail), skip SceneSelection and go directly to Generating
      if (sceneId && sceneName) {
        navigation.navigate('Generating', {
          gender,
          imageUri: selectedImage,
          sceneId,
          sceneName,
          scenePrompt: scenePrompt || '',
          sceneCategory: sceneCategory || '',
        });
      } else {
        // If no scene info, go to SceneSelection to choose a scene
        navigation.navigate('SceneSelection', {
          gender,
          imageUri: selectedImage,
        });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Photo</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="image-outline" size={64} color={colors.accent} />
        </View>
        <Text style={styles.title}>Upload Your Photo</Text>
        <Text style={styles.subtitle}>Select a photo to use for AI image generation</Text>

        {selectedImage ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.imagePreview}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
            <TouchableOpacity style={styles.removeButton} onPress={() => setSelectedImage(null)}>
              <Ionicons name="close-circle" size={32} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadSection}>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage} activeOpacity={0.7}>
              <Ionicons name="cloud-upload-outline" size={48} color={colors.text.secondary} />
              <Text style={styles.uploadButtonText}>Tap to Upload</Text>
              <Text style={styles.uploadButtonSubtext}>JPG, PNG up to 10MB</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraButton} onPress={takePhoto} activeOpacity={0.7}>
              <Ionicons name="camera-outline" size={20} color={colors.text.primary} />
              <Text style={styles.cameraButtonText}>Take Photo with Camera</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.continueButton, !selectedImage && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedImage}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.continueButtonText, !selectedImage && styles.continueButtonTextDisabled]}
          >
            Continue
          </Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={selectedImage ? colors.text.inverse : colors.text.tertiary}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
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
  uploadSection: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  uploadButton: {
    width: '100%',
    height: 280,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  uploadButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  uploadButtonSubtext: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    width: '100%',
  },
  cameraButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
  },
  imagePreviewContainer: {
    width: 280,
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: spacing['2xl'],
    position: 'relative',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 16,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    gap: spacing.sm,
    width: '100%',
    maxWidth: 280,
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
  continueButtonDisabled: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  continueButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
  continueButtonTextDisabled: {
    color: colors.text.tertiary,
  },
});
