# MonzieAI - Servis Dokümantasyonu

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Core Services](#core-services)
3. [API Services](#api-services)
4. [Storage Services](#storage-services)
5. [Analytics Services](#analytics-services)
6. [Utility Services](#utility-services)
7. [Service Architecture](#service-architecture)

## 🎯 Genel Bakış

MonzieAI uygulaması, modüler ve yeniden kullanılabilir servis katmanına sahiptir. Tüm servisler `src/services/` dizininde bulunur ve singleton pattern kullanılarak implement edilmiştir.

### Servis Listesi

```
src/services/
├── analyticsService.ts          # Event tracking ve analytics
├── databaseService.ts           # Supabase database operations
├── errorLoggingService.ts       # Error tracking ve logging
├── falAIService.ts              # FAL.AI image generation
├── imageGenerationService.ts    # Image generation orchestration
├── localStorageService.ts       # Local data persistence
├── notificationService.ts       # Push notifications
├── packageService.ts            # Package management
├── revenueCatService.ts         # Subscription management
├── sceneService.ts              # Scene CRUD operations
├── sentryService.ts             # Sentry error tracking
├── storageService.ts            # Supabase storage operations
└── usageService.ts              # Usage tracking ve limits
```

## 🔧 Core Services

### 1. databaseService.ts

**Amaç**: Supabase PostgreSQL ile tüm database işlemleri

**Implementation**:
```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

class DatabaseService {
  private static instance: DatabaseService;
  private client: SupabaseClient;

  private constructor() {
    this.client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Generic query method
  async query<T>(
    table: string,
    options?: {
      select?: string;
      filters?: Record<string, any>;
      order?: { column: string; ascending?: boolean };
      limit?: number;
    }
  ): Promise<T[]> {
    let query = this.client.from(table).select(options?.select || '*');

    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options?.order) {
      query = query.order(options.order.column, {
        ascending: options.order.ascending ?? true,
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as T[];
  }

  // Insert
  async insert<T>(table: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.client
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result as T;
  }

  // Update
  async update<T>(
    table: string,
    id: string,
    data: Partial<T>
  ): Promise<T> {
    const { data: result, error } = await this.client
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result as T;
  }

  // Delete
  async delete(table: string, id: string): Promise<void> {
    const { error } = await this.client
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Get by ID
  async getById<T>(table: string, id: string): Promise<T | null> {
    const { data, error } = await this.client
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data as T;
  }

  // Realtime subscription
  subscribeToTable(
    table: string,
    callback: (payload: any) => void,
    filter?: { column: string; value: any }
  ) {
    const channel = this.client
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter ? `${filter.column}=eq.${filter.value}` : undefined,
        },
        callback
      )
      .subscribe();

    return channel;
  }

  // Get client for complex queries
  getClient(): SupabaseClient {
    return this.client;
  }
}

export const databaseService = DatabaseService.getInstance();
```

**Kullanım**:
```typescript
// Query
const scenes = await databaseService.query<Scene>('scenes', {
  filters: { is_active: true },
  order: { column: 'created_at', ascending: false },
  limit: 10,
});

// Insert
const newImage = await databaseService.insert<GeneratedImage>(
  'generated_images',
  {
    user_id: userId,
    scene_id: sceneId,
    image_url: imageUrl,
  }
);

// Update
await databaseService.update<User>('profiles', userId, {
  is_premium: true,
});

// Delete
await databaseService.delete('generated_images', imageId);

// Realtime
const subscription = databaseService.subscribeToTable(
  'scenes',
  (payload) => {
    console.log('Scene changed:', payload);
  }
);
```

---

### 2. sceneService.ts

**Amaç**: Scene CRUD operations ve caching

**Implementation**:
```typescript
import { databaseService } from './databaseService';
import { localStorageService } from './localStorageService';

interface Scene {
  id: string;
  name: string;
  description: string;
  category: string;
  preview_url: string;
  prompt_template: string;
  is_active: boolean;
  is_premium: boolean;
  usage_count: number;
}

class SceneService {
  private static instance: SceneService;
  private cacheKey = 'scenes_cache';
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  static getInstance(): SceneService {
    if (!SceneService.instance) {
      SceneService.instance = new SceneService();
    }
    return SceneService.instance;
  }

  // Get all active scenes
  async getScenes(): Promise<Scene[]> {
    try {
      // Check cache first
      const cached = await localStorageService.get<{
        data: Scene[];
        timestamp: number;
      }>(this.cacheKey);

      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }

      // Fetch from database
      const scenes = await databaseService.query<Scene>('scenes', {
        filters: { is_active: true },
        order: { column: 'order_index', ascending: true },
      });

      // Update cache
      await localStorageService.set(this.cacheKey, {
        data: scenes,
        timestamp: Date.now(),
      });

      return scenes;
    } catch (error) {
      console.error('Error fetching scenes:', error);
      throw error;
    }
  }

  // Get scenes by category
  async getScenesByCategory(category: string): Promise<Scene[]> {
    const scenes = await databaseService.query<Scene>('scenes', {
      filters: { category, is_active: true },
      order: { column: 'usage_count', ascending: false },
    });
    return scenes;
  }

  // Get single scene
  async getSceneById(id: string): Promise<Scene | null> {
    return databaseService.getById<Scene>('scenes', id);
  }

  // Search scenes
  async searchScenes(query: string): Promise<Scene[]> {
    const client = databaseService.getClient();
    const { data, error } = await client
      .from('scenes')
      .select('*')
      .ilike('name', `%${query}%`)
      .eq('is_active', true);

    if (error) throw error;
    return data as Scene[];
  }

  // Get popular scenes
  async getPopularScenes(limit: number = 10): Promise<Scene[]> {
    const scenes = await databaseService.query<Scene>('scenes', {
      filters: { is_active: true },
      order: { column: 'usage_count', ascending: false },
      limit,
    });
    return scenes;
  }

  // Get premium scenes
  async getPremiumScenes(): Promise<Scene[]> {
    const scenes = await databaseService.query<Scene>('scenes', {
      filters: { is_active: true, is_premium: true },
    });
    return scenes;
  }

  // Increment usage count
  async incrementUsage(sceneId: string): Promise<void> {
    const client = databaseService.getClient();
    await client.rpc('increment_scene_usage', { scene_id: sceneId });
  }

  // Clear cache
  async clearCache(): Promise<void> {
    await localStorageService.remove(this.cacheKey);
  }
}

export const sceneService = SceneService.getInstance();
```

---

### 3. imageGenerationService.ts

**Amaç**: AI image generation orchestration

**Implementation**:
```typescript
import { falAIService } from './falAIService';
import { storageService } from './storageService';
import { databaseService } from './databaseService';
import { sceneService } from './sceneService';
import { usageService } from './usageService';
import { analyticsService } from './analyticsService';

interface GenerateParams {
  userId: string;
  sceneId: string;
  photoUri: string;
  gender: 'male' | 'female';
}

interface GeneratedResult {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  prompt: string;
  generationTime: number;
  createdAt: Date;
}

class ImageGenerationService {
  private static instance: ImageGenerationService;

  static getInstance(): ImageGenerationService {
    if (!ImageGenerationService.instance) {
      ImageGenerationService.instance = new ImageGenerationService();
    }
    return ImageGenerationService.instance;
  }

  async generate(params: GenerateParams): Promise<GeneratedResult> {
    const startTime = Date.now();

    try {
      // 1. Check usage limits
      const canGenerate = await usageService.canUserGenerate(params.userId);
      if (!canGenerate) {
        throw new Error('Daily generation limit reached');
      }

      // 2. Get scene details
      const scene = await sceneService.getSceneById(params.sceneId);
      if (!scene) {
        throw new Error('Scene not found');
      }

      // 3. Build prompt
      const prompt = this.buildPrompt(scene.prompt_template, params.gender);

      // 4. Upload photo to storage (if needed)
      let photoUrl = params.photoUri;
      if (!photoUrl.startsWith('http')) {
        photoUrl = await storageService.uploadFromUri(
          params.userId,
          params.photoUri
        );
      }

      // 5. Generate image with FAL.AI
      const aiResult = await falAIService.generate({
        prompt,
        imageUrl: photoUrl,
        negativePrompt: scene.negative_prompt,
      });

      // 6. Upload generated image to storage
      const imageUrl = await storageService.uploadFromUrl(
        params.userId,
        aiResult.imageUrl
      );

      // 7. Create thumbnail (optional)
      const thumbnailUrl = await this.createThumbnail(imageUrl);

      // 8. Save to database
      const generationTime = (Date.now() - startTime) / 1000;
      const result = await databaseService.insert<any>(
        'generated_images',
        {
          user_id: params.userId,
          scene_id: params.sceneId,
          image_url: imageUrl,
          thumbnail_url: thumbnailUrl,
          original_photo_url: photoUrl,
          prompt,
          generation_time: generationTime,
          model: 'flux-pro-1.1',
          seed: aiResult.seed,
        }
      );

      // 9. Update usage
      await usageService.incrementUsage(params.userId);
      await sceneService.incrementUsage(params.sceneId);

      // 10. Track analytics
      analyticsService.trackEvent('image_generated', {
        scene_id: params.sceneId,
        generation_time: generationTime,
        success: true,
      });

      return {
        id: result.id,
        imageUrl,
        thumbnailUrl,
        prompt,
        generationTime,
        createdAt: new Date(result.created_at),
      };
    } catch (error) {
      // Track failure
      analyticsService.trackEvent('image_generation_failed', {
        scene_id: params.sceneId,
        error: error.message,
      });

      throw error;
    }
  }

  private buildPrompt(template: string, gender: 'male' | 'female'): string {
    return template.replace('{gender}', gender);
  }

  private async createThumbnail(imageUrl: string): Promise<string> {
    // Implementation for creating thumbnail
    // Using expo-image-manipulator or similar
    return imageUrl; // Placeholder
  }
}

export const imageGenerationService = ImageGenerationService.getInstance();
```

## 🎨 API Services

### 1. falAIService.ts

**Amaç**: FAL.AI API integration

**Implementation**:
```typescript
import * as fal from '@fal-ai/serverless-client';

interface GenerateOptions {
  prompt: string;
  imageUrl?: string;
  negativePrompt?: string;
  imageSize?: string;
  numInferenceSteps?: number;
  guidanceScale?: number;
}

interface GenerateResult {
  imageUrl: string;
  seed: number;
  hasNsfwConcepts: boolean[];
  timings: {
    inference: number;
  };
}

class FALAIService {
  private static instance: FALAIService;

  private constructor() {
    fal.config({
      credentials: process.env.FAL_API_KEY!,
    });
  }

  static getInstance(): FALAIService {
    if (!FALAIService.instance) {
      FALAIService.instance = new FALAIService();
    }
    return FALAIService.instance;
  }

  async generate(options: GenerateOptions): Promise<GenerateResult> {
    try {
      const result = await fal.subscribe('fal-ai/flux-pro/v1.1', {
        input: {
          prompt: options.prompt,
          image_url: options.imageUrl,
          negative_prompt: options.negativePrompt,
          image_size: options.imageSize || 'square_hd',
          num_inference_steps: options.numInferenceSteps || 28,
          guidance_scale: options.guidanceScale || 3.5,
          num_images: 1,
          enable_safety_checker: true,
          safety_tolerance: '2',
          output_format: 'jpeg',
          seed: Math.floor(Math.random() * 1000000),
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            console.log('Progress:', update.logs);
          }
        },
      });

      return {
        imageUrl: result.images[0].url,
        seed: result.seed,
        hasNsfwConcepts: result.has_nsfw_concepts || [false],
        timings: result.timings,
      };
    } catch (error) {
      console.error('FAL.AI generation error:', error);
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      // Health check implementation
      return true;
    } catch {
      return false;
    }
  }
}

export const falAIService = FALAIService.getInstance();
```

---

### 2. revenueCatService.ts

**Amaç**: Subscription management via RevenueCat

**Implementation**:
```typescript
import Purchases, {
  CustomerInfo,
  PurchasesOfferings,
  PurchasesPackage,
} from 'react-native-purchases';
import { Platform } from 'react-native';

class RevenueCatService {
  private static instance: RevenueCatService;
  private initialized = false;

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  async initialize(userId?: string): Promise<void> {
    if (this.initialized) return;

    try {
      const apiKey =
        Platform.OS === 'ios'
          ? process.env.REVENUECAT_API_KEY_IOS!
          : process.env.REVENUECAT_API_KEY_ANDROID!;

      await Purchases.configure({
        apiKey,
        appUserID: userId,
      });

      // Enable debug logs in development
      if (__DEV__) {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      }

      this.initialized = true;
    } catch (error) {
      console.error('RevenueCat initialization error:', error);
      throw error;
    }
  }

  async getOfferings(): Promise<PurchasesOfferings | null> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings;
    } catch (error) {
      console.error('Error fetching offerings:', error);
      return null;
    }
  }

  async purchasePackage(
    pkg: PurchasesPackage
  ): Promise<{ customerInfo: CustomerInfo; productIdentifier: string }> {
    try {
      const { customerInfo, productIdentifier } =
        await Purchases.purchasePackage(pkg);
      return { customerInfo, productIdentifier };
    } catch (error) {
      if (error.userCancelled) {
        throw new Error('Purchase cancelled by user');
      }
      throw error;
    }
  }

  async restorePurchases(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('Error fetching customer info:', error);
      throw error;
    }
  }

  async checkSubscriptionStatus(): Promise<{
    isPremium: boolean;
    expiresAt?: Date;
    willRenew?: boolean;
  }> {
    try {
      const customerInfo = await this.getCustomerInfo();
      const entitlement = customerInfo.entitlements.active['premium'];

      if (entitlement) {
        return {
          isPremium: true,
          expiresAt: new Date(entitlement.expirationDate!),
          willRenew: entitlement.willRenew,
        };
      }

      return { isPremium: false };
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return { isPremium: false };
    }
  }

  async logIn(userId: string): Promise<CustomerInfo> {
    try {
      const { customerInfo } = await Purchases.logIn(userId);
      return customerInfo;
    } catch (error) {
      console.error('Error logging in to RevenueCat:', error);
      throw error;
    }
  }

  async logOut(): Promise<CustomerInfo> {
    try {
      const { customerInfo } = await Purchases.logOut();
      return customerInfo;
    } catch (error) {
      console.error('Error logging out from RevenueCat:', error);
      throw error;
    }
  }
}

export const revenueCatService = RevenueCatService.getInstance();
```

## 💾 Storage Services

### 1. storageService.ts

**Amaç**: Supabase Storage operations

**Implementation**:
```typescript
import { databaseService } from './databaseService';
import * as FileSystem from 'expo-file-system';

class StorageService {
  private static instance: StorageService;
  private bucketName = 'generated-images';

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async uploadFromUri(userId: string, uri: string): Promise<string> {
    try {
      const fileName = `${Date.now()}.jpg`;
      const path = `${userId}/${fileName}`;

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert to blob
      const blob = this.base64ToBlob(base64, 'image/jpeg');

      // Upload to Supabase
      const client = databaseService.getClient();
      const { data, error } = await client.storage
        .from(this.bucketName)
        .upload(path, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const publicUrl = this.getPublicUrl(data.path);
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async uploadFromUrl(userId: string, url: string): Promise<string> {
    try {
      // Download image
      const response = await fetch(url);
      const blob = await response.blob();

      const fileName = `${Date.now()}.jpg`;
      const path = `${userId}/${fileName}`;

      // Upload to Supabase
      const client = databaseService.getClient();
      const { data, error } = await client.storage
        .from(this.bucketName)
        .upload(path, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
        });

      if (error) throw error;

      const publicUrl = this.getPublicUrl(data.path);
      return publicUrl;
    } catch (error) {
      console.error('Upload from URL error:', error);
      throw error;
    }
  }

  getPublicUrl(path: string): string {
    const client = databaseService.getClient();
    const { data } = client.storage
      .from(this.bucketName)
      .getPublicUrl(path);
    return data.publicUrl;
  }

  async delete(path: string): Promise<void> {
    const client = databaseService.getClient();
    const { error } = await client.storage
      .from(this.bucketName)
      .remove([path]);

    if (error) throw error;
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
  }
}

export const storageService = StorageService.getInstance();
```

---

### 2. localStorageService.ts

**Amaç**: Local data persistence with AsyncStorage

**Implementation**:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

class LocalStorageService {
  private static instance: LocalStorageService;

  static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  async multiGet(keys: string[]): Promise<Record<string, any>> {
    try {
      const values = await AsyncStorage.multiGet(keys);
      const result: Record<string, any> = {};

      values.forEach(([key, value]) => {
        if (value) {
          result[key] = JSON.parse(value);
        }
      });

      return result;
    } catch (error) {
      console.error('Error in multiGet:', error);
      return {};
    }
  }
}

export const localStorageService = LocalStorageService.getInstance();
```

## 📊 Analytics Services

### 1. analyticsService.ts

**Amaç**: Event tracking ve analytics

**Implementation**:
```typescript
import { databaseService } from './databaseService';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

interface EventProperties {
  [key: string]: any;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private sessionId: string;
  private userId?: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  async trackEvent(
    eventName: string,
    properties?: EventProperties
  ): Promise<void> {
    try {
      await databaseService.insert('analytics_events', {
        user_id: this.userId,
        event_name: eventName,
        event_properties: properties,
        platform: Platform.OS,
        app_version: Constants.expoConfig?.version,
        device_info: {
          platform: Platform.OS,
          version: Platform.Version,
        },
        session_id: this.sessionId,
      });
    } catch (error) {
      console.error('Error tracking event:', error);
      // Don't throw - analytics should not break the app
    }
  }

  async trackScreenView(screenName: string): Promise<void> {
    await this.trackEvent('screen_view', { screen_name: screenName });
  }

  setUserProperty(key: string, value: any): void {
    // Implementation for setting user properties
    // Could store in local storage or send to analytics service
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const analyticsService = AnalyticsService.getInstance();
```

---

### 2. usageService.ts

**Amaç**: Usage tracking ve limit enforcement

**Implementation**:
```typescript
import { databaseService } from './databaseService';

interface UsageStats {
  dailyCount: number;
  weeklyCount: number;
  monthlyCount: number;
  totalCount: number;
  limit: number;
  isPremium: boolean;
}

class UsageService {
  private static instance: UsageService;
  private readonly FREE_DAILY_LIMIT = 10;

  static getInstance(): UsageService {
    if (!UsageService.instance) {
      UsageService.instance = new UsageService();
    }
    return UsageService.instance;
  }

  async canUserGenerate(userId: string): Promise<boolean> {
    try {
      const stats = await this.getUsageStats(userId);

      // Premium users have unlimited generations
      if (stats.isPremium) {
        return true;
      }

      // Check daily limit for free users
      return stats.dailyCount < stats.limit;
    } catch (error) {
      console.error('Error checking usage:', error);
      return false;
    }
  }

  async incrementUsage(userId: string): Promise<void> {
    try {
      const client = databaseService.getClient();
      const today = new Date().toISOString().split('T')[0];

      // Upsert usage tracking
      await client
        .from('usage_tracking')
        .upsert({
          user_id: userId,
          date: today,
          generation_count: 1,
        })
        .eq('user_id', userId)
        .eq('date', today);

      // Update profile total count
      await client.rpc('increment_user_generation_count', {
        p_user_id: userId,
      });
    } catch (error) {
      console.error('Error incrementing usage:', error);
      throw error;
    }
  }

  async getUsageStats(userId: string): Promise<UsageStats> {
    try {
      const client = databaseService.getClient();
      const today = new Date().toISOString().split('T')[0];

      // Get user profile
      const { data: profile } = await client
        .from('profiles')
        .select('is_premium, generation_count')
        .eq('id', userId)
        .single();

      // Get daily usage
      const { data: dailyUsage } = await client
        .from('usage_tracking')
        .select('generation_count')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      return {
        dailyCount: dailyUsage?.generation_count || 0,
        weeklyCount: 0, // Could be calculated
        monthlyCount: 0, // Could be calculated
        totalCount: profile?.generation_count || 0,
        limit: profile?.is_premium ? 999999 : this.FREE_DAILY_LIMIT,
        isPremium: profile?.is_premium || false,
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      throw error;
    }
  }
}

export const usageService = UsageService.getInstance();
```

## 🛠 Utility Services

### 1. notificationService.ts

**Amaç**: Push notifications management

**Implementation**:
```typescript
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  async registerForPushNotifications(): Promise<string | null> {
    try {
      const granted = await this.requestPermissions();
      if (!granted) return null;

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  async scheduleNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Immediate
    });
  }

  async scheduleDelayedNotification(
    title: string,
    body: string,
    seconds: number,
    data?: any
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: { seconds },
    });
  }

  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  addNotificationListener(
    callback: (notification: Notifications.Notification) => void
  ) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  addResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export const notificationService = NotificationService.getInstance();
```

---

### 2. errorLoggingService.ts

**Amaç**: Error tracking ve logging

**Implementation**:
```typescript
import { Platform } from 'react-native';

type ErrorLevel = 'debug' | 'info' | 'warning' | 'error' | 'fatal';

interface LogEntry {
  level: ErrorLevel;
  message: string;
  timestamp: Date;
  context?: any;
  error?: Error;
}

class ErrorLoggingService {
  private static instance: ErrorLoggingService;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  static getInstance(): ErrorLoggingService {
    if (!ErrorLoggingService.instance) {
      ErrorLoggingService.instance = new ErrorLoggingService();
    }
    return ErrorLoggingService.instance;
  }

  private log(
    level: ErrorLevel,
    message: string,
    context?: any,
    error?: Error
  ): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
    };

    // Add to memory logs
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest
    }

    // Console output in development
    if (__DEV__) {
      const prefix = `[${level.toUpperCase()}]`;
      switch (level) {
        case 'debug':
        case 'info':
          console.log(prefix, message, context);
          break;
        case 'warning':
          console.warn(prefix, message, context);
          break;
        case 'error':
        case 'fatal':
          console.error(prefix, message, context, error);
          break;
      }
    }

    // Send to external service in production (Sentry, etc.)
    if (!__DEV__ && (level === 'error' || level === 'fatal')) {
      this.sendToExternalService(entry);
    }
  }

  debug(message: string, context?: any): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: any): void {
    this.log('info', message, context);
  }

  warning(message: string, context?: any): void {
    this.log('warning', message, context);
  }

  error(message: string, error?: Error, context?: any): void {
    this.log('error', message, context, error);
  }

  fatal(message: string, error?: Error, context?: any): void {
    this.log('fatal', message, context, error);
  }

  getLogs(level?: ErrorLevel): LogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  private async sendToExternalService(entry: LogEntry): Promise<void> {
    try {
      // Implementation for external service (Sentry, LogRocket, etc.)
      // This is a placeholder
      console.log('Sending to external service:', entry);
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }
}

export const logger = ErrorLoggingService.getInstance();
```

## 🏗️ Service Architecture

### Service Layer Pattern

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│         (Screens, Components)           │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│            Service Layer                │
│  ┌────────────────────────────────┐    │
│  │  Orchestration Services        │    │
│  │  • imageGenerationService      │    │
│  │  • sceneService                │    │
│  └────────────────────────────────┘    │
│                   ↓                      │
│  ┌────────────────────────────────┐    │
│  │  Core Services                 │    │
│  │  • databaseService             │    │
│  │  • storageService              │    │
│  │  • analyticsService            │    │
│  └────────────────────────────────┘    │
│                   ↓                      │
│  ┌────────────────────────────────┐    │
│  │  External API Services         │    │
│  │  • falAIService                │    │
│  │  • revenueCatService           │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### Best Practices

1. **Singleton Pattern**: All services use singleton pattern
2. **Error Handling**: Catch and log errors appropriately
3. **Type Safety**: Full TypeScript support
4. **Caching**: Implement caching where appropriate
5. **Modularity**: Each service has single responsibility
6. **Testing**: Services should be easily testable

### Service Dependencies

```typescript
// Good: Services depend on abstractions
class ImageGenerationService {
  constructor(
    private falAI: FALAIService,
    private storage: StorageService,
    private database: DatabaseService
  ) {}
}

// Bad: Direct instantiation
class ImageGenerationService {
  private falAI = new FALAIService(); // Hard to test
}
```

### Usage Example

```typescript
// In a React component
import { imageGenerationService } from '@/services/imageGenerationService';
import { revenueCatService } from '@/services/revenueCatService';
import { analyticsService } from '@/services/analyticsService';

const GenerateScreen = () => {
  const handleGenerate = async () => {
    try {
      // Track event
      analyticsService.trackEvent('generation_started');

      // Check subscription
      const { isPremium } = await revenueCatService.checkSubscriptionStatus();

      // Generate image
      const result = await imageGenerationService.generate({
        userId,
        sceneId,
        photoUri,
        gender,
      });

      // Track success
      analyticsService.trackEvent('generation_success', {
        imageId: result.id,
      });
    } catch (error) {
      logger.error('Generation failed', error);
      analyticsService.trackEvent('generation_failed');
    }
  };
};
```

---

**Son Güncelleme**: 2024
**Toplam Servis**: 13
**Mimari**: Singleton Pattern + Dependency Injection