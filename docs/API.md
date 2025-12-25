# MonzieAI - API Dokümantasyonu

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Supabase API](#supabase-api)
3. [FAL.AI API](#falai-api)
4. [RevenueCat API](#revenuecat-api)
5. [Internal Services API](#internal-services-api)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Authentication](#authentication)

## 🎯 Genel Bakış

MonzieAI üç ana external API kullanır:
- **Supabase**: Backend, database, authentication, storage
- **FAL.AI**: AI görsel üretimi
- **RevenueCat**: Abonelik yönetimi

## 🗄️ Supabase API

### Base Configuration

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://groguatbjerebweinuef.supabase.co',
  'YOUR_ANON_KEY'
);
```

### Authentication Endpoints

#### Sign Up with Email

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      gender: 'male', // or 'female'
    }
  }
});

// Response
{
  user: {
    id: 'uuid',
    email: 'user@example.com',
    user_metadata: { gender: 'male' }
  },
  session: {
    access_token: 'jwt_token',
    refresh_token: 'refresh_token'
  }
}
```

#### Sign In with Email

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Response: Same as Sign Up
```

#### Sign In with Google

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'monzieai://auth/callback',
    scopes: 'email profile'
  }
});

// Opens OAuth flow
```

#### Sign In with Apple

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'apple',
  options: {
    redirectTo: 'monzieai://auth/callback'
  }
});

// Opens Apple Sign In
```

#### Sign Out

```typescript
const { error } = await supabase.auth.signOut();
```

#### Get Current Session

```typescript
const { data: { session }, error } = await supabase.auth.getSession();

// Response
{
  session: {
    access_token: 'jwt_token',
    refresh_token: 'refresh_token',
    user: { ... }
  }
}
```

#### Update User Profile

```typescript
const { data, error } = await supabase.auth.updateUser({
  data: {
    gender: 'female',
    display_name: 'Jane Doe'
  }
});
```

### Database Endpoints

#### Scenes Table

**Get All Active Scenes**

```typescript
const { data, error } = await supabase
  .from('scenes')
  .select('*')
  .eq('is_active', true)
  .order('created_at', { ascending: false });

// Response
[
  {
    id: 'uuid',
    name: 'Professional Portrait',
    description: 'A professional portrait scene',
    category: 'portrait',
    preview_url: 'https://...',
    prompt_template: 'A professional {gender} portrait...',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]
```

**Get Scene by ID**

```typescript
const { data, error } = await supabase
  .from('scenes')
  .select('*')
  .eq('id', sceneId)
  .single();

// Response: Single scene object
```

**Get Scenes by Category**

```typescript
const { data, error } = await supabase
  .from('scenes')
  .select('*')
  .eq('category', 'portrait')
  .eq('is_active', true);

// Response: Array of scenes
```

**Search Scenes**

```typescript
const { data, error } = await supabase
  .from('scenes')
  .select('*')
  .ilike('name', `%${searchQuery}%`)
  .eq('is_active', true);

// Response: Array of matching scenes
```

#### Generated Images Table

**Create Generated Image Record**

```typescript
const { data, error } = await supabase
  .from('generated_images')
  .insert({
    user_id: userId,
    scene_id: sceneId,
    image_url: 'https://storage.url/image.jpg',
    thumbnail_url: 'https://storage.url/thumb.jpg',
    prompt: 'Full prompt used',
    generation_time: 45.2,
    model: 'flux-pro-1.1'
  })
  .select()
  .single();

// Response
{
  id: 'uuid',
  user_id: 'user_uuid',
  scene_id: 'scene_uuid',
  image_url: 'https://...',
  thumbnail_url: 'https://...',
  prompt: 'Full prompt',
  is_favorite: false,
  generation_time: 45.2,
  model: 'flux-pro-1.1',
  created_at: '2024-01-01T00:00:00Z'
}
```

**Get User's Generated Images**

```typescript
const { data, error } = await supabase
  .from('generated_images')
  .select('*, scenes(*)')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(50);

// Response: Array of images with scene details
```

**Get Favorite Images**

```typescript
const { data, error } = await supabase
  .from('generated_images')
  .select('*, scenes(*)')
  .eq('user_id', userId)
  .eq('is_favorite', true)
  .order('created_at', { ascending: false });

// Response: Array of favorite images
```

**Toggle Favorite**

```typescript
const { data, error } = await supabase
  .from('generated_images')
  .update({ is_favorite: !currentValue })
  .eq('id', imageId)
  .eq('user_id', userId)
  .select()
  .single();

// Response: Updated image object
```

**Delete Generated Image**

```typescript
const { error } = await supabase
  .from('generated_images')
  .delete()
  .eq('id', imageId)
  .eq('user_id', userId);

// Response: { error: null } on success
```

#### User Profiles Table

**Get User Profile**

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// Response
{
  id: 'uuid',
  email: 'user@example.com',
  gender: 'male',
  display_name: 'John Doe',
  avatar_url: 'https://...',
  is_premium: false,
  generation_count: 10,
  created_at: '2024-01-01T00:00:00Z'
}
```

**Update User Profile**

```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    gender: 'female',
    display_name: 'Jane Doe'
  })
  .eq('id', userId)
  .select()
  .single();

// Response: Updated profile object
```

#### Analytics Table

**Track Event**

```typescript
const { error } = await supabase
  .from('analytics_events')
  .insert({
    user_id: userId,
    event_name: 'image_generated',
    event_properties: {
      scene_id: sceneId,
      generation_time: 45.2,
      model: 'flux-pro-1.1'
    },
    platform: 'ios',
    app_version: '1.0.0'
  });

// Response: { error: null } on success
```

**Get User Analytics**

```typescript
const { data, error } = await supabase
  .from('analytics_events')
  .select('*')
  .eq('user_id', userId)
  .gte('created_at', startDate)
  .lte('created_at', endDate);

// Response: Array of events
```

### Storage Endpoints

#### Upload Image

```typescript
const { data, error } = await supabase.storage
  .from('generated-images')
  .upload(`${userId}/${imageId}.jpg`, file, {
    contentType: 'image/jpeg',
    cacheControl: '3600',
    upsert: false
  });

// Response
{
  path: 'user_id/image_id.jpg'
}
```

#### Get Public URL

```typescript
const { data } = supabase.storage
  .from('generated-images')
  .getPublicUrl(`${userId}/${imageId}.jpg`);

// Response
{
  publicUrl: 'https://groguatbjerebweinuef.supabase.co/storage/v1/object/public/generated-images/user_id/image_id.jpg'
}
```

#### Download Image

```typescript
const { data, error } = await supabase.storage
  .from('generated-images')
  .download(`${userId}/${imageId}.jpg`);

// Response: Blob
```

#### Delete Image

```typescript
const { error } = await supabase.storage
  .from('generated-images')
  .remove([`${userId}/${imageId}.jpg`]);

// Response: { error: null } on success
```

### Realtime Subscriptions

#### Subscribe to Scenes Changes

```typescript
const subscription = supabase
  .channel('scenes_channel')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'scenes'
  }, (payload) => {
    console.log('Scene changed:', payload);
  })
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

#### Subscribe to User's Images

```typescript
const subscription = supabase
  .channel('user_images_channel')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'generated_images',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('New image:', payload.new);
  })
  .subscribe();
