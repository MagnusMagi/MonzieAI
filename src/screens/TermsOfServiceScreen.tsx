import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';

type TermsOfServiceScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TermsOfService'
>;

export default function TermsOfServiceScreen() {
  const navigation = useNavigation<TermsOfServiceScreenNavigationProp>();

  const handleOpenWeb = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>Last Updated: January 15, 2024</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using MonzieAI, you accept and agree to be bound by the terms and
            provision of this agreement.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>2. Use License</Text>
          <Text style={styles.paragraph}>
            Permission is granted to temporarily use MonzieAI for personal, non-commercial
            transitory viewing only. This is the grant of a license, not a transfer of title, and
            under this license you may not:
          </Text>
          <Text style={styles.bulletPoint}>• Modify or copy the materials</Text>
          <Text style={styles.bulletPoint}>• Use the materials for any commercial purpose</Text>
          <Text style={styles.bulletPoint}>• Attempt to reverse engineer any software</Text>
          <Text style={styles.bulletPoint}>• Remove any copyright or proprietary notations</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            You are responsible for maintaining the confidentiality of your account and password.
            You agree to accept responsibility for all activities that occur under your account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>4. User Content</Text>
          <Text style={styles.paragraph}>
            You retain ownership of any content you create using MonzieAI. By using our service, you
            grant us a license to store, display, and process your content solely for the purpose of
            providing our services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>5. Prohibited Uses</Text>
          <Text style={styles.paragraph}>You may not use MonzieAI:</Text>
          <Text style={styles.bulletPoint}>• In any way that violates any applicable law</Text>
          <Text style={styles.bulletPoint}>
            • To generate harmful, offensive, or illegal content
          </Text>
          <Text style={styles.bulletPoint}>• To impersonate any person or entity</Text>
          <Text style={styles.bulletPoint}>• To interfere with or disrupt the service</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>6. Subscription and Payment</Text>
          <Text style={styles.paragraph}>
            If you purchase a subscription, you agree to pay the applicable fees. Subscriptions
            automatically renew unless cancelled. You may cancel your subscription at any time.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>7. Disclaimer</Text>
          <Text style={styles.paragraph}>
            The materials on MonzieAI are provided on an 'as is' basis. We make no warranties,
            expressed or implied, and hereby disclaim all warranties including, without limitation,
            implied warranties of merchantability or fitness for a particular purpose.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>8. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            In no event shall MonzieAI or its suppliers be liable for any damages arising out of the
            use or inability to use the service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>9. Contact Information</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms, please contact us at:
          </Text>
          <TouchableOpacity
            onPress={() => handleOpenWeb('mailto:legal@monzieai.com')}
            style={styles.linkContainer}
          >
            <Text style={styles.link}>legal@monzieai.com</Text>
          </TouchableOpacity>
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
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  lastUpdated: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  heading: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  paragraph: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.6,
    marginBottom: spacing.sm,
  },
  bulletPoint: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.6,
    marginLeft: spacing.md,
    marginBottom: spacing.xs,
  },
  linkContainer: {
    marginTop: spacing.sm,
  },
  link: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.accent,
    textDecorationLine: 'underline',
  },
});
