# MonzieAI - Mimari Dokümantasyon

## İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Mimari Prensipler](#mimari-prensipler)
3. [Katmanlı Mimari](#katmanlı-mimari)
4. [Veri Akışı](#veri-akışı)
5. [Servis Mimarisi](#servis-mimarisi)
6. [State Management](#state-management)
7. [Navigation Mimarisi](#navigation-mimarisi)
8. [Güvenlik Mimarisi](#güvenlik-mimarisi)
9. [Performans Optimizasyonları](#performans-optimizasyonları)
10. [Tasarım Desenleri](#tasarım-desenleri)

## Genel Bakış

MonzieAI, Clean Architecture prensiplerine dayalı, katmanlı bir mimari yapısına sahiptir. Uygulama, maintainability, testability ve scalability odaklı tasarlanmıştır.

### Mimari Diyagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Screens  │  │Components│  │Navigation│  │  Hooks   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Entities │  │Use Cases │  │Interfaces│  │  Models  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Repository│  │  Mappers │  │   DTOs   │  │  Cache   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Supabase  │  │  FAL.AI  │  │RevenueCat│  │Analytics │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## ️ Mimari Prensipler

### 1. Separation of Concerns (SoC)
- Her katman kendi sorumluluğuna odaklanır
- Katmanlar arasında net sınırlar vardır
- İş mantığı UI'dan ayrılmıştır

### 2. Dependency Inversion Principle
- Üst seviye modüller alt seviye modüllere bağımlı değildir
- Her iki katman da abstraction'lara bağlıdır
- Interface'ler kullanılarak bağımlılıklar yönetilir

### 3. Single Responsibility Principle
- Her modül/sınıf/fonksiyon tek bir sorumluluğa sahiptir
- Değişiklikler izole edilmiştir
- Test edilebilirlik artırılmıştır

### 4. DRY (Don't Repeat Yourself)
- Kod tekrarı minimize edilmiştir
- Reusable component'ler ve utility fonksiyonları
- Shared logic servisler halinde organize edilmiştir

### 5. KISS (Keep It Simple, Stupid)
- Basit ve anlaşılır kod
- Over-engineering'den kaçınılmıştır
- Pragmatik çözümler tercih edilmiştir

## 📚 Katmanlı Mimari

### 1. Presentation Layer (UI/View)

**Lokasyon**: `src/screens/`, `src/components/`, `src/navigation/`

**Sorumluluklar**:
- Kullanıcı arayüzü render etme
- Kullanıcı etkileşimlerini yakalama
- State görselleştirme
- Navigation yönetimi

**Bileşenler**:

```typescript
// Screens
src/screens/
├── AuthScreen.tsx              # Kimlik doğrulama
├── OnboardingScreen.tsx        # Onboarding flow
├── HomeScreen.tsx              # Ana sayfa
├── SceneSelectionScreen.tsx    # Sahne seçimi
├── PhotoUploadScreen.tsx       # Fotoğraf yükleme
├── GeneratingScreen.tsx        # AI işleme animasyonu
├── GeneratedScreen.tsx         # Sonuç görüntüleme
├── GalleryScreen.tsx           # Galeri
├── ProfileScreen.tsx           # Profil
└── SettingsScreen.tsx          # Ayarlar

// Components
src/components/
└── ErrorBoundary.tsx           # Hata yakalama

// Navigation
src/navigation/
└── AppNavigator.tsx            # Ana navigation yapısı
```

**Özellikler**:
- Functional components + Hooks
- TypeScript ile tip güvenliği
- Responsive design
- Accessibility support
- Error boundaries

### 2. Domain Layer (Business Logic)

**Lokasyon**: `src/domain/`, `src/types/`

**Sorumluluklar**:
- İş kurallarını tanımlama
- Domain modelleri
- Use case'ler
- Business logic validation

**Bileşenler**:

```typescript
// Domain Models
interface User {
  id: string;
  email: string;
  gender?: 'male' | 'female';
  isPremium: boolean;
  subscription?: Subscription;
}

interface Scene {
  id: string;
  name: string;
  description: string;
  category: string;
  previewUrl: string;
  promptTemplate: string;
  isActive: boolean;
}

interface GeneratedImage {
  id: string;
  userId: string;
  sceneId: string;
  imageUrl: string;
  thumbnailUrl: string;
  prompt: string;
  isFavorite: boolean;
  createdAt: Date;
}
```

**Özellikler**:
- Framework bağımsız
- Pure TypeScript
- Business rules validation
- Domain events

### 3. Data Layer (Repository Pattern)

**Lokasyon**: `src/data/repositories/`, `src/services/`

**Sorumluluklar**:
- Veri kaynakları ile iletişim
- Veri dönüşümleri (mapping)
- Caching stratejileri
- Data persistence

**Bileşenler**:

```typescript
// Repository Pattern
interface ISceneRepository {
  getAll(): Promise<Scene[]>;
  getById(id: string): Promise<Scene | null>;
  getByCategory(category: string): Promise<Scene[]>;
  search(query: string): Promise<Scene[]>;
}

interface IImageRepository {
  create(data: CreateImageDto): Promise<GeneratedImage>;
  getByUserId(userId: string): Promise<GeneratedImage[]>;
  getFavorites(userId: string): Promise<GeneratedImage[]>;
  update(id: string, data: Partial<GeneratedImage>): Promise<GeneratedImage>;
  delete(id: string): Promise<void>;
}

interface IUserRepository {
  getById(id: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}
```

**Servisler**:

```typescript
src/services/
├── databaseService.ts          # Supabase DB operations
├── storageService.ts           # Supabase Storage operations
├── sceneService.ts             # Scene CRUD operations
├── imageGenerationService.ts   # Image generation orchestration
├── falAIService.ts             # FAL.AI API client
├── revenueCatService.ts        # Subscription management
├── analyticsService.ts         # Analytics tracking
├── notificationService.ts      # Push notifications
└── localStorageService.ts      # Local caching
```

### 4. Infrastructure Layer (External Services)

**Lokasyon**: `src/infrastructure/`, `src/config/`

**Sorumluluklar**:
- External API entegrasyonları
- SDK yapılandırmaları
- Network operations
- Platform-specific implementations

**Entegrasyonlar**:

```typescript
// Supabase Client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// FAL.AI Client
import * as fal from "@fal-ai/serverless-client";

fal.config({
  credentials: process.env.FAL_API_KEY,
});

// RevenueCat Client
import Purchases from 'react-native-purchases';

await Purchases.configure({
  apiKey: process.env.REVENUECAT_API_KEY_IOS,
});
```

## 🔄 Veri Akışı

### Image Generation Flow

```
┌──────────┐      ┌──────────┐      ┌──────────┐
│  User    │──1──>│  Screen  │──2──>│  Hook    │
└──────────┘      └──────────┘      └──────────┘
                                          │
                                          3
                                          ↓
┌──────────┐      ┌──────────┐      ┌──────────┐
│Supabase  │<─6───│ Service  │<─4───│Repository│
└──────────┘      └──────────┘      └──────────┘
     │                 │                   │
     7                 5                   │
     ↓                 ↓                   │
┌──────────┐      ┌──────────┐           │
│ Storage  │      │ FAL.AI   │           │
└──────────┘      └──────────┘           │
     │                 │                  │
     └────────8────────┴─────────────────┘
                       ↓
                  ┌──────────┐
                  │   UI     │
                  └──────────┘
```

**Adımlar**:
1. Kullanıcı sahne seçer ve fotoğraf yükler
2. Screen, hook'u tetikler
3. Hook, repository'yi çağırır
4. Repository, service'i orchestrate eder
5. Service, FAL.AI API'ı çağırır
6. Service, Supabase'e metadata kaydeder
7. Service, Supabase Storage'a görsel yükler
8. Sonuç UI'a döner ve görüntülenir

### Authentication Flow

```
┌──────────┐      ┌──────────┐      ┌──────────┐
│  User    │──1──>│AuthScreen│──2──>│AuthContext│
└──────────┘      └──────────┘      └──────────┘
                                          │
                                          3
                                          ↓
┌──────────┐      ┌──────────┐      ┌──────────┐
│RevenueCat│<─6───│ Supabase │<─4───│  Service │
└──────────┘      │   Auth   │      └──────────┘
     │            └──────────┘           │
     7                 │                 5
     ↓                 5                 ↓
┌──────────┐           ↓           ┌──────────┐
│Subscription         │            │AsyncStorage│
│  Sync    │          │            └──────────┘
└──────────┘          ↓
                 ┌──────────┐
                 │Navigation│
                 └──────────┘
```

**Adımlar**:
1. Kullanıcı giriş yöntemini seçer (Google/Apple/Email)
2. AuthScreen, AuthContext'i çağırır
3. AuthContext, Supabase Auth servisini kullanır
4. Supabase kimlik doğrulama yapar
5. Token ve user data local storage'a kaydedilir
6. RevenueCat user ID senkronize edilir
7. Subscription status alınır
8. Navigation ana ekrana yönlendirir

## Servis Mimarisi

### Service Layer Organizasyonu

```typescript
// Base Service Interface
interface IService {
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
}

// Database Service
class DatabaseService implements IService {
  private client: SupabaseClient;
  
  async initialize() {
    this.client = createClient(url, key);
  }
  
  async query<T>(table: string, filters?: any): Promise<T[]> {
    // Implementation
  }
  
  async insert<T>(table: string, data: T): Promise<T> {
    // Implementation
  }
  
  async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    // Implementation
  }
  
  async delete(table: string, id: string): Promise<void> {
    // Implementation
  }
}

// Image Generation Service
class ImageGenerationService implements IService {
  constructor(
    private falAIService: FALAIService,
    private storageService: StorageService,
    private databaseService: DatabaseService
  ) {}
  
  async generate(params: GenerateParams): Promise<GeneratedImage> {
    // 1. Generate with FAL.AI
    const result = await this.falAIService.generate(params);
    
    // 2. Upload to storage
    const imageUrl = await this.storageService.upload(result.image);
    
    // 3. Save metadata to database
    const record = await this.databaseService.insert('generated_images', {
      userId: params.userId,
      sceneId: params.sceneId,
      imageUrl,
      prompt: params.prompt,
    });
    
    return record;
  }
}

// Scene Service
class SceneService implements IService {
  constructor(private databaseService: DatabaseService) {}
  
  async getScenes(): Promise<Scene[]> {
    return this.databaseService.query('scenes', { isActive: true });
  }
  
  async getScenesByCategory(category: string): Promise<Scene[]> {
    return this.databaseService.query('scenes', { 
      category, 
      isActive: true 
    });
  }
}

// RevenueCat Service
class RevenueCatService implements IService {
  async initialize() {
    await Purchases.configure({ apiKey: API_KEY });
  }
  
  async getOfferings(): Promise<Offerings> {
    return await Purchases.getOfferings();
  }
  
  async purchasePackage(pkg: Package): Promise<PurchaseResult> {
    return await Purchases.purchasePackage(pkg);
  }
  
  async restorePurchases(): Promise<CustomerInfo> {
    return await Purchases.restorePurchases();
  }
  
  async checkSubscriptionStatus(): Promise<boolean> {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active['premium'] !== undefined;
  }
}
```

### Service Dependencies

```
ImageGenerationService
  ├── FALAIService
  ├── StorageService
  └── DatabaseService

SceneService
  └── DatabaseService

RevenueCatService
  └── (Standalone)

AnalyticsService
  ├── DatabaseService
  └── LocalStorageService

NotificationService
  └── (Standalone - Expo Notifications)
```

## 🗂️ State Management

### Context API Architecture

```typescript
// Auth Context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (provider: AuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Implementation
  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// App State Context
interface AppStateContextType {
  selectedScene: Scene | null;
  selectedPhoto: string | null;
  generationStatus: GenerationStatus;
  setSelectedScene: (scene: Scene) => void;
  setSelectedPhoto: (photo: string) => void;
  resetState: () => void;
}

export const AppStateContext = createContext<AppStateContextType | undefined>(undefined);
```

### React Query Integration

```typescript
// Hooks with React Query
export const useScenes = () => {
  return useQuery({
    queryKey: ['scenes'],
    queryFn: () => sceneService.getScenes(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGenerateImage = () => {
  return useMutation({
    mutationFn: (params: GenerateParams) => 
      imageGenerationService.generate(params),
    onSuccess: () => {
      queryClient.invalidateQueries(['images']);
    },
  });
};

export const useUserImages = (userId: string) => {
  return useQuery({
    queryKey: ['images', userId],
    queryFn: () => imageRepository.getByUserId(userId),
    enabled: !!userId,
  });
};
```

### State Flow

```
Component
    ↓
  Hook (useQuery/useMutation)
    ↓
  React Query Cache
    ↓
  Service Layer
    ↓
  API/Database
```

## 🧭 Navigation Mimarisi

### Navigation Structure

```typescript
// Main Navigator
<NavigationContainer>
  <Stack.Navigator>
    {!isAuthenticated ? (
      // Auth Stack
      <>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
      </>
    ) : (
      // Main App Stack
      <>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="SceneSelection" component={SceneSelectionScreen} />
        <Stack.Screen name="PhotoUpload" component={PhotoUploadScreen} />
        <Stack.Screen name="Generating" component={GeneratingScreen} />
        <Stack.Screen name="Generated" component={GeneratedScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Paywall" component={PaywallScreen} />
      </>
    )}
  </Stack.Navigator>
</NavigationContainer>

// Tab Navigator
<Tab.Navigator>
  <Tab.Screen name="Home" component={HomeScreen} />
  <Tab.Screen name="Gallery" component={GalleryScreen} />
  <Tab.Screen name="Favorites" component={FavoritesScreen} />
  <Tab.Screen name="Profile" component={ProfileScreen} />
</Tab.Navigator>
```

### Navigation Flow

```
Splash → Onboarding → Auth → Gender Selection → Home
                                                   ↓
                                    ┌──────────────┴──────────────┐
                                    ↓              ↓              ↓
                                  Home         Gallery        Profile
                                    ↓
                            Scene Selection
                                    ↓
                            Photo Upload
                                    ↓
                              Generating
                                    ↓
                               Generated
                            ↙       ↓       ↘
                      Gallery    Share    Regenerate
```

## Güvenlik Mimarisi

### Authentication Security

1. **Token Management**
   - JWT tokens stored securely in AsyncStorage
   - Automatic token refresh
   - Token expiration handling

2. **Supabase Auth**
   - Row Level Security (RLS) policies
   - Secure authentication providers
   - Email verification

3. **API Security**
   - API keys stored in environment variables
   - Never exposed to client-side
   - Server-side validation

### Data Security

1. **Encryption**
   - HTTPS for all network requests
   - AsyncStorage encryption for sensitive data
   - Secure storage for credentials

2. **Supabase RLS Policies**
   ```sql
   -- Users can only read their own data
   CREATE POLICY "Users can view own data"
     ON generated_images FOR SELECT
     USING (auth.uid() = user_id);
   
   -- Users can only insert their own data
   CREATE POLICY "Users can insert own data"
     ON generated_images FOR INSERT
     WITH CHECK (auth.uid() = user_id);
   ```

3. **Input Validation**
   - Client-side validation
   - Server-side validation
   - SQL injection prevention (Supabase parameterized queries)

### Privacy

1. **Data Minimization**
   - Only collect necessary data
   - User can delete account and all data

2. **GDPR Compliance**
   - Data export functionality
   - Right to be forgotten
   - Privacy policy and terms acceptance

## Performans Optimizasyonları

### 1. Image Optimization

```typescript
// Progressive image loading
<Image
  source={{ uri: imageUrl }}
  placeholder={{ uri: thumbnailUrl }}
  contentFit="cover"
  transition={200}
/>

// Image caching
expo-image // Built-in disk and memory caching

// Image compression
await ImageManipulator.manipulateAsync(
  uri,
  [{ resize: { width: 1024 } }],
  { compress: 0.8, format: SaveFormat.JPEG }
);
```

### 2. Component Optimization

```typescript
// Memoization
const MemoizedComponent = React.memo(Component);

// useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// useCallback for function stability
const handlePress = useCallback(() => {
  doSomething();
}, [dependency]);
```

### 3. List Optimization

```typescript
// FlatList optimization
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={10}
  windowSize={21}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### 4. Network Optimization

```typescript
// React Query caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

// Prefetching
queryClient.prefetchQuery(['scenes'], () => sceneService.getScenes());

// Debouncing
const debouncedSearch = useMemo(
  () => debounce(searchFunction, 300),
  []
);
```

### 5. Bundle Optimization

```javascript
// Metro config - tree shaking
module.exports = {
  transformer: {
    minifierConfig: {
      keep_classnames: false,
      keep_fnames: false,
      mangle: {
        toplevel: false,
      },
    },
  },
};

// Code splitting (planned)
const SceneDetail = lazy(() => import('./screens/SceneDetailScreen'));
```

## Tasarım Desenleri

### 1. Repository Pattern

```typescript
// Abstract repository
interface IRepository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Concrete implementation
class SceneRepository implements IRepository<Scene> {
  constructor(private db: DatabaseService) {}
  
  async getAll(): Promise<Scene[]> {
    return this.db.query('scenes', { isActive: true });
  }
  
  // ... other methods
}
```

### 2. Singleton Pattern

```typescript
// Service singletons
class AnalyticsService {
  private static instance: AnalyticsService;
  
  private constructor() {}
  
  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }
  
  trackEvent(event: string, properties?: any) {
    // Implementation
  }
}

export const analyticsService = AnalyticsService.getInstance();
```

### 3. Factory Pattern

```typescript
// Image generation factory
class ImageGenerationFactory {
  static createGenerator(type: GenerationType): IImageGenerator {
    switch (type) {
      case 'flux-pro':
        return new FluxProGenerator();
      case 'flux-dev':
        return new FluxDevGenerator();
      default:
        throw new Error('Unknown generator type');
    }
  }
}
```

### 4. Observer Pattern

```typescript
// Event emitter for realtime updates
class RealtimeService {
  private listeners: Map<string, Function[]> = new Map();
  
  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }
  
  emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }
  
  unsubscribe(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
}
```

### 5. Strategy Pattern

```typescript
// Different authentication strategies
interface IAuthStrategy {
  authenticate(): Promise<AuthResult>;
}

class GoogleAuthStrategy implements IAuthStrategy {
  async authenticate(): Promise<AuthResult> {
    // Google auth implementation
  }
}

class AppleAuthStrategy implements IAuthStrategy {
  async authenticate(): Promise<AuthResult> {
    // Apple auth implementation
  }
}

class EmailAuthStrategy implements IAuthStrategy {
  async authenticate(): Promise<AuthResult> {
    // Email auth implementation
  }
}

class AuthService {
  async authenticate(strategy: IAuthStrategy): Promise<AuthResult> {
    return strategy.authenticate();
  }
}
```

### 6. Decorator Pattern

```typescript
// Error handling decorator
function withErrorHandling(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function (...args: any[]) {
    try {
      return await originalMethod.apply(this, args);
    } catch (error) {
      logger.error(`Error in ${propertyKey}:`, error);
      throw error;
    }
  };
  
  return descriptor;
}

// Usage
class ImageService {
  @withErrorHandling
  async generateImage(params: GenerateParams) {
    // Method implementation
  }
}
```

## Monitoring & Logging

### Logging Architecture

```typescript
// Logger utility
class Logger {
  debug(message: string, meta?: any) {
    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, meta);
    }
  }
  
  info(message: string, meta?: any) {
    console.log(`[INFO] ${message}`, meta);
    // Send to analytics
  }
  
  warn(message: string, meta?: any) {
    console.warn(`[WARN] ${message}`, meta);
    // Send to monitoring
  }
  
  error(message: string, error?: Error, meta?: any) {
    console.error(`[ERROR] ${message}`, error, meta);
    // Send to Sentry
    sentryService.captureException(error, { message, meta });
  }
}

export const logger = new Logger();
```

### Performance Monitoring

```typescript
// Performance tracking
class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  
  start(label: string) {
    this.marks.set(label, Date.now());
  }
  
  end(label: string) {
    const startTime = this.marks.get(label);
    if (startTime) {
      const duration = Date.now() - startTime;
      logger.info(`Performance: ${label}`, { duration });
      analyticsService.trackEvent('performance', { label, duration });
      this.marks.delete(label);
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Usage
performanceMonitor.start('image_generation');
await imageGenerationService.generate(params);
performanceMonitor.end('image_generation');
```

## 🔄 Realtime Architecture

### Supabase Realtime Subscriptions

```typescript
// Realtime scenes subscription
export const useRealtimeScenes = () => {
  const [scenes, setScenes] = useState<Scene[]>([]);
  
  useEffect(() => {
    const subscription = supabase
      .channel('scenes_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'scenes'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setScenes(prev => [...prev, payload.new as Scene]);
        } else if (payload.eventType === 'UPDATE') {
          setScenes(prev => prev.map(s => 
            s.id === payload.new.id ? payload.new as Scene : s
          ));
        } else if (payload.eventType === 'DELETE') {
          setScenes(prev => prev.filter(s => s.id !== payload.old.id));
        }
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return scenes;
};
```

## Testing Architecture

### Testing Strategy

```typescript
// Unit tests
describe('SceneService', () => {
  let service: SceneService;
  let mockDatabase: jest.Mocked<DatabaseService>;
  
  beforeEach(() => {
    mockDatabase = {
      query: jest.fn(),
    } as any;
    service = new SceneService(mockDatabase);
  });
  
  it('should get scenes by category', async () => {
    mockDatabase.query.mockResolvedValue([mockScene]);
    
    const result = await service.getScenesByCategory('portrait');
    
    expect(result).toHaveLength(1);
    expect(mockDatabase.query).toHaveBeenCalledWith('scenes', {
      category: 'portrait',
      isActive: true
    });
  });
});

// Integration tests
describe('Image Generation Flow', () => {
  it('should generate and save image', async () => {
    const params = { userId: '123', sceneId: '456', photo: 'base64...' };
    
    const result = await imageGenerationService.generate(params);
    
    expect(result.imageUrl).toBeDefined();
    expect(result.userId).toBe(params.userId);
  });
});

// E2E tests (Maestro)
appId: com.someplanets.monzieaiv2
---
- launchApp
- tapOn: "Get Started"
- tapOn: "Continue with Email"
- inputText: "test@example.com"
- tapOn: "Sign In"
- assertVisible: "Home Screen"
```

## 📝 Best Practices

### 1. Code Organization
- Feature-based folder structure
- Consistent naming conventions
- Proper file separation

### 2. Error Handling
- Try-catch blocks in async operations
- Error boundaries for UI errors
- User-friendly error messages
- Logging for debugging

### 3. Performance
- Lazy loading components
- Image optimization
- Efficient re-renders
- Proper caching

### 4. Security
- Environment variables for secrets
- Input validation
- Secure storage
- HTTPS only

### 5. Maintainability
- TypeScript for type safety
- Comprehensive documentation
- Unit and integration tests
- Code reviews

---

**Son Güncelleme**: 2024
**Durum**: ✅ Production Ready