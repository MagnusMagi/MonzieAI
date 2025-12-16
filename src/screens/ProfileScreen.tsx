import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { SubscriptionRepository, Subscription } from '../data/repositories/SubscriptionRepository';
import { logger } from '../utils/logger';
import { supabase } from '../config/supabase';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const menuItems = [
  { id: 'profile', title: 'My Profile', icon: 'person-outline' },
  { id: 'subscription', title: 'Subscription', icon: 'diamond-outline' },
  { id: 'favorites', title: 'Favorites', icon: 'heart-outline' },
  { id: 'history', title: 'History', icon: 'time-outline' },
  { id: 'settings', title: 'Settings', icon: 'settings-outline' },
  { id: 'help', title: 'Help & Support', icon: 'help-circle-outline' },
  { id: 'about', title: 'About', icon: 'information-circle-outline' },
];

const quickAccessItems = [
  { id: 'gallery', title: 'Gallery', icon: 'images', subtitle: 'View all images' },
  { id: 'enhance', title: 'Enhance', icon: 'color-filter', subtitle: 'Improve existing' },
];

const subscriptionRepository = new SubscriptionRepository();

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, signOut, updateUser } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [_loadingSubscription, setLoadingSubscription] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null);

  // Get user display name
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';

  // Load subscription status
  useEffect(() => {
    loadSubscription();
  }, [user]);

  const loadSubscription = async () => {
    if (!user?.id) {
      setLoadingSubscription(false);
      return;
    }

    try {
      const sub = await subscriptionRepository.getUserSubscription(user.id);
      setSubscription(sub);
    } catch (error) {
      logger.error(
        'Failed to load subscription for profile',
        error instanceof Error ? error : new Error('Unknown error')
      );
      // Don't show error to user, just don't show premium badge
    } finally {
      setLoadingSubscription(false);
    }
  };

  // Check if user has active premium subscription
  const isPremium = subscription && subscription.status === 'active';

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
          if (fileExt === 'jpg') {
            fileExt = 'jpeg';
          }
          const fileName = `${user?.id}_${Date.now()}.${fileExt === 'jpeg' ? 'jpg' : fileExt}`;

          logger.debug('Starting image upload', { fileName, imageUri, fileExt });

          // Read file as base64 using expo-file-system
          const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          if (base64.length === 0) {
            throw new Error('Base64 file is empty');
          }

          // Convert base64 to ArrayBuffer
          const arrayBuffer = decode(base64);

          if (arrayBuffer.byteLength === 0) {
            throw new Error('ArrayBuffer is empty - conversion failed');
          }

          // Upload to Supabase Storage
          const mimeType = fileExt === 'jpeg' ? 'image/jpeg' : `image/${fileExt}`;
          const { error: uploadError } = await supabase.storage
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
              { fileName, fileExt }
            );
            Alert.alert('Error', 'Failed to upload image. Please try again.');
            setUploadingImage(false);
            setPreviewAvatarUrl(null);
            return;
          }

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from('avatars').getPublicUrl(fileName);

          logger.debug('Image uploaded successfully', { publicUrl, fileName });

          // Update user profile with new avatar URL
          await updateUser({ avatar_url: publicUrl });

          logger.info('Profile picture updated successfully', { userId: user?.id });
        } catch (error) {
          logger.error(
            'Error uploading profile picture',
            error instanceof Error ? error : new Error(String(error))
          );
          Alert.alert('Error', 'Failed to upload image. Please try again.');
        } finally {
          setUploadingImage(false);
          setPreviewAvatarUrl(null);
        }
      }
    } catch (error) {
      logger.error(
        'Error picking image',
        error instanceof Error ? error : new Error(String(error))
      );
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      setUploadingImage(false);
      setPreviewAvatarUrl(null);
    }
  };

  const handleMenuItemPress = (itemId: string) => {
    switch (itemId) {
      case 'profile':
        navigation.navigate('MyProfile');
        break;
      case 'subscription':
        navigation.navigate('Subscription');
        break;
      case 'favorites':
        navigation.navigate('Favorites');
        break;
      case 'history':
        navigation.navigate('History');
        break;
      case 'gallery':
        navigation.navigate('Gallery');
        break;
      case 'enhance':
        navigation.navigate('Enhance');
        break;
      case 'settings':
        navigation.navigate('Settings');
        break;
      case 'help':
        navigation.navigate('Help');
        break;
      case 'about':
        navigation.navigate('About');
        break;
      case 'revenuecat':
        navigation.navigate('RevenueCatTest');
        break;
      case 'logout':
        // Sign out and navigate to Auth
        signOut().then(() => {
          navigation.navigate('Auth');
        });
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handlePickImage}
            disabled={uploadingImage}
            activeOpacity={0.7}
          >
            {previewAvatarUrl || user?.avatar_url ? (
              <View style={styles.avatarImageContainer}>
                {uploadingImage && (
                  <View style={styles.avatarLoadingOverlay}>
                    <ActivityIndicator size="small" color={colors.text.inverse} />
                  </View>
                )}
                <Image
                  source={{ uri: previewAvatarUrl || user?.avatar_url }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                  onError={error => {
                    logger.error(
                      'Profile avatar image load failed',
                      error instanceof Error ? error : new Error('Unknown error')
                    );
                  }}
                />
              </View>
            ) : (
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color={colors.text.secondary} />
                {uploadingImage && (
                  <View style={styles.avatarLoadingOverlay}>
                    <ActivityIndicator size="small" color={colors.text.inverse} />
                  </View>
                )}
              </View>
            )}
            <View style={styles.avatarEditIcon}>
              <Ionicons name="camera" size={16} color={colors.text.inverse} />
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            {displayEmail ? <Text style={styles.profileEmail}>{displayEmail}</Text> : null}
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={14} color={colors.text.inverse} />
                <Text style={styles.premiumText}>Premium Member</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Access Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            {quickAccessItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.quickAccessCard}
                onPress={() => handleMenuItemPress(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.quickAccessIconContainer}>
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color={colors.accent}
                  />
                </View>
                <Text style={styles.quickAccessTitle}>{item.title}</Text>
                <Text style={styles.quickAccessSubtitle}>{item.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.menuGrid}>
            {menuItems.slice(0, 4).map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuGridItem}
                onPress={() => handleMenuItemPress(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemIconBackground}>
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color={colors.text.primary}
                  />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* More Options Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More</Text>
          <View style={styles.menuList}>
            {menuItems.slice(4).map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuListItem}
                onPress={() => handleMenuItemPress(item.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.menuItemIconBackground, styles.menuListItemIcon]}>
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color={colors.text.primary}
                  />
                </View>
                <Text style={styles.menuListItemText}>{item.title}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.text.tertiary}
                  style={styles.menuListArrow}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* RevenueCat Test Button */}
        <TouchableOpacity
          style={styles.revenueCatButton}
          onPress={() => handleMenuItemPress('revenuecat')}
          activeOpacity={0.7}
        >
          <Ionicons name="code-working-outline" size={22} color={colors.primary} />
          <Text style={styles.revenueCatButtonText}>RevenueCat</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => handleMenuItemPress('logout')}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
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
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  avatarContainer: {
    marginBottom: 0,
    position: 'relative',
  },
  avatarImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: colors.background,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    zIndex: 1,
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  profileInfo: {
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  profileName: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 16,
    gap: spacing.xs,
    alignSelf: 'flex-start',
    ...Platform.select({
      ios: {
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  premiumText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    alignItems: 'center',
  },
  quickAccessIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  quickAccessTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: 2,
    textAlign: 'center',
  },
  quickAccessSubtitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  menuGridItem: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    alignItems: 'center',
  },
  menuItemIconBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  menuItemText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    textAlign: 'center',
  },
  menuList: {
    gap: spacing.xs,
  },
  menuListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  menuListArrow: {
    marginLeft: 'auto',
  },
  menuListItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: spacing.sm,
    marginBottom: 0,
  },
  menuListItemText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
    flex: 1,
  },
  revenueCatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  revenueCatButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    gap: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  logoutButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.error,
  },
});