```

## 🎨 FAL.AI API

### Configuration

```typescript
import * as fal from "@fal-ai/serverless-client";

fal.config({
  credentials: "81fbe3b1-9c8f-40f6-a2f1-21f613bb7452:d908e8ab5ba1b178a55d162e326335e6"
});
```

### Generate Image with Flux Pro

```typescript
const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
  input: {
    prompt: "A professional female portrait with studio lighting, highly detailed, 8k resolution",
    image_size: "landscape_16_9",
    num_inference_steps: 28,
    guidance_scale: 3.5,
    num_images: 1,
    enable_safety_checker: true,
    safety_tolerance: "2",
    output_format: "jpeg",
    seed: Math.floor(Math.random() * 1000000)
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      console.log('Progress:', update.logs);
    }
  },
});

// Response
{
  images: [
    {
      url: "https://fal.media/files/...",
      width: 1024,
      height: 768,
      content_type: "image/jpeg"
    }
  ],
  timings: {
    inference: 45.2
  },
  seed: 123456,
  has_nsfw_concepts: [false],
  prompt: "Full prompt used"
}
```

### Generate with Image-to-Image

```typescript
const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
  input: {
    prompt: "A professional portrait in a business setting",
    image_url: "https://your-image-url.jpg", // User's photo
    image_size: "portrait_4_3",
    num_inference_steps: 28,
    guidance_scale: 3.5,
    strength: 0.75, // How much to transform (0-1)
    num_images: 1,
    enable_safety_checker: true
  }
});

