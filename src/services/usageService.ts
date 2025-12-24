
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { revenueCatService } from './revenueCatService';
import { packageService } from './packageService';

export const PLAN_LIMITS: Record<string, number> = {
    'weekly': 40,
    'monthly': 180,
    '3_month': 500,
    '6_month': 1000,
    'yearly': 2500,
    'default': 0, // Free tier
};

// Map RevenueCat package identifiers to our internal plan keys
// This needs to be adjusted based on actual RevenueCat identifiers
const PACKAGE_TO_PLAN_MAP: Record<string, string> = {
    'rc_weekly': 'weekly', // Example
    'rc_monthly': 'monthly',
    'rc_3month': '3_month',
    'rc_6month': '6_month',
    'rc_yearly': 'yearly',
};

class UsageService {

    /**
     * Get the limit for a given plan identifier
     */
    async getLimitForPlan(planIdentifier: string): Promise<number> {
        // First try to get from Supabase packageService
        try {
            // Map plan identifier to package key
            const packageKey = this.mapPlanToPackageKey(planIdentifier);
            if (packageKey) {
                const credits = await packageService.getCreditsForPackage(packageKey);
                if (credits !== null) {
                    return credits;
                }
            }
        } catch (error) {
            logger.warn('Failed to fetch limit from packageService, using fallback', error);
        }

        // Fallback to hardcoded limits
        if (PLAN_LIMITS[planIdentifier]) {
            return PLAN_LIMITS[planIdentifier];
        }

        // meaningful substring match or mapping
        for (const [key, val] of Object.entries(PACKAGE_TO_PLAN_MAP)) {
            if (planIdentifier.includes(key)) return PLAN_LIMITS[val];
        }

        // Heuristic fallback based on name
        const lowerId = planIdentifier.toLowerCase();
        if (lowerId.includes('week')) return PLAN_LIMITS['weekly'];
        if (lowerId.includes('year') || lowerId.includes('annual')) return PLAN_LIMITS['yearly'];
        if (lowerId.includes('6') && lowerId.includes('month')) return PLAN_LIMITS['6_month'];
        if (lowerId.includes('3') && lowerId.includes('month')) return PLAN_LIMITS['3_month'];
        if (lowerId.includes('month')) return PLAN_LIMITS['monthly'];

        return PLAN_LIMITS['default'];
    }

    /**
     * Map plan identifier to package key
     */
    private mapPlanToPackageKey(planIdentifier: string): string | null {
        const lowerId = planIdentifier.toLowerCase();
        
        // Try exact match first
        if (lowerId.includes('weekly') || lowerId.includes('week')) return 'weekly';
        if (lowerId.includes('yearly') || lowerId.includes('year') || lowerId.includes('annual')) return 'yearly';
        if (lowerId.includes('6') && lowerId.includes('month')) return '6_month';
        if (lowerId.includes('3') && lowerId.includes('month')) return '3_month';
        if (lowerId.includes('month')) return 'monthly';
        
        // Try mapping from PACKAGE_TO_PLAN_MAP
        for (const [key, val] of Object.entries(PACKAGE_TO_PLAN_MAP)) {
            if (planIdentifier.includes(key)) return val;
        }
        
        return null;
    }

    /**
     * Get current usage for the user
     */
    async getUserUsage(userId: string): Promise<{ count: number; limit: number; periodEnd: string | null; dailyCount: number; dailyLimit: number } | null> {
        try {
            // Get active entitlement from RevenueCat to determine limit
            const entitlement = await revenueCatService.getActiveEntitlement();
            const planId = entitlement?.productIdentifier || 'free';
            const limit = await this.getLimitForPlan(planId);

            // Fetch usage from Supabase
            const { data, error } = await supabase
                .from('user_usage')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No row found, user hasn't generated anything yet
                    return { 
                        count: 0, 
                        limit, 
                        periodEnd: entitlement?.expirationDate || null,
                        dailyCount: 0,
                        dailyLimit: limit
                    };
                }
                logger.error('Failed to fetch user usage', error);
                return null;
            }

            // Check if period has expired (reset logic)
            const now = new Date();
            const periodEnd = data.period_end ? new Date(data.period_end) : null;

            if (periodEnd && now > periodEnd) {
                // Period expired, effectively 0 usage for new period
                return { 
                    count: 0, 
                    limit, 
                    periodEnd: entitlement?.expirationDate || null,
                    dailyCount: 0,
                    dailyLimit: limit
                };
            }

