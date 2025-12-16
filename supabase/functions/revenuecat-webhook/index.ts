import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RevenueCatWebhookPayload {
  event: {
    id: string;
    type: string;
    app_id: string;
    app_user_id: string;
    aliases: string[];
    product_id?: string;
    period_type?: string;
    purchased_at_ms?: number;
    expiration_at_ms?: number;
    environment?: string;
    entitlement_ids?: string[];
    presented_offering_id?: string;
    presented_package_id?: string;
    store?: string;
    transaction_id?: string;
    original_transaction_id?: string;
    is_family_share?: boolean;
    country_code?: string;
    currency?: string;
    price?: number;
    price_in_purchased_currency?: number;
    subscriber_attributes?: Record<string, unknown>;
    takehome_percentage?: number;
  };
}

serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Handle GET requests for webhook URL verification
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ status: 'ok', message: 'RevenueCat webhook endpoint is active' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const revenueCatSecretKey =
      Deno.env.get('REVENUECAT_SECRET_KEY') || 'sk_ttLDinvdWUQOxzTGfnVZcZrXSVUvM';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse webhook payload
    const payload: RevenueCatWebhookPayload = await req.json();

    if (!payload.event) {
      return new Response(JSON.stringify({ error: 'Invalid webhook payload: missing event' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const event = payload.event;
    const appUserId = event.app_user_id;

    if (!appUserId) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook payload: missing app_user_id' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Find user in Supabase by matching app_user_id with users.id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', appUserId)
      .single();

    if (userError || !user) {
      console.error('User not found in Supabase:', userError);
      return new Response(JSON.stringify({ error: 'User not found', app_user_id: appUserId }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process different event types
    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'PRODUCT_CHANGE':
        await handleSubscriptionActivated(supabase, user.id, event);
        break;

      case 'CANCELLATION':
        await handleSubscriptionCancelled(supabase, user.id, event);
        break;

      case 'EXPIRATION':
        await handleSubscriptionExpired(supabase, user.id, event);
        break;

      case 'BILLING_ISSUE':
        await handleBillingIssue(supabase, user.id, event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ status: 'ok', message: 'Webhook processed successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing RevenueCat webhook:', error);
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

async function handleSubscriptionActivated(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  event: RevenueCatWebhookPayload['event']
) {
  const expiresAt = event.expiration_at_ms
    ? new Date(event.expiration_at_ms)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default: 30 days from now

  const planType =
    event.product_id?.toLowerCase().includes('year') ||
    event.product_id?.toLowerCase().includes('annual')
      ? 'yearly'
      : 'monthly';

  const price = event.price || 0;
  const currency = event.currency || 'USD';

  // Check if subscription exists
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (existingSub) {
    // Update existing subscription
    await supabase
      .from('subscriptions')
      .update({
        plan_type: planType,
        status: 'active',
        expires_at: expiresAt.toISOString(),
        price: price,
        currency: currency,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingSub.id);
  } else {
    // Create new subscription
    await supabase.from('subscriptions').insert({
      user_id: userId,
      plan_type: planType,
      status: 'active',
      price: price,
      currency: currency,
      started_at: event.purchased_at_ms
        ? new Date(event.purchased_at_ms).toISOString()
        : new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    });
  }
}

async function handleSubscriptionCancelled(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  event: RevenueCatWebhookPayload['event']
) {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (subscription) {
    await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);
  }
}

async function handleSubscriptionExpired(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  event: RevenueCatWebhookPayload['event']
) {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .in('status', ['active', 'cancelled'])
    .single();

  if (subscription) {
    await supabase
      .from('subscriptions')
      .update({
        status: 'expired',
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);
  }
}

async function handleBillingIssue(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  event: RevenueCatWebhookPayload['event']
) {
  // Log billing issue - you might want to notify the user or take action
  console.log('Billing issue detected for user:', userId, event);
  // Optionally update subscription status or create a notification
}