// Response: Same as above
```

### Supported Image Sizes

```typescript
type ImageSize = 
  | "square_hd"      // 1024x1024
  | "square"         // 512x512
  | "portrait_4_3"   // 768x1024
  | "portrait_16_9"  // 576x1024
  | "landscape_4_3"  // 1024x768
  | "landscape_16_9" // 1024x576
```

### Error Responses

```typescript
// Rate limit exceeded
{
  error: "Rate limit exceeded",
  status: 429
}

// Invalid API key
{
  error: "Unauthorized",
  status: 401
}

// NSFW content detected
{
  error: "NSFW content detected",
  has_nsfw_concepts: [true]
}
```

## 💎 RevenueCat API

### Configuration

```typescript
import Purchases from 'react-native-purchases';

await Purchases.configure({
  apiKey: 'appl_trbAScawsKlTSJjxkSAlOyIwMfn',
  appUserID: userId, // Optional - links to your user ID
});
```

### Get Offerings

```typescript
const offerings = await Purchases.getOfferings();

// Response
{
  current: {
    identifier: "default",
    serverDescription: "Default offering",
    availablePackages: [
      {
        identifier: "weekly",
        packageType: "WEEKLY",
        product: {
          identifier: "com.someplanets.monzieai.weekly",
          description: "Weekly Premium Subscription",
          title: "Weekly Premium",
          price: 9.99,
          priceString: "$9.99",
          currencyCode: "USD",
          introPrice: {
            price: 4.99,
            priceString: "$4.99",
            period: "P1W",
            cycles: 1
          }
        }
      },
      {
        identifier: "monthly",
        packageType: "MONTHLY",
        product: {
          identifier: "com.someplanets.monzieai.monthly",
          price: 29.99,
          priceString: "$29.99"
        }
      },
      {
        identifier: "annual",
        packageType: "ANNUAL",
        product: {
          identifier: "com.someplanets.monzieai.annual",
          price: 299.99,
          priceString: "$299.99"
        }
      }
    ]
  }
}
```

### Purchase Package

```typescript
const { customerInfo, productIdentifier } = await Purchases.purchasePackage(
  selectedPackage
);

// Response
{
  customerInfo: {
    originalAppUserId: "user_id",
    entitlements: {
      active: {
        premium: {
          identifier: "premium",
          isActive: true,
          willRenew: true,
          periodType: "NORMAL",
          latestPurchaseDate: "2024-01-01T00:00:00Z",
          originalPurchaseDate: "2024-01-01T00:00:00Z",
          expirationDate: "2024-02-01T00:00:00Z",
          productIdentifier: "com.someplanets.monzieai.monthly"
        }
      }
    }
  },
  productIdentifier: "com.someplanets.monzieai.monthly"
}
```

### Restore Purchases

```typescript
const customerInfo = await Purchases.restorePurchases();

// Response: Same customerInfo object as purchase
```

### Check Subscription Status

```typescript
const customerInfo = await Purchases.getCustomerInfo();

const isPremium = customerInfo.entitlements.active['premium'] !== undefined;

// Response
{
  entitlements: {
    active: {
      premium: { ... } // Only present if user has active subscription
    }
  }
}
```

### Get Customer Info

```typescript
const customerInfo = await Purchases.getCustomerInfo();

