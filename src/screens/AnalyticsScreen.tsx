import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

type AnalyticsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Analytics'>;

interface CategoryStatistic {
  category: string;
  scene_count: number;
  used_scene_count: number;
  total_images: number;
  avg_likes: number;
  avg_views: number;
  total_likes: number;
  total_views: number;
}

export default function AnalyticsScreen() {
  const navigation = useNavigation<AnalyticsScreenNavigationProp>();
  const [categoryStats, setCategoryStats] = useState<CategoryStatistic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoryStatistics();
  }, []);

  const loadCategoryStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from('category_statistics')
        .select('*')
        .order('total_images', { ascending: false });

      if (error) {
        logger.error(
          'Failed to load category statistics',
          error instanceof Error ? error : new Error('Unknown error')
        );
        return;
      }

      setCategoryStats(data || []);
    } catch (error) {
      logger.error(
        'Failed to load category statistics',
        error instanceof Error ? error : new Error('Unknown error')
      );
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | string): string => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toFixed(0);
  };

  const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      professional: 'briefcase',
      travel: 'airplane',
      social_media: 'share-social',
      nostalgia: 'time',
      wedding: 'heart',
      fantasy: 'sparkles',
      sports: 'fitness',
      fashion: 'shirt',
      art: 'color-palette',
      funny: 'happy',
    };
    return iconMap[category] || 'stats-chart';
  };

  const getCategoryName = (category: string): string => {
    const nameMap: { [key: string]: string } = {
      professional: 'Professional',
      travel: 'Travel',
      social_media: 'Social Media',
      nostalgia: 'Nostalgia',
      wedding: 'Wedding',
      fantasy: 'Fantasy',
      sports: 'Sports',
      fashion: 'Fashion',
      art: 'Art',
      funny: 'Funny',
    };
    return nameMap[category] || category;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading statistics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Category Statistics</Text>
          <Text style={styles.sectionSubtitle}>Overview of image generation by category</Text>
        </View>

        {categoryStats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="stats-chart-outline" size={64} color={colors.text.secondary} />
            <Text style={styles.emptyText}>No statistics available</Text>
          </View>
        ) : (
          <View style={styles.statsList}>
            {categoryStats.map((stat, index) => (
              <View key={stat.category} style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={styles.statIconContainer}>
                    <Ionicons
                      name={getCategoryIcon(stat.category)}
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.statHeaderText}>
                    <Text style={styles.statCategoryName}>{getCategoryName(stat.category)}</Text>
                    <Text style={styles.statSubtitle}>
                      {stat.used_scene_count} of {stat.scene_count} scenes used
                    </Text>
                  </View>
                </View>

                <View style={styles.statMetrics}>
                  <View style={styles.statMetric}>
                    <Ionicons name="images" size={18} color={colors.accent} />
                    <Text style={styles.statMetricValue}>{formatNumber(stat.total_images)}</Text>
                    <Text style={styles.statMetricLabel}>Images</Text>
                  </View>
                  <View style={styles.statMetric}>
                    <Ionicons name="heart" size={18} color={colors.error} />
                    <Text style={styles.statMetricValue}>{formatNumber(stat.total_likes)}</Text>
                    <Text style={styles.statMetricLabel}>Likes</Text>
                  </View>
                  <View style={styles.statMetric}>
                    <Ionicons name="eye" size={18} color={colors.primary} />
                    <Text style={styles.statMetricValue}>{formatNumber(stat.total_views)}</Text>
                    <Text style={styles.statMetricLabel}>Views</Text>
                  </View>
                  <View style={styles.statMetric}>
                    <Ionicons name="trending-up" size={18} color={colors.success} />
                    <Text style={styles.statMetricValue}>{formatNumber(stat.avg_likes)}</Text>
                    <Text style={styles.statMetricLabel}>Avg Likes</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? spacing.xs : spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  summarySection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  statsList: {
    gap: spacing.md,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.text.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  statHeaderText: {
    flex: 1,
  },
  statCategoryName: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  statSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  statMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statMetric: {
    alignItems: 'center',
    flex: 1,
  },
  statMetricValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
    marginBottom: spacing.xs / 2,
  },
  statMetricLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
});
