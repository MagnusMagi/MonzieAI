import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../config/supabase';
import { errorLoggingService } from '../services/errorLoggingService';
import { logger } from '../utils/logger';
import { revenueCatService } from '../services/revenueCatService';
import type { AuthResponse, Session, PostgrestError } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isManualSignOut, setIsManualSignOut] = useState(false);

  // Initialize auth state
  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        logger.error(
          'Failed to get session',
          error instanceof Error ? error : new Error('Unknown error')
        );
        errorLoggingService.logError(error, null, { service: 'SUPABASE', operation: 'getSession' });
        setLoading(false);
      } else if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.debug('Auth state changed', { event, hasSession: !!session });

      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Session refreshed, user is still logged in
        logger.debug('Token refreshed, maintaining session', { userId: session.user.id });
        if (!user) {
          // If user state is lost, reload profile
          await loadUserProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        // Only clear user state if it was a manual sign out
        // Don't clear on app restart if session is missing (it will be restored)
        if (isManualSignOut) {
          setUser(null);
          errorLoggingService.clearUserContext();
          logger.info('User signed out manually');
          setIsManualSignOut(false);
        } else {
          // Session might be missing on app restart, try to restore
          logger.debug('SIGNED_OUT event received, but not manual sign out. Checking session...');
          const {
            data: { session: currentSession },
          } = await supabase.auth.getSession();
          if (currentSession?.user) {
            // Session exists, restore user
            logger.debug('Session restored after SIGNED_OUT event', {
              userId: currentSession.user.id,
            });
            await loadUserProfile(currentSession.user.id);
          } else {
            // No session, user is truly signed out
            logger.debug('No session found, user is signed out');
            setUser(null);
            errorLoggingService.clearUserContext();
          }
        }
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      // Get current session to access user metadata with timeout
      const sessionPromise = supabase.auth.getSession();
      const sessionTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Session request timed out')), 10000);
      });

      const sessionResult = await Promise.race([sessionPromise, sessionTimeout]);
      const {
        data: { session },
      } = sessionResult as { data: { session: Session | null } };

      // Query user profile with timeout
      const profilePromise = supabase.from('users').select('*').eq('id', userId).single();
      const profileTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile request timed out')), 10000);
      });

      const profileResult = await Promise.race([profilePromise, profileTimeout]);
      const { data, error } = profileResult as { data: User | null; error: PostgrestError | null };

      // If user doesn't exist, create profile
      if (error && error.code === 'PGRST116') {
        // User profile doesn't exist, create it
        const userEmail = session?.user?.email || session?.user?.user_metadata?.email;
        const userName =
          session?.user?.user_metadata?.name ||
          session?.user?.user_metadata?.full_name ||
          userEmail?.split('@')[0] ||
          null;

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: userEmail || '',
            name: userName,
          })
          .select()
          .single();

        if (createError) {
          // Handle duplicate key error (user might have been created between check and insert)
          if (createError.code === '23505') {
            // User already exists, try to load it again
            logger.debug('User profile already exists, reloading', { userId });
            const { data: existingUser, error: reloadError } = await supabase
              .from('users')
              .select('*')
              .eq('id', userId)
              .single();

            if (reloadError || !existingUser) {
              logger.error(
                'Failed to reload user profile after duplicate key error',
                reloadError instanceof Error ? reloadError : new Error('Unknown error'),
                { userId }
              );
              setLoading(false);
              return;
            }

            const userData = {
              id: existingUser.id,
              email: existingUser.email,
              name: existingUser.name,
              avatar_url: existingUser.avatar_url,
              created_at: existingUser.created_at,
            };
            setUser(userData);
            errorLoggingService.setUserContext(userData.id, userData.email, userData.name);
            logger.info('User profile loaded after duplicate key error', {
              userId: userData.id,
              email: userData.email,
            });
            return;
          }

          // Other errors
          logger.error(
            'Failed to create user profile',
            createError instanceof Error ? createError : new Error('Unknown error'),
            {
              userId,
              errorCode: (createError as PostgrestError)?.code,
            }
          );
          errorLoggingService.logError(createError, null, {
            service: 'SUPABASE',
            operation: 'createUserProfile',
          });
          setLoading(false);
          return;
        }

        if (newUser) {
          const userData = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            avatar_url: newUser.avatar_url,
            created_at: newUser.created_at,
          };
          setUser(userData);
          errorLoggingService.setUserContext(userData.id, userData.email, userData.name);
          logger.info('User profile created and loaded', {
            userId: userData.id,
            email: userData.email,
          });
        }
        return;
      }

      if (error) {
        logger.error(
          'Failed to load user profile',
          error instanceof Error ? error : new Error('Unknown error'),
          {
            userId,
          }
        );
        errorLoggingService.logError(error, null, {
          service: 'SUPABASE',
          operation: 'loadUserProfile',
        });
        setLoading(false);
        return;
      }

      if (data) {
        const userData = {
          id: data.id,
          email: data.email,
          name: data.name,
          avatar_url: data.avatar_url,
          created_at: data.created_at,
        };
        setUser(userData);
        // Set user context in logger and Sentry
        errorLoggingService.setUserContext(userData.id, userData.email, userData.name);
        logger.info('User profile loaded', { userId: userData.id, email: userData.email });
      }
    } catch (error) {
      logger.error(
        'Error in loadUserProfile',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          userId,
        }
      );
      errorLoggingService.logError(
        error instanceof Error ? error : new Error(String(error)),
        null,
        { service: 'SUPABASE', operation: 'loadUserProfile' }
      );
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Add timeout to prevent hanging
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error('Sign in request timed out. Please check your connection and try again.')
            ),
          15000
        );
      });

      const signInResult = await Promise.race([signInPromise, timeoutPromise]);
      const { data, error } = signInResult as AuthResponse;

      if (error) {
        errorLoggingService.logError(error, null, { service: 'SUPABASE', operation: 'signIn' });
        throw error;
      }

      if (data.user) {
        // Load user profile with timeout
        try {
          await Promise.race([
            loadUserProfile(data.user.id),
            new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Loading user profile timed out.')), 10000);
            }),
          ]);
        } catch (profileError) {
          logger.error(
            'Failed to load user profile after sign in',
            profileError instanceof Error ? profileError : new Error('Unknown error'),
            { userId: data.user.id }
          );
          // Don't throw - user is signed in, profile can be loaded later
        }
      }
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);

      // Add timeout to prevent hanging
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error('Sign up request timed out. Please check your connection and try again.')
            ),
          15000
        );
      });

      const signUpResult = await Promise.race([signUpPromise, timeoutPromise]);
      const { data, error } = signUpResult as AuthResponse;

      if (error) {
        errorLoggingService.logError(error, null, { service: 'SUPABASE', operation: 'signUp' });
        throw error;
      }

      if (data.user) {
        // loadUserProfile will create the profile if it doesn't exist
        // This avoids duplicate key errors
        try {
          await Promise.race([
            loadUserProfile(data.user.id),
            new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Loading user profile timed out.')), 10000);
            }),
          ]);
        } catch (profileError) {
          logger.error(
            'Failed to load user profile after sign up',
            profileError instanceof Error ? profileError : new Error('Unknown error'),
            { userId: data.user.id }
          );
          // Don't throw - user is signed up, profile can be loaded later
        }
      }
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setIsManualSignOut(true); // Mark as manual sign out

      // Logout from RevenueCat
      try {
        await revenueCatService.logout();
      } catch (revenueCatError) {
        logger.warn(
          'Failed to logout from RevenueCat',
          revenueCatError instanceof Error ? revenueCatError : new Error('Unknown error')
        );
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        errorLoggingService.logError(error, null, { service: 'SUPABASE', operation: 'signOut' });
        setIsManualSignOut(false); // Reset on error
        throw error;
      }

      setUser(null);
      errorLoggingService.clearUserContext();
      logger.info('User signed out manually');
    } catch (error) {
      setIsManualSignOut(false); // Reset on error
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      setLoading(true);

      logger.info('Deleting user account', { userId: user.id });

      // Delete user data from users table
      const { error: userError } = await supabase.from('users').delete().eq('id', user.id);

      if (userError) {
        logger.error(
          'Failed to delete user data',
          userError instanceof Error ? userError : new Error('Unknown error'),
          {
            userId: user.id,
          }
        );
        // Continue even if user data deletion fails
      }

      // Delete user images
      const { error: imagesError } = await supabase.from('images').delete().eq('user_id', user.id);

      if (imagesError) {
        logger.error(
          'Failed to delete user images',
          imagesError instanceof Error ? imagesError : new Error('Unknown error'),
          {
            userId: user.id,
          }
        );
        // Continue even if images deletion fails
      }

      // Sign out (auth user deletion requires admin privileges)
      // User data in database tables is already deleted above
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        logger.error(
          'Failed to sign out after account deletion',
          signOutError instanceof Error ? signOutError : new Error('Unknown error'),
          {
            userId: user.id,
          }
        );
        // Continue anyway as data is already deleted
      }

      setUser(null);
      errorLoggingService.clearUserContext();
      logger.info('User account deleted successfully', { userId: user.id });
    } catch (error) {
      logger.error(
        'Failed to delete account',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          userId: user.id,
        }
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      setLoading(true);

      // Debug: Log update attempt
      logger.debug('Updating user profile', {
        userId: user.id,
        updates,
      });

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        logger.error(
          'Failed to update user profile',
          error instanceof Error ? error : new Error('Unknown error'),
          {
            userId: user.id,
            updates,
            errorCode: (error as PostgrestError)?.code,
            errorMessage: (error as PostgrestError)?.message,
          }
        );
        errorLoggingService.logError(error, null, { service: 'SUPABASE', operation: 'updateUser' });
        throw error;
      }

      if (data) {
        const userData = {
          id: data.id,
          email: data.email,
          name: data.name,
          avatar_url: data.avatar_url,
          created_at: data.created_at,
        };

        logger.debug('User profile updated successfully', {
          userId: userData.id,
          newAvatarUrl: userData.avatar_url,
          oldAvatarUrl: user.avatar_url,
        });

        // Force state update with new object reference
        const updatedUser = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          avatar_url: userData.avatar_url || undefined, // Ensure undefined if empty string
          created_at: userData.created_at,
        };

        // Only log user state changes in development
        if (__DEV__) {
          logger.debug('Setting user state', {
            user: updatedUser,
            avatar_url: updatedUser.avatar_url,
          });
        }
        // Use setTimeout to ensure state update happens after current execution
        setTimeout(() => {
          setUser({ ...updatedUser }); // Create completely new object
          // Only log in development
          if (__DEV__) {
            logger.debug('User state updated in AuthContext', {
              avatar_url: updatedUser.avatar_url,
            });
          }
        }, 0);
        errorLoggingService.setUserContext(userData.id, userData.email, userData.name);
        logger.info('User profile updated', {
          userId: userData.id,
          avatarUrl: updatedUser.avatar_url,
        });
      } else {
        logger.warn('User profile update returned no data', { userId: user.id });
      }
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    updateUser,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
