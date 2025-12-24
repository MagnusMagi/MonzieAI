import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../config/supabase';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '../utils/logger';
import { useAuth } from '../contexts/AuthContext';
import { getAuthErrorMessage } from '../utils/errorMessages';
import { useFadeIn } from '../hooks/useFadeIn';

// Import icon as ES6 module
import iconImage from '../../assets/icon.png';

type AuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

interface GoogleSignInError extends Error {
  code?: string;
}

export default function AuthScreen() {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const { signIn, signUp } = useAuth();
  const fadeAnim = useFadeIn(400);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

  useEffect(() => {
    // TEMPORARILY DISABLED: Google Sign-In configuration (native module may cause crash)
    // TODO: Re-enable after confirming native module is properly linked
    // GoogleSignin.configure({
    //   webClientId: Constants.expoConfig?.extra?.googleWebClientId, // Web client ID from Google Cloud Console
    //   iosClientId: Constants.expoConfig?.extra?.googleIosClientId, // iOS client ID from Google Cloud Console (optional)
    //   offlineAccess: true,
    // });
    logger.debug('Google Sign-In configuration temporarily disabled to prevent native crash');
  }, []);

  const handleAuth = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Password Required', 'Please enter your password.');
      return;
    }
    if (!isLogin && !name.trim()) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);

      if (isLogin) {
        await signIn(email.trim(), password);
        // Small delay to ensure loading state is cleared
        await new Promise(resolve => setTimeout(resolve, 100));
        navigation.replace('Home');
      } else {
        await signUp(email.trim(), password, name.trim());
        // Small delay to ensure loading state is cleared
        await new Promise(resolve => setTimeout(resolve, 100));
        // Navigate to Paywall after successful registration
        navigation.replace('Paywall');
      }
    } catch (error: unknown) {
      logger.error('Auth error', error instanceof Error ? error : new Error('Unknown error'));
      const friendlyMessage = getAuthErrorMessage(error);
      Alert.alert('Error', friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // TEMPORARILY DISABLED: Google Sign-In native module (may cause startup crash)
    // This is a safe stub that prevents native code execution
    logger.warn('Google Sign-In temporarily disabled - native module not initialized');
    Alert.alert(
      'Google Sign-In Unavailable',
      'Google Sign-In is temporarily disabled. Please use email/password authentication or try again after the next app update.',
      [{ text: 'OK' }]
    );
    return;

    /* ORIGINAL CODE - COMMENTED OUT FOR SAFETY
    try {
      setSocialLoading('google');

      // Check if Google Play Services are available (Android only)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.data?.idToken) {
        throw new Error('No ID token received from Google');
      }

      // Sign in to Supabase with the ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.data.idToken,
        access_token: userInfo.data.serverAuthCode || undefined,
      });

      if (error) throw error;

      if (data.user) {
        logger.info('Google sign in successful', { userId: data.user.id });

        // Check if this is a new user (just created) by checking if user profile was just created
        // If user was just created, show paywall, otherwise go to home
        const { data: userProfile } = await supabase
          .from('users')
          .select('created_at')
          .eq('id', data.user.id)
          .single();

        // If user profile was created within the last 5 seconds, it's a new user
        const isNewUser =
          userProfile?.created_at && new Date(userProfile.created_at).getTime() > Date.now() - 5000;

        if (isNewUser) {
          navigation.replace('Paywall');
        } else {
          navigation.replace('Home');
        }
      } else {
        throw new Error('No user data returned');
      }
    } catch (error: unknown) {
      const googleError = error as GoogleSignInError;
      if (googleError.code === statusCodes.SIGN_IN_CANCELLED) {
        logger.info('Google sign in cancelled by user');
        // User cancelled, do nothing
      } else if (googleError.code === statusCodes.IN_PROGRESS) {
        logger.info('Google sign in already in progress');
        // Operation already in progress
      } else if (googleError.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        logger.error(
          'Google Play Services not available',
          googleError instanceof Error ? googleError : new Error('Unknown error')
        );
        Alert.alert('Error', 'Google Play Services is not available. Please update it.');
      } else {
        logger.error(
          'Google sign in error',
          googleError instanceof Error ? googleError : new Error('Unknown error')
        );
        const friendlyMessage = getAuthErrorMessage(error);
        Alert.alert('Error', friendlyMessage);
      }
    } finally {
      setSocialLoading(null);
    }
    */
  };

  const handleAppleSignIn = async () => {
    try {
      setSocialLoading('apple');

      // Check if Apple Authentication is available (iOS 13+)
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Apple Sign In is not available on this device');
      }

      // Request Apple authentication
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('No identity token received from Apple');
      }

      // Sign in to Supabase with the identity token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) throw error;

      if (data.user) {
        logger.info('Apple sign in successful', { userId: data.user.id });

        // Check if this is a new user (just created) by checking if user profile was just created
        // If user was just created, show paywall, otherwise go to home
        const { data: userProfile } = await supabase
          .from('users')
          .select('created_at')
          .eq('id', data.user.id)
          .single();

        // If user profile was created within the last 5 seconds, it's a new user
        const isNewUser =
          userProfile?.created_at && new Date(userProfile.created_at).getTime() > Date.now() - 5000;

        if (isNewUser) {
          navigation.replace('Paywall');
        } else {
          navigation.replace('Home');
        }
      } else {
        throw new Error('No user data returned');
      }
    } catch (error: unknown) {
      const appleError = error as { code?: string };
      if (appleError.code === 'ERR_REQUEST_CANCELED') {
        logger.info('Apple sign in cancelled by user');
        // User cancelled, do nothing
      } else {
        logger.error(
          'Apple sign in error',
          error instanceof Error ? error : new Error('Unknown error')
        );
        const friendlyMessage = getAuthErrorMessage(error);
        Alert.alert('Error', friendlyMessage);
      }
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Image source={iconImage} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>{isLogin ? 'Welcome' : 'Create Account'}</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Sign in to continue to MonzieAI' : 'Start creating amazing AI images'}
            </Text>
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={colors.text.tertiary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.text.secondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.text.tertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.text.secondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.text.tertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
              />
            </View>

            {isLogin && (
              <TouchableOpacity
                style={styles.forgotButton}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.authButton, loading && styles.authButtonDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <Text style={styles.authButtonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[
                styles.socialButton,
                styles.socialButtonDisabled, // Always disabled (Google Sign-In temporarily unavailable)
              ]}
              onPress={handleGoogleSignIn}
              disabled={true} // Always disabled
            >
              <>
                <Ionicons name="logo-google" size={20} color={colors.text.tertiary} />
                <Text style={[styles.socialButtonText, styles.socialButtonTextDisabled]}>
                  Continue with Google (Unavailable)
                </Text>
              </>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.socialButton,
                socialLoading === 'apple' && styles.socialButtonDisabled,
              ]}
              onPress={handleAppleSignIn}
              disabled={!!socialLoading}
            >
              {socialLoading === 'apple' ? (
                <ActivityIndicator color={colors.text.primary} />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={20} color={colors.text.primary} />
                  <Text style={styles.socialButtonText}>Continue with Apple</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.switchLink}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginTop: spacing.lg,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.accent,
  },
  authButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.lg,
    minHeight: 48,
    justifyContent: 'center',
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    marginHorizontal: spacing.md,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    gap: spacing.sm,
    minHeight: 48,
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
  socialButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  socialButtonTextDisabled: {
    color: colors.text.tertiary,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  switchText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  switchLink: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.accent,
  },
});
