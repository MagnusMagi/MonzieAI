# RevenueCat Implementation Documentation

## Overview

This document provides a comprehensive overview of RevenueCat integration in the MonzieAI project. RevenueCat is used for subscription management, handling in-app purchases, and synchronizing subscription status with Supabase.

## Table of Contents

1. [Architecture](#architecture)
2. [Configuration](#configuration)
3. [Service Layer](#service-layer)
4. [UI Integration](#ui-integration)
5. [Supabase Integration](#supabase-integration)
6. [Webhook Handling](#webhook-handling)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Architecture

### Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Application                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ SplashScreen │  │ ProfileScreen │  │ PaywallScreen │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                  │              │
│         └─────────────────┼──────────────────┘              │
│                           │                                  │
│                  ┌────────▼────────┐                        │
│                  │ revenueCatService│                        │
│                  │  (Service Layer)│                        │
│                  └────────┬────────┘                        │
│                           │                                  │
│                  ┌────────▼────────┐                        │
│                  │ react-native-   │                        │
│                  │    purchases   │                        │
│                  │  (Native SDK)  │                        │
│                  └────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Webhooks
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐   │
│  │      revenuecat-webhook Edge Function               │   │
│  │  (Handles RevenueCat webhooks, syncs to Supabase)  │   │
│  └────────────────────────────────────────────────────┘   │
│                           │                                  │
│                  ┌────────▼────────┐                        │
│                  │  subscriptions │                        │
│                  │     table      │                        │
│                  └─────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuration

### 1. Package Dependencies

**File:** `package.json`

```json
{
  "dependencies": {
    "react-native-purchases": "^8.4.0"
  }
}
```

### 2. App Configuration

**File:** `app.json`

```json
{
  "extra": {
    "revenueCatApiKey": "YOUR_REVENUECAT_API_KEY"
  }
}
```

**Important:** 
- For iOS, use your iOS API key
- For Android, use your Android API key
- The service will automatically use the correct key based on the platform

### 3. Supabase Edge Function Secrets

**Required Secrets:**
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `REVENUECAT_SECRET_KEY`: (Optional) For webhook signature verification

**Set secrets via Supabase CLI:**
```bash
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Service Layer

### RevenueCatService

**File:** `src/services/revenueCatService.ts`

The main service class that wraps the RevenueCat SDK and provides a clean interface for subscription management.

#### Key Features

1. **Lazy Loading**: RevenueCat native module is loaded lazily to prevent crashes if not properly linked
2. **Error Handling**: Graceful degradation - app continues even if RevenueCat fails
3. **Type Safety**: Full TypeScript interfaces for all RevenueCat data structures

#### Main Methods

##### `initialize(userId?: string): Promise<void>`

Initializes the RevenueCat SDK with the API key.

**Usage:**
```typescript
await revenueCatService.initialize(user?.id);
```

**Location:** Called in `SplashScreen.tsx` on app startup

##### `identify(userId: string): Promise<void>`

Identifies the user with RevenueCat. Sets `app_user_id` which is used for webhook synchronization.

**Usage:**
```typescript
await revenueCatService.identify(user.id);
```

**Important:** The `userId` must match Supabase `users.id` for webhook synchronization to work.

##### `isPremium(): Promise<boolean>`

Checks if user has an active premium subscription.

**Usage:**
```typescript
const isPremium = await revenueCatService.isPremium();
```

##### `getCurrentOffering(): Promise<RevenueCatOffering | null>`

Gets the current offering with available packages.

**Usage:**
```typescript
const offering = await revenueCatService.getCurrentOffering();
```

##### `purchasePackage(package: RevenueCatPackage): Promise<RevenueCatCustomerInfo>`

Purchases a package. Handles the full purchase flow.

**Usage:**
```typescript
const customerInfo = await revenueCatService.purchasePackage(package);
```

##### `restorePurchases(): Promise<RevenueCatCustomerInfo>`

Restores previous purchases.

**Usage:**
```typescript
const customerInfo = await revenueCatService.restorePurchases();
```

##### `getCustomerInfo(): Promise<RevenueCatCustomerInfo | null>`

Gets the full customer info including entitlements and subscriptions.

**Usage:**
```typescript
const customerInfo = await revenueCatService.getCustomerInfo();
```

##### `getActiveEntitlement(): Promise<RevenueCatEntitlementInfo | null>`

Gets the currently active entitlement.

**Usage:**
```typescript
const entitlement = await revenueCatService.getActiveEntitlement();
```

##### `logout(): Promise<void>`

Logs out the current RevenueCat user.

**Usage:**
```typescript
await revenueCatService.logout();
```

---

## UI Integration

### 1. SplashScreen

**File:** `src/screens/SplashScreen.tsx`

**Purpose:** Initializes RevenueCat on app startup

**Code:**
```typescript
useEffect(() => {
  const checkOnboardingAndNavigate = async () => {
    try {
      // Initialize RevenueCat
      try {
        await revenueCatService.initialize(user?.id);
        if (user?.id) {
          await revenueCatService.identify(user.id);
        }
      } catch (error) {
        logger.warn('Failed to initialize RevenueCat, continuing without it', error);
      }
      // ... rest of initialization
    } catch (error) {
      // Handle error
    }
  };
  
  checkOnboardingAndNavigate();
}, [user]);
```

### 2. ProfileScreen

**File:** `src/screens/ProfileScreen.tsx`

**Purpose:** Provides navigation to RevenueCat test screen

**Code:**
```typescript
const handleMenuItemPress = (item: string) => {
  switch (item) {
    case 'revenuecat':
      navigation.navigate('RevenueCatTest');
      break;
    // ... other cases
  }
};

// In JSX:
<TouchableOpacity
  style={styles.revenueCatButton}
  onPress={() => handleMenuItemPress('revenuecat')}
>
  <Text style={styles.revenueCatButtonText}>RevenueCat</Text>
</TouchableOpacity>
```

### 3. RevenueCatTestScreen

**File:** `src/screens/RevenueCatTestScreen.tsx`

**Purpose:** Comprehensive testing interface for all RevenueCat features

**Features:**
- Initialize RevenueCat
- Identify user
- Check premium status
- Get customer info
- Get active entitlement
- Get offerings
- Get current offering
- Restore purchases
- Run all tests

**Navigation:** Accessible from ProfileScreen via "RevenueCat" button

### 4. PaywallScreen

**File:** `src/screens/PaywallScreen.tsx`

**Purpose:** Displays subscription plans and handles purchases

**Key Features:**
- Loads packages from RevenueCat offerings
- Falls back to default plans if RevenueCat unavailable
- Handles purchase flow via RevenueCat

**Code:**
```typescript
const loadRevenueCatOfferings = async () => {
  try {
    const offering = await revenueCatService.getCurrentOffering();
    if (offering) {
      setRevenueCatOffering(offering);
      setRevenueCatPackages(offering.availablePackages);
    }
  } catch (error) {
    logger.error('Failed to load RevenueCat offerings', error);
    // Continue with default plans if RevenueCat fails
  }
};
```

### 5. SubscriptionScreen

**File:** `src/screens/SubscriptionScreen.tsx`

**Purpose:** Displays current subscription status and syncs with RevenueCat

**Key Features:**
- Checks RevenueCat for premium status first
- Syncs RevenueCat subscription to Supabase
- Falls back to Supabase subscription if RevenueCat unavailable

**Code:**
```typescript
const loadSubscription = useCallback(async () => {
  try {
    // Try to get subscription from RevenueCat first
    try {
      const isPremium = await revenueCatService.isPremium();
      const activeEntitlement = await revenueCatService.getActiveEntitlement();

      if (isPremium && activeEntitlement) {
        // Sync RevenueCat subscription to Supabase
        // ... sync logic
      }
    } catch (revenueCatError) {
      logger.debug('RevenueCat check failed, falling back to Supabase', revenueCatError);
    }

    // Fallback to Supabase subscription
    const sub = await subscriptionRepository.getUserSubscription(user.id);
    setSubscription(sub);
  } catch (error) {
    // Handle error
  }
}, [user?.id]);
```

### 6. AuthContext

**File:** `src/contexts/AuthContext.tsx`

**Purpose:** Handles RevenueCat logout on user sign out

**Code:**
```typescript
const signOut = async () => {
  try {
    // Logout from RevenueCat
    try {
      await revenueCatService.logout();
    } catch (revenueCatError) {
      logger.warn('Failed to logout from RevenueCat', revenueCatError);
    }

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    // ... rest of sign out logic
  } catch (error) {
    // Handle error
  }
};
```

---

## Supabase Integration

### Database Schema

**Table:** `subscriptions`

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### SubscriptionRepository

**File:** `src/data/repositories/SubscriptionRepository.ts`

Handles CRUD operations for subscriptions in Supabase.

**Key Methods:**
- `getUserSubscription(userId: string): Promise<Subscription | null>`
- `createSubscription(data: CreateSubscriptionData): Promise<Subscription>`
- `updateSubscription(id: string, data: UpdateSubscriptionData): Promise<Subscription>`

---

## Webhook Handling

### Supabase Edge Function

**File:** `supabase/functions/revenuecat-webhook/index.ts`

**Purpose:** Receives webhooks from RevenueCat and syncs subscription status to Supabase

### Webhook URL

```
https://your-project.supabase.co/functions/v1/revenuecat-webhook
```

### Configuration in RevenueCat Dashboard

1. Go to RevenueCat Dashboard → Project Settings → Webhooks
2. Add webhook URL: `https://your-project.supabase.co/functions/v1/revenuecat-webhook`
3. Select events to receive (subscription events)

### Webhook Events Handled

- `INITIAL_PURCHASE` - First purchase
- `RENEWAL` - Subscription renewal
- `PRODUCT_CHANGE` - Subscription plan change
- `CANCELLATION` - Subscription cancelled
- `EXPIRATION` - Subscription expired
- `BILLING_ISSUE` - Billing problem detected

### Webhook Processing Flow

1. **Receive Webhook**: Edge function receives POST request from RevenueCat
2. **Extract User ID**: Get `app_user_id` from webhook payload
3. **Find User**: Look up user in Supabase `users` table
4. **Process Subscription**: Determine subscription status from webhook payload
5. **Sync to Supabase**: Create or update subscription in `subscriptions` table

### Edge Function Security

**Important:** The `revenuecat-webhook` Edge Function must have JWT verification **disabled** in Supabase Dashboard because RevenueCat webhooks don't send JWT tokens.

**To disable JWT verification:**
1. Go to Supabase Dashboard → Edge Functions → `revenuecat-webhook`
2. Uncheck "Verify JWT" option
3. Save changes

### GET Request Handling

The Edge Function handles GET requests for webhook URL verification:

```typescript
if (req.method === 'GET') {
  return new Response(
    JSON.stringify({ status: 'ok', message: 'RevenueCat webhook endpoint is active' }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
```

---

## Testing

### RevenueCatTestScreen

**Location:** `src/screens/RevenueCatTestScreen.tsx`

**Purpose:** Comprehensive testing interface for all RevenueCat features

**Test Functions:**
1. `testInitialize()` - Initialize RevenueCat SDK
2. `testIdentify()` - Identify user with RevenueCat
3. `testIsPremium()` - Check premium status
4. `testGetCustomerInfo()` - Get full customer info
5. `testGetActiveEntitlement()` - Get active entitlement
6. `testGetOfferings()` - Get all offerings
7. `testGetCurrentOffering()` - Get current offering
8. `testRestorePurchases()` - Restore previous purchases
9. `runAllTests()` - Run all tests sequentially

**Access:** Profile Screen → "RevenueCat" button

### Manual Testing Checklist

- [ ] RevenueCat initializes on app startup
- [ ] User is identified with RevenueCat on login
- [ ] Premium status check works
- [ ] Offerings load correctly
- [ ] Packages display with correct pricing
- [ ] Purchase flow completes successfully
- [ ] Subscription syncs to Supabase
- [ ] Webhook receives and processes events
- [ ] Restore purchases works
- [ ] Logout clears RevenueCat session

---

## Troubleshooting

### Common Issues

#### 1. "RevenueCat native module not available"

**Cause:** Native module not properly linked

**Solution:**
```bash
# Clean and rebuild
rm -rf ios android
npx expo prebuild --clean
cd ios && pod install && cd ..
npx expo run:ios
```

#### 2. Webhook Not Receiving Events

**Causes:**
- Webhook URL not configured in RevenueCat Dashboard
- JWT verification enabled on Edge Function
- Webhook URL incorrect

**Solutions:**
1. Verify webhook URL in RevenueCat Dashboard
2. Disable JWT verification in Supabase Dashboard
3. Check Edge Function logs in Supabase Dashboard

#### 3. Subscription Not Syncing to Supabase

**Causes:**
- `app_user_id` doesn't match Supabase `users.id`
- Webhook not receiving events
- Edge Function errors

**Solutions:**
1. Ensure `revenueCatService.identify(user.id)` is called with correct user ID
2. Check webhook logs in Supabase Dashboard
3. Verify Edge Function secrets are set correctly

#### 4. Packages Not Loading

**Causes:**
- Offering not configured in RevenueCat Dashboard
- Packages not assigned to offering
- Network issues

**Solutions:**
1. Verify offering configuration in RevenueCat Dashboard
2. Check package assignments
3. Review error logs in `revenueCatService`

### Debug Logging

All RevenueCat operations are logged via the `logger` service:

```typescript
logger.info('RevenueCat initialized successfully');
logger.warn('RevenueCat not initialized, skipping identify');
logger.error('Failed to initialize RevenueCat', error);
```

Check logs in development console or production logging service.

---

## File Locations Summary

### Client-Side Files

- `src/services/revenueCatService.ts` - Main RevenueCat service
- `src/screens/SplashScreen.tsx` - RevenueCat initialization
- `src/screens/ProfileScreen.tsx` - Navigation to test screen
- `src/screens/RevenueCatTestScreen.tsx` - Testing interface
- `src/screens/PaywallScreen.tsx` - Subscription purchase flow
- `src/screens/SubscriptionScreen.tsx` - Subscription status display
- `src/contexts/AuthContext.tsx` - RevenueCat logout on sign out
- `src/navigation/AppNavigator.tsx` - Navigation route for RevenueCatTest

### Server-Side Files

- `supabase/functions/revenuecat-webhook/index.ts` - Webhook handler

### Configuration Files

- `app.json` - RevenueCat API key configuration
- `package.json` - `react-native-purchases` dependency

---

## Best Practices

1. **Always use lazy loading**: The `getPurchases()` function ensures graceful degradation
2. **Handle errors gracefully**: Don't block app functionality if RevenueCat fails
3. **Sync user ID**: Always call `identify()` with Supabase user ID for webhook sync
4. **Check premium status**: Use `isPremium()` before showing premium features
5. **Fallback to Supabase**: Always have a fallback to Supabase subscription data
6. **Test webhooks**: Verify webhook events are received and processed correctly
7. **Monitor logs**: Check RevenueCat and Supabase logs for errors

---

## Next Steps

1. **Add RevenueCat API Key**: Update `app.json` with your RevenueCat API key
2. **Configure Products**: Set up products in RevenueCat Dashboard
3. **Create Offerings**: Create offerings with packages in RevenueCat Dashboard
4. **Deploy Webhook**: Deploy the Edge Function and configure webhook URL in RevenueCat Dashboard
5. **Test Integration**: Use RevenueCatTestScreen to test all features
6. **Test Purchases**: Test purchase flow with sandbox accounts

---

## References

- [RevenueCat Documentation](https://www.revenuecat.com/docs/)
- [React Native Purchases SDK](https://github.com/RevenueCat/react-native-purchases)
- [RevenueCat MCP Server](https://www.revenuecat.com/docs/tools/mcp)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

**Last Updated:** 2025-01-XX
**Maintained By:** Development Team

