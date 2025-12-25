# MonzieAI - Ekran Dokümantasyonu

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Screen Flow](#screen-flow)
3. [Auth Flow Screens](#auth-flow-screens)
4. [Main App Screens](#main-app-screens)
5. [Generation Flow Screens](#generation-flow-screens)
6. [Settings & Profile Screens](#settings--profile-screens)
7. [Premium Flow Screens](#premium-flow-screens)
8. [Screen Props & Navigation](#screen-props--navigation)

## 🎯 Genel Bakış

MonzieAI uygulaması 37 farklı ekrandan oluşur. Her ekran belirli bir işlevi yerine getirir ve kullanıcı deneyimini optimize etmek için tasarlanmıştır.

### Ekran Kategorileri

```
📱 Auth Flow (5 ekran)
├── SplashScreen
├── OnboardingScreen
├── AuthScreen
├── ForgotPasswordScreen
└── GenderSelectionScreen

🏠 Main App (5 ekran)
├── HomeScreen (Tab)
├── GalleryScreen (Tab)
├── FavoritesScreen (Tab)
├── ProfileScreen (Tab)
└── HistoryScreen

🎨 Generation Flow (7 ekran)
├── SceneSelectionScreen
├── CategoryDetailScreen
├── SubcategoryScenesScreen
├── SceneDetailScreen
├── PhotoUploadScreen
├── GeneratingScreen
└── GeneratedScreen

⚙️ Settings & Profile (10 ekran)
├── SettingsScreen
├── MyProfileScreen
├── ChangePasswordScreen
├── PrivacySettingsScreen
├── PrivacyPolicyScreen
├── TermsOfServiceScreen
├── AboutScreen
├── HelpScreen
├── ChangelogScreen
└── DownloadDataScreen

💎 Premium Flow (6 ekran)
├── PaywallScreen
├── SubscriptionScreen
├── ChangePlanScreen
├── PremiumActivatingScreen
├── PremiumSuccessScreen
└── CancelSubscriptionScreen

🔧 Utility Screens (4 ekran)
├── AnalyticsScreen
├── EnhanceScreen
├── SeeAllScreen
└── RevenueCatTestScreen
```

## 🔄 Screen Flow

### Complete User Journey

```
App Launch
    ↓
┌──────────────┐
│ SplashScreen │ (2s animation)
└──────┬───────┘
       ↓
  First Time?
   ├─Yes─→ OnboardingScreen (3 slides)
   │           ↓
   │      AuthScreen (Sign Up/In)
   │           ↓
   │      GenderSelectionScreen
   │           ↓
   └─No──→ HomeScreen (Main Tab)
               ↓
        ┌──────┴──────────────────┐
        ↓                          ↓
    Generate Flow            Browse/View
        ↓                          ↓
SceneSelectionScreen          GalleryScreen
        ↓                          ↓
PhotoUploadScreen            FavoritesScreen
        ↓                          ↓
 GeneratingScreen              ProfileScreen
        ↓                          ↓
  GeneratedScreen             SettingsScreen
        ↓
   [Save/Share/Regenerate]
```

## 🔐 Auth Flow Screens

### 1. SplashScreen

**Dosya**: `src/screens/SplashScreen.tsx`

**Amaç**: Uygulama başlatma ekranı, logo animasyonu ve ilk yükleme kontrolü

**State**:
```typescript
{
  isLoading: boolean;
  authCheckComplete: boolean;
}
```

**İşlevler**:
- Lottie animasyon gösterimi
- Auth durumu kontrolü
- Token validation
- Initial data loading
- Auto-navigation (2-3 saniye sonra)

**Navigation**:
```typescript
// Authenticated user
navigation.replace('MainTabs');

// New user
navigation.replace('Onboarding');

// Returning user without auth
navigation.replace('Auth');
```

**Animasyonlar**:
- Logo fade in
- Lottie animation loop
- Smooth transition

---

### 2. OnboardingScreen

**Dosya**: `src/screens/OnboardingScreen.tsx`

**Amaç**: Yeni kullanıcılara uygulamayı tanıtma

**Props**:
```typescript
interface OnboardingScreenProps {
  navigation: NavigationProp;
}
```

**State**:
```typescript
{
  currentSlide: number; // 0, 1, 2
  slides: OnboardingSlide[];
}
```

**Slides**:
1. **Welcome Slide**
   - Title: "Welcome to MonzieAI"
   - Description: "Transform your photos with AI magic"
   - Image: Hero illustration
   
2. **Features Slide**
   - Title: "100+ AI Scenes"
   - Description: "Choose from professional scenes and styles"
   - Image: Scene grid showcase
   
3. **Easy to Use Slide**
   - Title: "Create in Seconds"
   - Description: "Just select, upload, and let AI do the magic"
   - Image: Generation flow illustration

**Interactions**:
- Swipe to next slide
- Skip button (top right)
- Next/Get Started button
- Progress dots indicator

**Navigation**:
```typescript
// Skip or finish onboarding
navigation.replace('Auth');
```

---

### 3. AuthScreen

**Dosya**: `src/screens/AuthScreen.tsx`

**Amaç**: Kullanıcı giriş ve kayıt

**Modes**:
- Sign In Mode
- Sign Up Mode

**State**:
```typescript
{
  mode: 'signin' | 'signup';
  email: string;
  password: string;
  isLoading: boolean;
  errors: {
    email?: string;
    password?: string;
  };
}
```

**Auth Methods**:

1. **Email/Password**
   ```typescript
   // Sign Up
   await supabase.auth.signUp({
     email,
     password,
     options: { data: { gender } }
   });
   
   // Sign In
   await supabase.auth.signInWithPassword({
     email,
     password
   });
   ```

2. **Google Sign In**
   ```typescript
   await supabase.auth.signInWithOAuth({
     provider: 'google',
     options: { redirectTo: 'monzieai://auth/callback' }
   });
   ```

3. **Apple Sign In**
   ```typescript
   await supabase.auth.signInWithOAuth({
     provider: 'apple',
     options: { redirectTo: 'monzieai://auth/callback' }
   });
   ```

**Validation**:
- Email format check
- Password strength (min 8 chars)
- Required fields

**Navigation**:
```typescript
// New user after sign up
navigation.navigate('GenderSelection');

// Existing user
navigation.replace('MainTabs');

// Forgot password
navigation.navigate('ForgotPassword');
```

---

### 4. ForgotPasswordScreen

**Dosya**: `src/screens/ForgotPasswordScreen.tsx`

**Amaç**: Şifre sıfırlama

**State**:
```typescript
{
  email: string;
  isLoading: boolean;
  emailSent: boolean;
  error?: string;
}
```

**Flow**:
1. User enters email
2. Validation
3. Send reset email
4. Show success message
5. Navigate back to Auth

**API Call**:
```typescript
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'monzieai://auth/reset-password'
});
```

---

### 5. GenderSelectionScreen

**Dosya**: `src/screens/GenderSelectionScreen.tsx`

**Amaç**: Kullanıcı cinsiyeti seçimi (AI prompt generation için)

**State**:
```typescript
{
  selectedGender: 'male' | 'female' | null;
  isLoading: boolean;
}
```

**UI**:
```
┌─────────────────────────────┐
│    Choose Your Gender       │
│                             │
│  ┌──────┐      ┌──────┐    │
│  │ Male │      │Female│    │
│  │  👨  │      │  👩  │    │
│  └──────┘      └──────┘    │
│                             │
│     [Continue Button]       │
└─────────────────────────────┘
```

**Navigation**:
```typescript
// Update profile and navigate
await updateUserProfile({ gender: selectedGender });
navigation.replace('MainTabs');
```

## 🏠 Main App Screens

### 1. HomeScreen (Tab)

**Dosya**: `src/screens/HomeScreen.tsx`

**Amaç**: Ana sayfa, featured scenes ve quick actions

**Layout**:
```
┌─────────────────────────────────┐
│  [MonzieAI Logo]    [Profile]   │
├─────────────────────────────────┤
│                                 │
│  👋 Hello, [Name]!              │
│  Ready to create?               │
│                                 │
│  [+ Generate New Image]         │
│                                 │
│  Popular Scenes                 │
│  ┌────┐ ┌────┐ ┌────┐         │
│  │    │ │    │ │    │         │
│  └────┘ └────┘ └────┘         │
│                                 │
│  Recent Creations               │
│  ┌────┐ ┌────┐ ┌────┐         │
│  │    │ │    │ │    │         │
│  └────┘ └────┘ └────┘         │
│                                 │
│  Categories                     │
│  [Portrait][Outdoor][Business]  │
└─────────────────────────────────┘
```

**Sections**:
1. **Header**
   - Logo
   - User greeting
   - Profile avatar

2. **Quick Action**
   - Large "Generate" button
   - Quick scene suggestions

3. **Popular Scenes**
   - Horizontal scroll
   - 5-10 trending scenes
   - Usage count badges

4. **Recent Creations**
   - User's last 6 images
   - Quick access to gallery

5. **Categories**
   - Grid of category cards
   - Navigate to CategoryDetailScreen

**State**:
```typescript
{
  user: User | null;
  popularScenes: Scene[];
  recentImages: GeneratedImage[];
  categories: Category[];
  isLoading: boolean;
  refreshing: boolean;
}
```

**Actions**:
- Refresh data (pull-to-refresh)
- Navigate to generation flow
- View scene details
- View image details
- Browse categories

---

### 2. GalleryScreen (Tab)

**Dosya**: `src/screens/GalleryScreen.tsx`

**Amaç**: Kullanıcının tüm üretilen görsellerini görüntüleme

**Layout**:
```
┌─────────────────────────────────┐
│  My Gallery    [Grid] [List]    │
├─────────────────────────────────┤
│  [Search Bar]    [Filter]       │
├─────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐          │
│  │ 1  │ │ 2  │ │ 3  │          │
│  └────┘ └────┘ └────┘          │
│  ┌────┐ ┌────┐ ┌────┐          │
│  │ 4  │ │ 5  │ │ 6  │          │
│  └────┘ └────┘ └────┘          │
│                                 │
│  Load More...                   │
└─────────────────────────────────┘
```

**Features**:
- Grid view (2 or 3 columns)
- List view (full width)
- Search functionality
- Filter by:
  - Date
  - Scene category
  - Favorites
- Sort by:
  - Newest first
  - Oldest first
  - Most liked

**State**:
```typescript
{
  images: GeneratedImage[];
  viewMode: 'grid' | 'list';
  searchQuery: string;
  filters: {
    category?: string;
    favorites?: boolean;
    dateRange?: [Date, Date];
  };
  sortBy: 'newest' | 'oldest';
  page: number;
  hasMore: boolean;
  isLoading: boolean;
}
```

**Interactions**:
- Tap image → Navigate to GeneratedScreen
- Long press → Show action menu
  - Share
  - Download
  - Delete
  - Add to favorites
- Pull to refresh
- Infinite scroll

---

### 3. FavoritesScreen (Tab)

**Dosya**: `src/screens/FavoritesScreen.tsx`

**Amaç**: Favori olarak işaretlenmiş görseller

**Layout**: GalleryScreen ile benzer ama sadece favoriler

**State**:
```typescript
{
  favorites: GeneratedImage[];
  isLoading: boolean;
  refreshing: boolean;
}
```

**Empty State**:
```
┌─────────────────────────────────┐
│                                 │
│         ⭐                      │
│                                 │
│  No Favorites Yet               │
│                                 │
│  Tap the heart icon on any      │
│  image to add it here           │
│                                 │
│  [Explore Scenes]               │
└─────────────────────────────────┘
```

---

### 4. ProfileScreen (Tab)

**Dosya**: `src/screens/ProfileScreen.tsx`

**Amaç**: Kullanıcı profili ve istatistikler

**Layout**:
```
┌─────────────────────────────────┐
│  [Avatar]                       │
│  John Doe                       │
│  john@example.com               │
│  [Edit Profile]                 │
├─────────────────────────────────┤
│  Stats                          │
│  ┌─────┐ ┌─────┐ ┌─────┐      │
│  │ 150 │ │ 45  │ │ 30d │      │
│  │Total│ │Fav  │ │Join │      │
│  └─────┘ └─────┘ └─────┘      │
├─────────────────────────────────┤
│  Subscription                   │
│  💎 Premium Member              │
│  Expires: Jan 15, 2025          │
│  [Manage Subscription]          │
├─────────────────────────────────┤
│  Quick Actions                  │
│  [My Profile]                   │
│  [Settings]                     │
│  [Help & Support]               │
│  [About]                        │
└─────────────────────────────────┘
```

**State**:
```typescript
{
  user: User;
  stats: {
    totalImages: number;
    favoriteCount: number;
    memberSince: Date;
  };
  subscription: {
    isPremium: boolean;
    plan?: string;
    expiresAt?: Date;
  };
}
```

---

### 5. HistoryScreen

**Dosya**: `src/screens/HistoryScreen.tsx`

**Amaç**: Kronolojik görsel üretim geçmişi

**Layout**:
```
┌─────────────────────────────────┐
│  History                        │
├─────────────────────────────────┤
│  Today                          │
│  ┌─────────────────────────┐   │
│  │ 14:30 - Portrait        │   │
│  │ [Thumbnail]             │   │
│  └─────────────────────────┘   │
│                                 │
│  Yesterday                      │
│  ┌─────────────────────────┐   │
│  │ 09:15 - Outdoor         │   │
│  │ [Thumbnail]             │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Features**:
- Grouped by date
- Timeline view
- Scene info
- Quick regenerate option

## 🎨 Generation Flow Screens

### 1. SceneSelectionScreen

**Dosya**: `src/screens/SceneSelectionScreen.tsx`

**Amaç**: Sahne seçimi için kategorize edilmiş grid

**Layout**:
```
┌─────────────────────────────────┐
│  Choose a Scene  [Search]       │
├─────────────────────────────────┤
│  [All] [Portrait] [Outdoor]...  │
├─────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐    │
│  │Scene1│ │Scene2│ │Scene3│    │
│  │  💎  │ │      │ │      │    │
│  └──────┘ └──────┘ └──────┘    │
│  ┌──────┐ ┌──────┐ ┌──────┐    │
│  │Scene4│ │Scene5│ │Scene6│    │
│  └──────┘ └──────┘ └──────┘    │
└─────────────────────────────────┘
```

**State**:
```typescript
{
  scenes: Scene[];
  categories: Category[];
  selectedCategory: string | 'all';
  searchQuery: string;
  isLoading: boolean;
}
```

**Filters**:
- All scenes
- By category
- Premium only
- Most popular
- Recently added

**Navigation**:
```typescript
// Tap scene
navigation.navigate('SceneDetail', { sceneId });

// Or direct to photo upload
navigation.navigate('PhotoUpload', { sceneId });
```

---

### 2. SceneDetailScreen

**Dosya**: `src/screens/SceneDetailScreen.tsx`

**Amaç**: Sahne detayları ve önizleme

**Props**:
```typescript
interface SceneDetailProps {
  route: {
    params: {
      sceneId: string;
    }
  };
}
```

**Layout**:
```
┌─────────────────────────────────┐
│  [Back]           [Favorite]    │
├─────────────────────────────────┤
│                                 │
│    [Large Preview Image]        │
│                                 │
├─────────────────────────────────┤
│  Professional Portrait          │
│  ⭐ 4.8  👥 1.2K uses          │
│                                 │
│  Description:                   │
│  Create stunning professional   │
│  portraits with studio lighting │
│  and perfect composition.       │
│                                 │
│  Category: Portrait             │
│  Style: Professional            │
│  Premium: 💎 Yes                │
│                                 │
│  Example Results:               │
│  ┌────┐ ┌────┐ ┌────┐         │
│  │ 1  │ │ 2  │ │ 3  │         │
│  └────┘ └────┘ └────┘         │
│                                 │
│  [Try This Scene]               │
└─────────────────────────────────┘
```

**State**:
```typescript
{
  scene: Scene;
  exampleResults: GeneratedImage[];
  isFavorite: boolean;
  isLoading: boolean;
}
```

---

### 3. PhotoUploadScreen

**Dosya**: `src/screens/PhotoUploadScreen.tsx`

**Amaç**: Fotoğraf seçimi ve yükleme

**Props**:
```typescript
interface PhotoUploadProps {
  route: {
    params: {
      sceneId: string;
    }
  };
}
```

**Layout**:
```
┌─────────────────────────────────┐
│  Upload Photo                   │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────┐     │
│  │                       │     │
│  │   [Preview Image]     │     │
│  │                       │     │
│  └───────────────────────┘     │
│                                 │
│  [Choose from Gallery]          │
│  [Take Photo]                   │
│                                 │
│  Tips:                          │
│  • Use clear, well-lit photos   │
│  • Face should be visible       │
│  • Avoid heavy filters          │
│                                 │
│  [Continue]                     │
└─────────────────────────────────┘
```

**State**:
```typescript
{
  selectedPhoto: string | null;
  photoUri: string | null;
  isUploading: boolean;
  validationErrors: string[];
}
```

**Validation**:
- File size < 10MB
- Min resolution 512x512
- Valid format (JPEG, PNG, WebP)
- Face detection (optional warning)

**Actions**:
```typescript
// Pick from gallery
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
});

// Take photo
const result = await ImagePicker.launchCameraAsync({
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
});

// Navigate to generation
navigation.navigate('Generating', {
  sceneId,
  photoUri
});
```

---

### 4. GeneratingScreen

**Dosya**: `src/screens/GeneratingScreen.tsx`

**Amaç**: AI işleme süreci animasyonu

**Props**:
```typescript
interface GeneratingProps {
  route: {
    params: {
      sceneId: string;
      photoUri: string;
    }
  };
}
```

**Layout**:
```
┌─────────────────────────────────┐
│                                 │
│                                 │
│    [Lottie Animation]           │
│    🎨 Creating your AI art...   │
│                                 │
│    ▓▓▓▓▓▓▓▓▓░░░░░░░ 60%       │
│                                 │
│    Analyzing image...           │
│    ✓ Photo uploaded             │
│    ✓ Scene applied              │
│    ⏳ Generating with AI...     │
│    ⏳ Finalizing...              │
│                                 │
│    Estimated: 30 seconds        │
│                                 │
│    [Cancel]                     │
└─────────────────────────────────┘
```

**State**:
```typescript
{
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'generating' | 'finalizing';
  estimatedTime: number;
  currentStep: string;
  generationId: string;
}
```

**Process**:
1. Upload photo to storage
2. Call FAL.AI API
3. Poll for result (queue status)
4. Download generated image
5. Save to database
6. Navigate to result

**Error Handling**:
- Network errors → Retry option
- AI errors → Try different scene
- Timeout → Support contact
- NSFW detected → Warning + retry

---

### 5. GeneratedScreen

**Dosya**: `src/screens/GeneratedScreen.tsx`

**Amaç**: Üretilen görseli gösterme ve işlemler

**Props**:
```typescript
interface GeneratedProps {
  route: {
    params: {
      imageId: string;
    }
  };
}
```

**Layout**:
```
┌─────────────────────────────────┐
│  [Back] [Share] [Download] [⋯] │
├─────────────────────────────────┤
│                                 │
│                                 │
│    [Generated Image]            │
│    (Pinch to zoom)              │
│                                 │
│                                 │
├─────────────────────────────────┤
│  Scene: Professional Portrait   │
│  Created: 2 mins ago            │
│                                 │
│  ┌────────────┐ ┌────────────┐ │
│  │ Regenerate │ │ Try Another│ │
│  └────────────┘ └────────────┘ │
│                                 │
│  [♡ Add to Favorites]           │
└─────────────────────────────────┘
```

**State**:
```typescript
{
  image: GeneratedImage;
  scene: Scene;
  isFavorite: boolean;
  isDownloading: boolean;
  zoom: number;
}
```

**Actions**:
```typescript
// Save to device
await MediaLibrary.saveToLibraryAsync(imageUri);

// Share
await Sharing.shareAsync(imageUri, {
  mimeType: 'image/jpeg',
  dialogTitle: 'Share your AI creation'
});

// Favorite toggle
await toggleFavorite(imageId);

// Regenerate (same scene, same photo)
navigation.navigate('Generating', { sceneId, photoUri });

// Try another scene
navigation.navigate('SceneSelection');
```

## ⚙️ Settings & Profile Screens

### 1. SettingsScreen

**Dosya**: `src/screens/SettingsScreen.tsx`

**Layout**:
```
┌─────────────────────────────────┐
│  Settings                       │
├─────────────────────────────────┤
│  Account                        │
│  → My Profile                   │
│  → Change Password              │
│  → Privacy Settings             │
├─────────────────────────────────┤
│  Subscription                   │
│  → Manage Subscription          │
│  → Restore Purchases            │
├─────────────────────────────────┤
│  Preferences                    │
│  → Language            English  │
│  → Notifications       [ON]     │
│  → Dark Mode           [OFF]    │
├─────────────────────────────────┤
│  About                          │
│  → Help & Support               │
│  → Privacy Policy               │
│  → Terms of Service             │
│  → About MonzieAI               │
│  → Version: 1.0.0               │
├─────────────────────────────────┤
│  [Sign Out]                     │
└─────────────────────────────────┘
```

---

### 2. MyProfileScreen

**Dosya**: `src/screens/MyProfileScreen.tsx`

**Amaç**: Profil bilgilerini düzenleme

**Editable Fields**:
- Display name
- Email (requires re-auth)
- Gender
- Avatar

---

### 3. PrivacySettingsScreen

**Dosya**: `src/screens/PrivacySettingsScreen.tsx`

**Settings**:
- Data collection
- Analytics
- Personalized ads
- Download my data
- Delete account

---

## 💎 Premium Flow Screens

### 1. PaywallScreen

**Dosya**: `src/screens/PaywallScreen.tsx`

**Amaç**: Premium özellikleri tanıtma ve satın alma

**Layout**:
```
┌─────────────────────────────────┐
│  [X]                            │
│                                 │
│  Unlock Premium                 │
│  ✨ Create unlimited images     │
│                                 │
│  What you get:                  │
│  ✓ Unlimited generations        │
│  ✓ 100+ premium scenes          │
│  ✓ No ads                       │
│  ✓ Priority processing          │
│  ✓ HD downloads                 │
│  ✓ Cloud backup                 │
│                                 │
│  ┌─────────────────────────┐   │
│  │ MOST POPULAR            │   │
│  │ Monthly - $29.99/mo     │   │
│  │ 7-day free trial        │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Weekly - $9.99/week     │   │
│  │ 3-day free trial        │   │
│  └─────────────────────────┘   │
│                                 │
│  [Start Free Trial]             │
│                                 │
│  Terms • Privacy • Restore      │
└─────────────────────────────────┘
```

**Triggers**:
- Daily limit reached
- Premium scene selected
- Manual upgrade

---

### 2. PremiumSuccessScreen

**Dosya**: `src/screens/PremiumSuccessScreen.tsx`

**Layout**:
```
┌─────────────────────────────────┐
│                                 │
│         🎉                      │
│                                 │
│  Welcome to Premium!            │
│                                 │
│  You now have access to:        │
│  • Unlimited generations        │
│  • All premium scenes           │
│  • Priority support             │
│                                 │
│  [Start Creating]               │
└─────────────────────────────────┘
```

## 📊 Screen Props & Navigation

### Navigation Types

```typescript
type RootStackParamList = {
  // Auth Flow
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  ForgotPassword: undefined;
  GenderSelection: undefined;
  
  // Main Tabs
  MainTabs: undefined;
  Home: undefined;
  Gallery: undefined;
  Favorites: undefined;
  Profile: undefined;
  
  // Generation Flow
  SceneSelection: undefined;
  SceneDetail: { sceneId: string };
  CategoryDetail: { categoryId: string };
  SubcategoryScenes: { category: string; subcategory: string };
  PhotoUpload: { sceneId: string };
  Generating: { sceneId: string; photoUri: string };
  Generated: { imageId: string };
  
  // Settings
  Settings: undefined;
  MyProfile: undefined;
  ChangePassword: undefined;
  PrivacySettings: undefined;
  
  // Premium
  Paywall: { source?: string };
  Subscription: undefined;
  PremiumSuccess: undefined;
  
  // Other
  History: undefined;
  Help: undefined;
  About: undefined;
};
```

### Common Navigation Patterns

```typescript
// Navigate to screen
navigation.navigate('SceneDetail', { sceneId: '123' });

// Replace current screen
navigation.replace('MainTabs');

// Go back
navigation.goBack();

// Reset navigation stack
navigation.reset({
  index: 0,
  routes: [{ name: 'MainTabs' }],
});

// Pop to top
navigation.popToTop();
```

### Screen Options

```typescript
// Header configuration
const screenOptions = {
  headerShown: true,
  headerTitle: 'Screen Title',
  headerBackTitle: 'Back',
  headerRight: () => <HeaderButton />,
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.white,
  gestureEnabled: true,
  animation: 'slide_from_right',
};
```

## 🎯 Best Practices

### 1. Loading States
- Show skeleton screens
- Progress indicators
- Optimistic UI updates

### 2. Error Handling
- User-friendly messages
- Retry options
- Fallback UI

### 3. Navigation
- Clear navigation paths
- Breadcrumbs
- Back button consistency

### 4. Accessibility
- Screen reader support
- Focus management
- Touch targets (min 44x44)

### 5. Performance
- Lazy loading
- Image optimization
- Memoization

---

**Son Güncelleme**: 2024
**Toplam Ekran**: 37
**Platform**: iOS, Android (yakında)