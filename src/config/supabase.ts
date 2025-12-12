import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { logger } from '../utils/logger';

/**
 * Supabase Configuration
 * Supabase client - Deploy gerektirmiyor!
 */

// Get configuration from app.json extra config
// Fallback values are for development only - should be set in app.json for production
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase configuration missing. Please set supabaseUrl and supabaseAnonKey in app.json extra config.'
  );
}

// Supabase client oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Test Supabase connection
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('scenes').select('id').limit(1);
    return !error;
  } catch (error) {
    logger.error(
      'Supabase connection test failed',
      error instanceof Error ? error : new Error('Unknown error')
    );
    return false;
  }
};
