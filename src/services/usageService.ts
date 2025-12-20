
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { revenueCatService } from './revenueCatService';

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
    getLimitForPlan(planIdentifier: string): number {
        // Try exact match first
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
     * Get current usage for the user
     */
    async getUserUsage(userId: string): Promise<{ count: number; limit: number; periodEnd: string | null } | null> {
        try {
            // Get active entitlement from RevenueCat to determine limit
            const entitlement = await revenueCatService.getActiveEntitlement();
            const planId = entitlement?.productIdentifier || 'free';
            const limit = this.getLimitForPlan(planId);

            // Fetch usage from Supabase
            const { data, error } = await supabase
                .from('user_usage')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No row found, user hasn't generated anything yet
                    return { count: 0, limit, periodEnd: entitlement?.expirationDate || null };
                }
                logger.error('Failed to fetch user usage', error);
                return null;
            }

            // Check if period has expired (reset logic)
            // Note: We trust RevenueCat for the actual subscription status.
            // If the row exists but belongs to an old period, we should technically reset it.
            // However, we'll implement a simple period check: if current time > period_end, count is treated as 0.

            const now = new Date();
            const periodEnd = data.period_end ? new Date(data.period_end) : null;

            if (periodEnd && now > periodEnd) {
                // Period expired, effectively 0 usage for new period (until we update row)
                // But we should probably update the row to reset it
                return { count: 0, limit, periodEnd: entitlement?.expirationDate || null };
            }

            return { count: data.count, limit, periodEnd: data.period_end };

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
            // If fails to fetch, fail safe? Or block?
            // Let's allow if we can't check, but log error (Fail Open for better UX? Or Fail Closed for business?)
            // User requested LIMITS, so Fail Closed is safer for business, but bad for UX if DB is down.
            // Let's Fail Open with warning for now, or maybe just return true since we are still building.
            // But actually, let's look at the requirements: "sınırlandırma ... olmak zorunda" (must be restricted).
            // So Fail Closed.
            return { allowed: false, reason: 'Unable to verify usage limits.' };
        }

        if (usage.limit === 0) {
            return { allowed: false, reason: 'Free tier has no generation credits. Please upgrade.' };
        }

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
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', userId);

            } else {
                // First time
                await supabase
                    .from('user_usage')
                    .insert({
                        user_id: userId,
                        count: 1,
                        period_start: new Date().toISOString(),
                        period_end: expirationDate,
                        plan_id: planId
                    });
            }

        } catch (error) {
            logger.error('Failed to increment usage', error instanceof Error ? error : new Error(String(error)));
        }
    }
}

export const usageService = new UsageService();