// Response
{
  originalAppUserId: "user_id",
  activeSubscriptions: ["com.someplanets.monzieai.monthly"],
  allPurchasedProductIdentifiers: [
    "com.someplanets.monzieai.weekly",
    "com.someplanets.monzieai.monthly"
  ],
  latestExpirationDate: "2024-02-01T00:00:00Z",
  entitlements: { ... },
  nonSubscriptionTransactions: [],
  requestDate: "2024-01-15T12:00:00Z"
}
```

### Identify User

```typescript
await Purchases.logIn(userId);

// Response: CustomerInfo object
```

### Anonymous User

```typescript
await Purchases.logOut();

// Response: CustomerInfo object (anonymous)
```

## 🔧 Internal Services API

### Image Generation Service

```typescript
interface GenerateImageParams {
  userId: string;
  sceneId: string;
  photoUri: string;
  gender: 'male' | 'female';
}

const result = await imageGenerationService.generate(params);

// Response
{
  id: 'uuid',
  imageUrl: 'https://storage.url/image.jpg',
  thumbnailUrl: 'https://storage.url/thumb.jpg',
  prompt: 'Full prompt used',
  generationTime: 45.2,
  createdAt: Date
}
```

### Scene Service

```typescript
// Get all scenes
const scenes = await sceneService.getScenes();

// Get scenes by category
const portraitScenes = await sceneService.getScenesByCategory('portrait');

// Search scenes
const results = await sceneService.searchScenes('professional');

// Get scene details
const scene = await sceneService.getSceneById(sceneId);
```

### Storage Service

```typescript
// Upload image
const url = await storageService.uploadImage(userId, file);

// Upload from URI
const url = await storageService.uploadFromUri(userId, uri);

// Delete image
await storageService.deleteImage(imageUrl);

// Get public URL
const url = storageService.getPublicUrl(path);
```

### Analytics Service

```typescript
// Track event
analyticsService.trackEvent('image_generated', {
  scene_id: sceneId,
  generation_time: 45.2,
  model: 'flux-pro-1.1'
});

// Track screen view
analyticsService.trackScreenView('HomeScreen');

// Track user property
analyticsService.setUserProperty('is_premium', true);
```

### Notification Service

```typescript
// Request permissions
const granted = await notificationService.requestPermissions();

// Schedule notification
await notificationService.scheduleNotification({
  title: 'Image Ready!',
  body: 'Your AI-generated image is ready to view',
  data: { imageId: 'uuid' }
});

// Register for push notifications
const token = await notificationService.registerForPushNotifications();
```

### Usage Service

```typescript
// Check if user can generate
const canGenerate = await usageService.canUserGenerate(userId);

// Increment usage
await usageService.incrementUsage(userId);

// Get usage stats
const stats = await usageService.getUsageStats(userId);

// Response
{
  dailyCount: 5,
  weeklyCount: 15,
  monthlyCount: 50,
  totalCount: 150,
  limit: 10, // Daily limit for free users
  isPremium: false
}
```

## 🚨 Error Handling

### Error Types

```typescript
enum ErrorCode {
  // Authentication
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  
  // Database
  DB_QUERY_FAILED = 'DB_QUERY_FAILED',
  DB_NOT_FOUND = 'DB_NOT_FOUND',
  DB_DUPLICATE_ENTRY = 'DB_DUPLICATE_ENTRY',
  
  // Storage
  STORAGE_UPLOAD_FAILED = 'STORAGE_UPLOAD_FAILED',
  STORAGE_DOWNLOAD_FAILED = 'STORAGE_DOWNLOAD_FAILED',
  STORAGE_DELETE_FAILED = 'STORAGE_DELETE_FAILED',
  
  // AI Generation
  AI_GENERATION_FAILED = 'AI_GENERATION_FAILED',
  AI_NSFW_DETECTED = 'AI_NSFW_DETECTED',
  AI_RATE_LIMIT = 'AI_RATE_LIMIT',
  
