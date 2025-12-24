import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export interface SubscriptionPackage {
  id: string;
  packageKey: string;
  displayName: string;
  priceUsd: number;
  credits: number;
  durationDays: number;
  revenuecatProductId?: string | null;
  revenuecatPackageId?: string | null;
  isActive: boolean;
  displayOrder: number;
}

class PackageService {
  /**
   * Get all active subscription packages
   */
  async getPackages(): Promise<SubscriptionPackage[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        logger.error('Failed to fetch packages', error);
        return [];
      }

      return (data || []).map(pkg => ({
        id: pkg.id,
        packageKey: pkg.package_key,
        displayName: pkg.display_name,
        priceUsd: parseFloat(pkg.price_usd),
        credits: pkg.credits,
        durationDays: pkg.duration_days,
        revenuecatProductId: pkg.revenuecat_product_id,
        revenuecatPackageId: pkg.revenuecat_package_id,
        isActive: pkg.is_active,
        displayOrder: pkg.display_order,
      }));
    } catch (error) {
      logger.error(
        'Error in getPackages',
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }
  }

  /**
   * Get package by key
   */
  async getPackageByKey(packageKey: string): Promise<SubscriptionPackage | null> {
    try {
      const { data, error } = await supabase
        .from('subscription_packages')
        .select('*')
        .eq('package_key', packageKey)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error('Failed to fetch package', error);
        return null;
      }

      return {
        id: data.id,
        packageKey: data.package_key,
        displayName: data.display_name,
        priceUsd: parseFloat(data.price_usd),
        credits: data.credits,
        durationDays: data.duration_days,
        revenuecatProductId: data.revenuecat_product_id,
        revenuecatPackageId: data.revenuecat_package_id,
        isActive: data.is_active,
        displayOrder: data.display_order,
      };
    } catch (error) {
      logger.error(
        'Error in getPackageByKey',
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }
  }

  /**
   * Get package credits for a given package key
   */
  async getCreditsForPackage(packageKey: string): Promise<number> {
    const pkg = await this.getPackageByKey(packageKey);
    return pkg?.credits || 0;
  }
}

export const packageService = new PackageService();
