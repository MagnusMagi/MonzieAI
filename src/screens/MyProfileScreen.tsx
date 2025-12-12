import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../config/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import Constants from 'expo-constants';
import { decode } from 'base64-arraybuffer';
import { logger } from '../utils/logger';

type MyProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyProfile'>;

export default function MyProfileScreen() {
  const navigation = useNavigation<MyProfileScreenNavigationProp>();
  const { user, updateUser, loading: authLoading } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState(''); // Local preview URL
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0); // Force re-render key

  // Initialize edit form when modal opens or user data changes (but not during editing)
  React.useEffect(() => {
    if (user && !editModalVisible) {
      // Only update when modal is closed to avoid overwriting user's edits
      setEditName(user.name || '');
      setEditAvatarUrl(user.avatar_url || '');
      setPreviewAvatarUrl(user.avatar_url || '');
      // Force avatar re-render when user data changes
      if (user.avatar_url) {
        setAvatarKey(prev => prev + 1);
      }
      logger.debug('User data updated in form (modal closed)', {
        name: user.name,
        avatar_url: user.avatar_url,
        avatarKey,
      });
    }
  }, [user, editModalVisible]);

  // Note: Form initialization is handled in handleEditProfile to avoid conflicts

  // Format member since date
  const formatMemberSince = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleEditProfile = () => {
    if (user) {
      // Initialize form with current user data when opening modal
      const currentName = user.name || '';
      const currentAvatarUrl = user.avatar_url || '';
      setEditName(currentName);
      setEditAvatarUrl(currentAvatarUrl);
      setPreviewAvatarUrl(currentAvatarUrl);
      logger.debug('Opening edit modal', {
        name: currentName,
        avatar_url: currentAvatarUrl,
      });
      setEditModalVisible(true);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant photo library access to upload a profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;

        // Show selected image immediately (local URI for preview)
        setPreviewAvatarUrl(imageUri);
        setUploadingImage(true);

        try {
          // Upload to Supabase Storage
          let fileExt = imageUri.split('.').pop() || 'jpg';
          // Supabase Storage requires 'jpeg' not 'jpg' for MIME type
          if (fileExt === 'jpg') {
            fileExt = 'jpeg';
          }
          const fileName = `${user?.id}_${Date.now()}.${fileExt === 'jpeg' ? 'jpg' : fileExt}`; // Keep .jpg extension but use jpeg MIME type

          logger.debug('Starting image upload', { fileName, imageUri, fileExt });

          // Read file as base64 using expo-file-system
          const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          logger.debug('File read for upload', { size: base64.length });

          if (base64.length === 0) {
            throw new Error('Base64 file is empty');
          }

          // Convert base64 to ArrayBuffer using base64-arraybuffer library (React Native compatible)
          const arrayBuffer = decode(base64);

          logger.debug('ArrayBuffer created for upload', { size: arrayBuffer.byteLength });

          if (arrayBuffer.byteLength === 0) {
            throw new Error('ArrayBuffer is empty - conversion failed');
          }

          // Upload to Supabase using ArrayBuffer (Supabase Storage SDK supports ArrayBuffer)
          // Use 'jpeg' for MIME type even if extension is 'jpg'
          const mimeType = fileExt === 'jpeg' ? 'image/jpeg' : `image/${fileExt}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, arrayBuffer, {
              contentType: mimeType,
              upsert: true,
              cacheControl: '3600',
            });

          if (uploadError) {
            logger.error(
              'Image upload failed',
              uploadError instanceof Error ? uploadError : new Error(String(uploadError)),
              {
                fileName,
                fileExt,
              }
            );
            setUploadingImage(false);
            Alert.alert('Upload Failed', `Failed to upload image: ${uploadError.message}`, [
              { text: 'OK' },
            ]);
            setPreviewAvatarUrl(''); // Clear preview on failure
            return;
          }

          logger.info('Image upload successful', { path: uploadData.path });

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from('avatars').getPublicUrl(fileName);

          logger.debug('Public URL generated', { publicUrl });

          // Update both states with Supabase URL
          // Use functional updates to ensure we're using latest state
          setEditAvatarUrl(prev => {
            logger.debug('Updating editAvatarUrl', { newUrl: publicUrl, previous: prev });
            return publicUrl;
          });
          setPreviewAvatarUrl(prev => {
            logger.debug('Updating previewAvatarUrl', { newUrl: publicUrl, previous: prev });
            return publicUrl;
          });

          // Verify state was set
          setTimeout(() => {
            logger.debug('State after upload', { editAvatarUrl, previewAvatarUrl });
          }, 100);
        } catch (uploadError: unknown) {
          logger.error(
            'Upload exception',
            uploadError instanceof Error ? uploadError : new Error(String(uploadError))
          );
          setUploadingImage(false);
          Alert.alert('Upload Failed', 'Failed to upload image to server. Please try again.', [
            { text: 'OK' },
          ]);
          setPreviewAvatarUrl(''); // Clear preview on failure
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error: unknown) {
      setUploadingImage(false);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload image. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    if (!editName.trim()) {
      Alert.alert('Error', 'Please enter a name.');
      return;
    }

    try {
      setSaving(true);

      // Debug: Log what we're trying to save
      logger.debug('Saving profile', {
        name: editName.trim(),
        avatar_url: editAvatarUrl,
        hasAvatarUrl: !!editAvatarUrl,
      });

      // Only include avatar_url if it's not empty
      const updates: { name: string; avatar_url?: string } = {
        name: editName.trim(),
      };

      if (editAvatarUrl && editAvatarUrl.trim()) {
        updates.avatar_url = editAvatarUrl.trim();
      }

      logger.debug('Profile updates', updates);

      await updateUser(updates);

      logger.info('Profile update successful', { avatar_url: updates.avatar_url });

      // Force avatar re-render
      setAvatarKey(prev => prev + 1);

      // Close modal first
      setEditModalVisible(false);

      // Wait for state to propagate and show success
      setTimeout(() => {
        Alert.alert('Success', 'Profile updated successfully!');
        // Force another re-render after alert
        setAvatarKey(prev => prev + 1);
        // Force a re-render by logging current user state
        logger.debug('User state after update', {
          id: user?.id,
          name: user?.name,
          avatar_url: user?.avatar_url,
          avatarKey,
        });
      }, 500);
    } catch (error: unknown) {
      logger.error(
        'Profile update failed',
        error instanceof Error ? error : new Error(String(error))
      );
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update profile. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const memberSince = formatMemberSince(user?.created_at);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          {user?.avatar_url && user.avatar_url.trim() ? (
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: user.avatar_url,
                  cache: 'reload',
                }}
                style={styles.avatarImage}
                resizeMode="cover"
                key={`${user.avatar_url}-${avatarKey}`} // Force re-render when URL or key changes
                onError={(error: { nativeEvent?: { error?: Error } }) => {
                  const errorObj = error?.nativeEvent?.error || new Error('Image load failed');
                  logger.error('Avatar image load failed', errorObj, {
                    avatar_url: user.avatar_url,
                      avatarKey,
                    }
                  );
                  // Don't use JSON.stringify on error objects - they may have circular references
                  if (error) {
                    logger.debug('Error details', {
                      errorType: typeof error,
                      errorKeys: Object.keys(error || {}),
                    });
                  }
                }}
                onLoad={() => {
                  logger.debug('Avatar image loaded successfully', {
                    avatar_url: user.avatar_url,
                    avatarKey,
                  });
                }}
              />
            </View>
          ) : (
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={colors.text.secondary} />
            </View>
          )}
          <Text style={styles.name}>{displayName}</Text>
          {displayEmail ? <Text style={styles.email}>{displayEmail}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Display Name</Text>
            <Text style={styles.infoValue}>{displayName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{displayEmail}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>{memberSince}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditProfile}
          disabled={authLoading}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="fade"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity
                onPress={handleSaveProfile}
                style={styles.modalSaveButton}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* Avatar Section */}
              <View style={styles.modalAvatarSection}>
                {previewAvatarUrl || editAvatarUrl ? (
                  <View style={styles.modalAvatarContainer}>
                    <Image
                      source={{
                        uri: previewAvatarUrl || editAvatarUrl,
                        cache: 'reload', // Force reload to avoid cache issues
                      }}
                      style={styles.modalAvatarImage}
                      resizeMode="cover"
                      onError={(error: unknown) => {
                        logger.error(
                          'Modal avatar image load failed',
                          error instanceof Error ? error : new Error(String(error)),
                          {
                            previewAvatarUrl,
                            editAvatarUrl,
                          }
                        );
                        // Don't use JSON.stringify on error objects - they may have circular references
                        if (error) {
                          logger.debug('Error details', {
                            errorType: typeof error,
                            errorKeys: Object.keys(error || {}),
                          });
                        }
                        // Don't clear URLs on error - might be temporary network issue
                      }}
                      onLoad={() => {
                        logger.debug('Modal avatar image loaded', {
                          url: previewAvatarUrl || editAvatarUrl,
                        });
                      }}
                    />
                    {uploadingImage && (
                      <View style={styles.uploadingOverlay}>
                        <ActivityIndicator size="small" color={colors.text.inverse || '#FFFFFF'} />
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.modalAvatar}>
                    <Ionicons name="person" size={48} color={colors.text.secondary} />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.changePhotoButton}
                  onPress={handlePickImage}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={styles.changePhotoText}>Uploading...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="camera" size={18} color={colors.primary} />
                      <Text style={styles.changePhotoText}>Change Photo</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Name Input */}
              <View style={styles.modalInputSection}>
                <Text style={styles.modalInputLabel}>Display Name</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.text.tertiary}
                  autoCapitalize="words"
                />
              </View>

              {/* Email (Read-only) */}
              <View style={styles.modalInputSection}>
                <Text style={styles.modalInputLabel}>Email</Text>
                <View style={styles.modalInputDisabled}>
                  <Text style={styles.modalInputDisabledText}>{displayEmail}</Text>
                </View>
                <Text style={styles.modalInputHint}>Email cannot be changed</Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  editButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  editButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  modalSaveButton: {
    padding: spacing.xs,
    minWidth: 60,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: spacing.lg,
  },
  modalAvatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalAvatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  modalAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  modalAvatarImage: {
    width: '100%',
    height: '100%',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  changePhotoText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  modalInputSection: {
    marginBottom: spacing.lg,
  },
  modalInputLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
  },
  modalInputDisabled: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    opacity: 0.6,
  },
  modalInputDisabledText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  modalInputHint: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});