            // Check if daily count needs to be reset
            let dailyCount = data.daily_count || 0;
            const lastResetDate = data.last_reset_date ? new Date(data.last_reset_date) : null;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (lastResetDate) {
                const resetDate = new Date(lastResetDate);
                resetDate.setHours(0, 0, 0, 0);
                
                // If last reset was not today, reset daily count
                if (resetDate.getTime() !== today.getTime()) {
                    dailyCount = 0;
                    // Update the database to reflect the reset
                    await supabase
                        .from('user_usage')
                        .update({ 
                            daily_count: 0,
                            last_reset_date: today.toISOString().split('T')[0]
                        })
                        .eq('user_id', userId);
                }
            }

            return { 
                count: data.count || 0, 
                limit, 
                periodEnd: data.period_end,
                dailyCount,
                dailyLimit: limit
            };

        } catch (error) {
            logger.error('Error in getUserUsage', error instanceof Error ? error : new Error(String(error)));
            return null;
        }
    }

    /**
     * Check if user can generate image
     */
    async canGenerateImage(userId: string): Promise<{ allowed: boolean; reason?: string }> {
        const usage = await this.getUserUsage(userId);
        if (!usage) {
            return { allowed: false, reason: 'Unable to verify usage limits.' };
        }

        if (usage.limit === 0) {
            return { allowed: false, reason: 'Free tier has no generation credits. Please upgrade.' };
        }

        // Check daily limit first (more restrictive)
        if (usage.dailyLimit > 0 && usage.dailyCount >= usage.dailyLimit) {
            return { allowed: false, reason: `You have reached your daily limit of ${usage.dailyLimit} photos. Please try again tomorrow.` };
        }

        // Check period limit
        if (usage.count >= usage.limit) {
            return { allowed: false, reason: `You have reached your limit of ${usage.limit} photos for this period.` };
        }

        return { allowed: true };
    }

    /**
     * Increment usage count
     */
    async incrementUsage(userId: string): Promise<void> {
        try {
            const entitlement = await revenueCatService.getActiveEntitlement();
            const planId = entitlement?.productIdentifier || 'free';
            const expirationDate = entitlement?.expirationDate || null; // ISO string

            // We use upsert to handle both new rows and updates
            // Using RPC or raw SQL would be atomic, but `upsert` with RLS is okay.
            // Problem: `count` increment needs to be atomic to avoid race conditions.
            // Supabase supports `rpc('increment_usage', ...)` but we can't create that easily right now.
            // So we will just read-modify-write or use an upsert that sets default.
            // Actually, we can fetch current, then update.

            // Better approach: Use upsert with On Conflict
            // But we want to increment.
            // Simple approach: Get current usage row. If exists, update count = count + 1. If not, insert count = 1.

            const { data: currentUsage } = await supabase
                .from('user_usage')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (currentUsage) {
                // Check reset
                const now = new Date();
                const periodEnd = currentUsage.period_end ? new Date(currentUsage.period_end) : null;
                let newCount = currentUsage.count + 1;
                
                // Handle daily count reset and increment
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const lastResetDate = currentUsage.last_reset_date ? new Date(currentUsage.last_reset_date) : null;
                let newDailyCount = (currentUsage.daily_count || 0) + 1;
                let newLastResetDate = today.toISOString().split('T')[0];
                
                if (lastResetDate) {
                    const resetDate = new Date(lastResetDate);
                    resetDate.setHours(0, 0, 0, 0);
                    
                    // If last reset was not today, reset daily count
                    if (resetDate.getTime() !== today.getTime()) {
                        newDailyCount = 1; // First generation of the day
                    }
                }
                let newPeriodEnd = currentUsage.period_end; // Keep existing period end unless expired

                // If period expired or different plan, we might want to reset. 
                // Sync with RevenueCat expiration
                if (expirationDate) {
                    newPeriodEnd = expirationDate;
                }

                // If the stored period_end was in the past, reset count to 1
                if (periodEnd && now > periodEnd) {
                    newCount = 1;
                }

                await supabase
                    .from('user_usage')
                    .update({
                        count: newCount,
                        period_end: newPeriodEnd,
                        plan_id: planId,
                        daily_count: newDailyCount,
                        last_reset_date: newLastResetDate,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', userId);

            } else {
                // First time
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                await supabase
                    .from('user_usage')
                    .insert({
                        user_id: userId,
                        count: 1,
                        period_start: new Date().toISOString(),
                        period_end: expirationDate,
                        plan_id: planId,
                        daily_count: 1,
                        last_reset_date: today.toISOString().split('T')[0]
                    });
            }

        } catch (error) {
            logger.error('Failed to increment usage', error instanceof Error ? error : new Error(String(error)));
        }
    }
}

export const usageService = new UsageService();