  // Subscription
  SUB_PURCHASE_CANCELLED = 'SUB_PURCHASE_CANCELLED',
  SUB_PURCHASE_FAILED = 'SUB_PURCHASE_FAILED',
  SUB_NOT_ACTIVE = 'SUB_NOT_ACTIVE',
  
  // Usage
  USAGE_LIMIT_EXCEEDED = 'USAGE_LIMIT_EXCEEDED',
  USAGE_PREMIUM_REQUIRED = 'USAGE_PREMIUM_REQUIRED',
  
  // Network
  NETWORK_ERROR = 'NETWORK_ERROR',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  
  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

interface APIError {
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp: Date;
}
```

### Error Response Format

```typescript
{
  error: {
    code: 'AI_RATE_LIMIT',
    message: 'Rate limit exceeded. Please try again later.',
    details: {
      retryAfter: 60,
      currentUsage: 100,
      limit: 100
    },
    timestamp: '2024-01-01T12:00:00Z'
  }
}
```

### Error Handling Example

```typescript
try {
  const result = await imageGenerationService.generate(params);
} catch (error) {
  if (error.code === ErrorCode.AI_RATE_LIMIT) {
    showAlert('Rate limit exceeded', 'Please try again in a few minutes');
  } else if (error.code === ErrorCode.USAGE_LIMIT_EXCEEDED) {
    navigation.navigate('Paywall');
  } else if (error.code === ErrorCode.AI_NSFW_DETECTED) {
    showAlert('Content Policy', 'The generated content was flagged');
  } else {
    showAlert('Error', error.message);
  }
  
  // Log to monitoring
  logger.error('Generation failed', error);
}
```

## ⏱️ Rate Limiting

### FAL.AI Rate Limits

- **Free Tier**: 100 requests/day
- **Paid Tier**: 1000 requests/day
- **Concurrent Requests**: 5 max

### Supabase Rate Limits

- **Database Queries**: 1000 requests/minute
- **Storage Uploads**: 100 uploads/minute
- **Auth Requests**: 50 requests/minute

### RevenueCat Rate Limits

- **API Calls**: No hard limit (reasonable use)
- **Purchase Attempts**: Handled by Apple/Google

### App-Level Rate Limiting

```typescript
// Free users: 10 generations/day
// Premium users: Unlimited

const canGenerate = await usageService.canUserGenerate(userId);

if (!canGenerate) {
  throw new Error({
    code: ErrorCode.USAGE_LIMIT_EXCEEDED,
    message: 'Daily generation limit reached'
  });
}
```

## 🔐 Authentication

### JWT Token Structure

```typescript
{
  sub: "user_uuid",
  email: "user@example.com",
  role: "authenticated",
  iat: 1640000000,
  exp: 1640003600,
  user_metadata: {
    gender: "male"
  }
}
```

### Authorization Headers

```typescript
// Supabase requests automatically include:
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>

// FAL.AI requests:
Authorization: Key <fal_api_key>
```

### Token Refresh

```typescript
// Automatic token refresh with Supabase client
const { data, error } = await supabase.auth.refreshSession();

// Manual refresh
const { data, error } = await supabase.auth.refreshSession({
  refresh_token: currentRefreshToken
});
```

## 📊 API Response Times (Average)

- **Supabase Database Query**: 50-200ms
- **Supabase Storage Upload**: 500-2000ms
- **FAL.AI Image Generation**: 30-60 seconds
- **RevenueCat Purchase**: 1-3 seconds
- **Authentication**: 200-500ms

## 🔄 Retry Strategy

```typescript
const retryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000,    // 10 seconds
  backoff: 2,         // Exponential backoff
};

async function withRetry<T>(
  fn: () => Promise<T>,
  config = retryConfig
): Promise<T> {
  let lastError;
  
  for (let i = 0; i < config.maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i < config.maxRetries - 1) {
        const delay = Math.min(
          config.initialDelay * Math.pow(config.backoff, i),
          config.maxDelay
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
```

---

**Son Güncelleme**: 2024
**API Versiyonu**: 1.0.0