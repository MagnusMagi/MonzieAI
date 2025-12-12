import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';

type ChangelogScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Changelog'>;

interface ChangelogItem {
  version: string;
  type: 'major' | 'minor' | 'patch';
  date: string;
  changes: string[];
}

const changelogData: ChangelogItem[] = [
  {
    version: '1.0.0',
    type: 'major',
    date: 'January 15, 2024',
    changes: [
      'Initial release of MonzieAI',
      'AI image generation feature',
      'Image enhancement tools',
      'User authentication system',
      'Premium subscription plans',
    ],
  },
  {
    version: '0.9.0',
    type: 'minor',
    date: 'January 10, 2024',
    changes: [
      'Added favorites functionality',
      'Improved image processing speed',
      'Enhanced user interface',
      'Added history tracking',
    ],
  },
  {
    version: '0.8.1',
    type: 'patch',
    date: 'January 5, 2024',
    changes: ['Fixed image loading issues', 'Improved error handling', 'Performance optimizations'],
  },
  {
    version: '0.8.0',
    type: 'minor',
    date: 'December 28, 2023',
    changes: [
      'Added profile management',
      'Settings screen implementation',
      'Help & support section',
    ],
  },
  {
    version: '0.7.2',
    type: 'patch',
    date: 'December 20, 2023',
    changes: ['Bug fixes in navigation', 'UI improvements'],
  },
];

const getVersionTypeColor = (type: 'major' | 'minor' | 'patch') => {
  switch (type) {
    case 'major':
      return colors.accent;
    case 'minor':
      return colors.primary;
    case 'patch':
      return colors.text.secondary;
    default:
      return colors.text.secondary;
  }
};

const getVersionTypeLabel = (type: 'major' | 'minor' | 'patch') => {
  switch (type) {
    case 'major':
      return 'Major';
    case 'minor':
      return 'Minor';
    case 'patch':
      return 'Patch';
    default:
      return '';
  }
};

export default function ChangelogScreen() {
  const navigation = useNavigation<ChangelogScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Changelog</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introSection}>
          <Ionicons name="document-text-outline" size={48} color={colors.accent} />
          <Text style={styles.introTitle}>Version History</Text>
          <Text style={styles.introSubtitle}>Track all updates and improvements to MonzieAI</Text>
        </View>

        <View style={styles.changelogList}>
          {changelogData.map((item, index) => (
            <View key={index} style={styles.versionCard}>
              <View style={styles.versionHeader}>
                <View style={styles.versionInfo}>
                  <Text style={styles.versionNumber}>{item.version}</Text>
                  <View
                    style={[
                      styles.versionTypeBadge,
                      { backgroundColor: getVersionTypeColor(item.type) + '15' },
                    ]}
                  >
                    <Text
                      style={[styles.versionTypeText, { color: getVersionTypeColor(item.type) }]}
                    >
                      {getVersionTypeLabel(item.type)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.versionDate}>{item.date}</Text>
              </View>

              <View style={styles.changesList}>
                {item.changes.map((change, changeIndex) => (
                  <View key={changeIndex} style={styles.changeItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={getVersionTypeColor(item.type)}
                      style={styles.changeIcon}
                    />
                    <Text style={styles.changeText}>{change}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
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
  introSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  introTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  introSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  changelogList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  versionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  versionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  versionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  versionNumber: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  versionTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 8,
  },
  versionTypeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
  },
  versionDate: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  changesList: {
    gap: spacing.xs,
  },
  changeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  changeIcon: {
    marginTop: 2,
  },
  changeText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
    lineHeight: typography.fontSize.sm * 1.4,
  },
});
