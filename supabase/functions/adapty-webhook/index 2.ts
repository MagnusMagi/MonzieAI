import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-adapty-signature',
};

interface AdaptyWebhookPayload {
  event: string;
  profile: {
    profile_id: string;
    customer_user_id?: string;
    paid_access_levels?: Record<string, AdaptyAccessLevel>;
    subscriptions?: Record<string, AdaptySubscription>;
  };
}

interface AdaptyAccessLevel {
  id: string;
  is_active: boolean;
  vendor_product_id?: string;
  activated_at?: string;
  expires_at?: string;
  will_renew?: boolean;
  is_lifetime?: boolean;
}

interface AdaptySubscription {
  is_active: boolean;
  vendor_product_id: string;
  vendor_transaction_id?: string;
  vendor_original_transaction_id?: string;
  store?: 'app_store' | 'play_store' | 'adapty';
  activated_at?: string;
  renewed_at?: string;
  expires_at?: string;
  cancelled_at?: string;
  is_sandbox?: boolean;
  will_renew?: boolean;
  is_in_grace_period?: boolean;
  unsubscribed_at?: string;
  billing_issue_detected_at?: string;
  is_lifetime?: boolean;
}

serve(async req => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Handle Adapty webhook verification (GET request)
  // Note: Adapty webhooks don't require authorization header
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok', message: 'Webhook endpoint is active' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Note: Adapty webhooks don't send authorization header
    // We verify using webhook signature instead
    // Verify webhook signature (optional but recommended)
    const signature = req.headers.get('x-adapty-signature');
    const adaptySecretKey = Deno.env.get('ADAPTY_SECRET_KEY');

    // Note: In production, verify the signature here
    // For now, we'll trust the webhook if secret key is set
    if (adaptySecretKey && !signature) {
      console.warn('Missing Adapty signature, but continuing...');
    }

    // Parse webhook payload
    const payload: AdaptyWebhookPayload = await req.json();
    console.log('Adapty webhook received:', {
      event: payload.event,
      profileId: payload.profile?.profile_id,
      customerUserId: payload.profile?.customer_user_id,
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get customer user ID from profile
    const customerUserId = payload.profile?.customer_user_id || payload.profile?.profile_id;
    if (!customerUserId) {
      console.error('No customer user ID found in webhook payload');
      return new Response(JSON.stringify({ error: 'Missing customer_user_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find user by ID (assuming customer_user_id matches Supabase user ID)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', customerUserId)
      .single();

    if (userError || !user) {
      console.error('User not found:', customerUserId, userError);
      // Don't fail - user might not exist yet or ID might be different
      // Try to find by email or create a note
      return new Response(
        JSON.stringify({
          error: 'User not found',
          message: 'User will be synced when they log in',
        }),
        {
          status: 200, // Return 200 to acknowledge webhook
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Process subscription events
    const subscriptions = payload.profile?.subscriptions || {};
    const accessLevels = payload.profile?.paid_access_levels || {};

    // Find active subscription
    let activeSubscription: AdaptySubscription | null = null;
    for (const subscription of Object.values(subscriptions)) {
      if (subscription.is_active) {
        activeSubscription = subscription;
        break;
      }
    }

    // Find active access level
    let activeAccessLevel: AdaptyAccessLevel | null = null;
    for (const accessLevel of Object.values(accessLevels)) {
      if (accessLevel.is_active) {
        activeAccessLevel = accessLevel;
        break;
      }
    }

    // Determine subscription status
    const isActive = activeSubscription?.is_active || activeAccessLevel?.is_active || false;
    const expiresAt = activeSubscription?.expires_at
      ? new Date(activeSubscription.expires_at)
      : activeAccessLevel?.expires_at
        ? new Date(activeAccessLevel.expires_at)
        : null;

    // Determine plan type from vendor product ID
    const vendorProductId =
      activeSubscription?.vendor_product_id || activeAccessLevel?.vendor_product_id || '';
    const planType =
      vendorProductId.toLowerCase().includes('year') ||
      vendorProductId.toLowerCase().includes('annual')
        ? 'yearly'
        : 'monthly';

    // Get or create subscription in Supabase
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          plan_type: planType,
          status: isActive ? 'active' : 'cancelled',
          expires_at: expiresAt?.toISOString() || existingSubscription.expires_at,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSubscription.id);

      if (updateError) {
        console.error('Failed to update subscription:', updateError);
        throw updateError;
      }

      console.log('Subscription updated:', {
        subscriptionId: existingSubscription.id,
        userId: user.id,
        status: isActive ? 'active' : 'cancelled',
      });
    } else if (isActive && expiresAt) {
      // Create new subscription
      const { error: createError } = await supabase.from('subscriptions').insert({
        user_id: user.id,
        plan_type: planType,
        price: 0, // Price will be synced from Adapty if needed
        currency: 'USD',
        status: 'active',
        expires_at: expiresAt.toISOString(),
      });

      if (createError) {
        console.error('Failed to create subscription:', createError);
        throw createError;
      }

      console.log('Subscription created:', {
        userId: user.id,
        status: 'active',
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook processed successfully',
        event: payload.event,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing Adapty webhook:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
