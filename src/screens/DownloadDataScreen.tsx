import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
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
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

type DownloadDataScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DownloadData'
>;

export default function DownloadDataScreen() {
  const navigation = useNavigation<DownloadDataScreenNavigationProp>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDownloadData = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to download your data.');
      return;
    }

    try {
      setLoading(true);

      // Fetch user data from Supabase
      const userData: any = {
        profile: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
        },
      };

      // Fetch user images
      const { data: images, error: imagesError } = await supabase
        .from('images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!imagesError && images) {
        userData.images = images;
      }

      // Convert to JSON
      const jsonData = JSON.stringify(userData, null, 2);
      const fileName = `monzieai-data-${user.id}-${Date.now()}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Write file
      await FileSystem.writeAsStringAsync(fileUri, jsonData, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Download My Data',
        });
        logger.info('User data downloaded successfully', { userId: user.id });
      } else {
        Alert.alert('Download Complete', `Your data has been saved to: ${fileUri}`, [
          { text: 'OK' },
        ]);
      }
    } catch (error) {
      logger.error(
        'Failed to download user data',
        error instanceof Error ? error : new Error('Unknown error')
      );
      Alert.alert('Error', 'Failed to download your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Download My Data</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Ionicons name="download-outline" size={64} color={colors.accent} />
          </View>
          <Text style={styles.title}>Download Your Data</Text>
          <Text style={styles.description}>
            You can download a copy of all your data stored in MonzieAI. This includes:
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.dataItem}>
            <Ionicons name="person-outline" size={20} color={colors.text.primary} />
            <Text style={styles.dataText}>Profile information</Text>
          </View>
          <View style={styles.dataItem}>
            <Ionicons name="images-outline" size={20} color={colors.text.primary} />
            <Text style={styles.dataText}>Generated images</Text>
          </View>
          <View style={styles.dataItem}>
            <Ionicons name="time-outline" size={20} color={colors.text.primary} />
            <Text style={styles.dataText}>Activity history</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.note}>
            Your data will be exported as a JSON file that you can save or share.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.downloadButton, loading && styles.downloadButtonDisabled]}
          onPress={handleDownloadData}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : (
            <>
              <Ionicons name="download" size={20} color={colors.text.inverse} />
              <Text style={styles.downloadButtonText}>Download Data</Text>
            </>
          )}
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
    paddingBottom: spacing.xl,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.5,
    textAlign: 'center',
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  dataText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
  },
  note: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.sm,
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
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  downloadButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
});
