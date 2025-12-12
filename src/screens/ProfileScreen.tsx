import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
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
import { SubscriptionRepository, Subscription } from '../data/repositories/SubscriptionRepository';
import { logger } from '../utils/logger';

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

const subscriptionRepository = new SubscriptionRepository();

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, signOut } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

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
      case 'settings':
        navigation.navigate('Settings');
        break;
      case 'help':
        navigation.navigate('Help');
        break;
      case 'about':
        navigation.navigate('About');
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
          <View style={styles.avatarContainer}>
            {user?.avatar_url ? (
              <View style={styles.avatarImageContainer}>
                <Image
                  source={{ uri: user.avatar_url }}
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
                <Ionicons name="person" size={32} color={colors.text.secondary} />
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{displayName}</Text>
          {displayEmail ? <Text style={styles.profileEmail}>{displayEmail}</Text> : null}
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={14} color={colors.text.primary} />
              <Text style={styles.premiumText}>Premium Member</Text>
            </View>
          )}
        </View>

        {/* Quick Access Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
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

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => handleMenuItemPress('logout')}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.text.primary} />
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
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatarImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  profileName: {
    fontSize: typography.fontSize.lg,
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
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  premiumText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
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
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  menuItemIconBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
  },
});
