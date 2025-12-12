import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { falAIService } from '../services/falAIService';
import { logger } from '../utils/logger';
import { databaseService } from '../services/databaseService';
import { useAuth } from '../contexts/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// Calculate max image height to fit in viewport (leave space for header, buttons, etc.)
const MAX_IMAGE_HEIGHT = SCREEN_HEIGHT * 0.4; // 40% of screen height

type EnhanceScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Enhance'>;

export default function EnhanceScreen() {
  const navigation = useNavigation<EnhanceScreenNavigationProp>();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [enhancing, setEnhancing] = useState(false);
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const requestPermission = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library access to enhance images.', [
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
        'Error requesting permission',
        error instanceof Error ? error : new Error('Unknown error')
      );
      Alert.alert('Error', 'Failed to request permission. Please try again.');
      return false;
    }
  };

  const pickImage = async () => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setEnhancedImageUrl(null); // Reset enhanced image when new image is selected
      }
    } catch (error) {
      logger.error(
        'Error picking image',
        error instanceof Error ? error : new Error('Unknown error')
      );
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleEnhance = async () => {
    if (!selectedImage) {
      Alert.alert('No Image Selected', 'Please select an image to enhance.');
      return;
    }

    try {
      setEnhancing(true);
      setProgress(0);
      setStatus('Starting enhancement...');
      setEnhancedImageUrl(null);

      // Enhance image using Fal AI Crystal Upscaler
      const result = await falAIService.enhanceImage({
        imageUrl: selectedImage,
        onProgress: (prog, stat) => {
          setProgress(prog);
          setStatus(stat);
        },
      });

      if (!result.image?.url) {
        throw new Error('No enhanced image returned');
      }

      setEnhancedImageUrl(result.image.url);
      setStatus('Enhancement complete!');

      // Save to Supabase Storage and Database if user is logged in
      if (user?.id) {
        try {
          // Import storage service dynamically to avoid circular dependencies
          const { storageService } = await import('../services/storageService');
          
          // Upload to Supabase Storage first
          const uploadResult = await storageService.uploadImageFromUrl(
            result.image.url,
            'enhanced-images',
            `${user.id}_${Date.now()}_enhanced.jpg`,
            user.id
          );

          let finalImageUrl = result.image.url;
          if (uploadResult.success) {
            finalImageUrl = uploadResult.publicUrl;
            logger.info('Enhanced image uploaded to Supabase Storage', {
              publicUrl: uploadResult.publicUrl,
              path: uploadResult.path,
            });
          } else {
            logger.warn('Failed to upload to storage, using original URL', {
              error: uploadResult.error,
            });
          }

          // Save to database with storage URL
          await databaseService.createImage({
            title: 'Enhanced Image',
            image_url: finalImageUrl,
            category: 'Enhanced',
            description: 'AI-enhanced image using Crystal Upscaler',
            user_id: user.id,
            likes: 0,
            views: 0,
          });
          logger.info('Enhanced image saved to Supabase Database', { imageUrl: finalImageUrl });
        } catch (dbError) {
          logger.warn('Failed to save enhanced image to Supabase (non-critical)', {
            error: dbError instanceof Error ? dbError.message : 'Unknown error',
          });
        }
      }

      Alert.alert('Success', 'Image enhanced successfully!');
    } catch (error: unknown) {
      logger.error(
        'Image enhancement failed',
        error instanceof Error ? error : new Error('Unknown error')
      );
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to enhance image. Please try again.';
      Alert.alert('Error', errorMessage);
      setStatus('Enhancement failed');
    } finally {
      setEnhancing(false);
    }
  };

  const handleViewResult = () => {
    if (enhancedImageUrl) {
      navigation.navigate('Generated', {
        imageUrl: enhancedImageUrl,
        generatedImages: [{ id: 'enhanced', url: enhancedImageUrl }],
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enhance Image</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="color-filter" size={64} color={colors.accent} />
          </View>
          <Text style={styles.title}>Enhance Your Image</Text>
          <Text style={styles.subtitle}>
            Improve image quality, enhance details, and upscale your photos using AI
          </Text>

          {/* Original Image */}
          {selectedImage && (
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Original Image</Text>
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.imagePreview}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => {
                    setSelectedImage(null);
                    setEnhancedImageUrl(null);
                  }}
                >
                  <Ionicons name="close-circle" size={32} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Enhanced Image */}
          {enhancedImageUrl && (
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Enhanced Image</Text>
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: enhancedImageUrl }}
                  style={styles.imagePreview}
                  resizeMode="contain"
                />
                <TouchableOpacity style={styles.downloadButton} onPress={handleViewResult}>
                  <Ionicons name="eye-outline" size={20} color={colors.text.inverse} />
                  <Text style={styles.downloadButtonText}>View Full Size</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Progress Indicator */}
          {enhancing && (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.progressText}>{status}</Text>
              <Text style={styles.progressPercent}>{progress}%</Text>
            </View>
          )}

          {/* Upload Button */}
          {!selectedImage && (
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage} activeOpacity={0.7}>
              <Ionicons name="cloud-upload-outline" size={48} color={colors.text.secondary} />
              <Text style={styles.uploadButtonText}>Select Image to Enhance</Text>
              <Text style={styles.uploadButtonSubtext}>JPG, PNG up to 10MB</Text>
            </TouchableOpacity>
          )}

          {/* Enhance Button */}
          {selectedImage && !enhancing && !enhancedImageUrl && (
            <TouchableOpacity
              style={styles.enhanceButton}
              onPress={handleEnhance}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles" size={20} color={colors.text.inverse} />
              <Text style={styles.enhanceButtonText}>Enhance Image</Text>
            </TouchableOpacity>
          )}

          {/* Enhance Again Button */}
          {enhancedImageUrl && (
            <TouchableOpacity
              style={styles.enhanceAgainButton}
              onPress={() => {
                setEnhancedImageUrl(null);
                handleEnhance();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={20} color={colors.accent} />
              <Text style={styles.enhanceAgainButtonText}>Enhance Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
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
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    lineHeight: typography.fontSize.base * 1.5,
  },
  imageSection: {
    width: '100%',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  imagePreviewContainer: {
    width: '100%',
    maxHeight: MAX_IMAGE_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.background + 'CC',
    borderRadius: 16,
  },
  downloadButton: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  downloadButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
  },
  progressText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  progressPercent: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  uploadButton: {
    width: '100%',
    minHeight: 200,
    maxHeight: MAX_IMAGE_HEIGHT,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginBottom: spacing.lg,
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
  enhanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    width: '100%',
    marginTop: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  enhanceButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
  enhanceAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    width: '100%',
    marginTop: spacing.md,
  },
  enhanceAgainButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.accent,
  },
});
