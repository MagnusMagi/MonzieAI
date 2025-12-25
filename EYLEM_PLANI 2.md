# 🎯 MONZIEAI - KAPSAMLI EYLEM PLANI

**Oluşturulma Tarihi:** 2025-01-27  
**Proje Versiyonu:** 1.0.0  
**Mevcut Sağlık Skoru:** 84/100  
**Hedef Sağlık Skoru:** 96-98/100  
**Tahmini Süre:** 2-3 ay

---

## 📊 ÖNCELİK MATRISI

```
🔴 P0 - KRİTİK (0-3 Gün):    TypeScript hataları, Dependencies
🟠 P1 - YÜKSEK (1-2 Hafta):  ViewModel'ler, Test Coverage
🟡 P2 - ORTA (2-4 Hafta):    Performance, Error Tracking
🟢 P3 - DÜŞÜK (1-3 Ay):      CI/CD, Dark Mode, i18n
```

---

## 🔴 SPRINT 1: ACİL DÜZELTMELER (0-3 GÜN)

### AKSIYON 1.1: TypeScript/ESLint Hatalarını Düzelt

**Öncelik:** P0 - Kritik  
**Süre:** 2-3 saat  
**Sorumluluk:** Senior Developer

#### Görev 1.1.1: AuthScreen.tsx - require() Import Hatası

**Prompt:**
```
You are an expert React Native engineer. Fix the import error in AuthScreen.tsx.

Current Problem:
- Line 260: `const logo = require('../../assets/icon.png');` is forbidden
- ESLint error: "A require() style import is forbidden"

Task:
1. Replace require() style import with ES6 import
2. Ensure the image still loads correctly
3. Test the change works in development

File: src/screens/AuthScreen.tsx
Line: 260

Expected Output:
- Replace `const logo = require('../../assets/icon.png');` with proper ES6 import
- Verify image displays correctly
- No ESLint errors
```

**Kabul Kriterleri:**
- [ ] ES6 import kullanılıyor
- [ ] Logo görüntüsü doğru yükleniyor
- [ ] ESLint hatası yok
- [ ] Development'ta test edildi

---

#### Görev 1.1.2: falAIService.ts - Type Error Düzeltmeleri

**Prompt:**
```
You are an expert TypeScript engineer. Fix type errors in falAIService.ts.

Current Problems:
1. Line 190: Type 'unknown' is not assignable to type 'Error | null'
2. Line 453: Type 'unknown' is not assignable to type 'Error | null'

Context:
- These errors occur in catch blocks where we're assigning error to lastError
- lastError is declared as `let lastError: Error | null = null`

Task:
1. Fix type errors by properly handling unknown error type
2. Ensure error is converted to Error type if needed
3. Maintain error information for debugging
4. Follow TypeScript best practices for error handling

File: src/services/falAIService.ts
Lines: 190, 453

Expected Solution Pattern:
```typescript
// Instead of:
lastError = error; // ❌ Type error

// Use:
lastError = error instanceof Error ? error : new Error(String(error)); // ✅
```

**Kabul Kriterleri:**
- [ ] Type error'lar çözüldü
- [ ] Error handling bozulmadı
- [ ] TypeScript check geçiyor
- [ ] Test coverage korundu

---

#### Görev 1.1.3: AuthContext.tsx - ESLint Rule Missing

**Prompt:**
```
You are an expert React and ESLint configuration engineer. Fix ESLint configuration issues in the project.

Current Problem:
- Line 104 in AuthContext.tsx: Definition for rule 'react-hooks/exhaustive-deps' was not found
- The rule is being used but the plugin is not installed

Task:
1. Install eslint-plugin-react-hooks as dev dependency
2. Update eslint.config.js to include the plugin
3. Verify the rule is now recognized
4. Ensure all existing ESLint rules still work

Steps:
1. Run: `npm install --save-dev eslint-plugin-react-hooks`
2. Update eslint.config.js to include react-hooks plugin
3. Test ESLint configuration: `npm run lint`

File: eslint.config.js
Related File: src/contexts/AuthContext.tsx (line 104)

Expected Output:
- eslint-plugin-react-hooks installed
- Plugin configured in eslint.config.js
- No ESLint configuration errors
- All linting rules working correctly
```

**Kabul Kriterleri:**
- [ ] eslint-plugin-react-hooks kuruldu
- [ ] eslint.config.js güncellendi
- [ ] ESLint rule tanınıyor
- [ ] `npm run lint` başarılı

---

#### Görev 1.1.4: AuthContext.tsx - Unnecessary Catch Clause

**Prompt:**
```
You are an expert error handling engineer. Fix unnecessary catch clause in AuthContext.tsx.

Current Problem:
- Line 567: Unnecessary catch clause detected
- Empty or pointless catch block

Task:
1. Review the try-catch block at line 567
2. Either:
   a. Remove the catch if it's truly unnecessary
   b. Add proper error handling if needed
3. Ensure error handling strategy is consistent with the rest of the file
4. Log errors appropriately using the logger service

File: src/contexts/AuthContext.tsx
Line: 567

Context:
- This file uses logger service for error logging
- Other catch blocks in the file use: logger.error() and errorLoggingService.logError()

Expected Pattern:
```typescript
// If catch is necessary:
try {
  // operation
} catch (error) {
  logger.error('Operation failed', error instanceof Error ? error : new Error('Unknown error'));
  errorLoggingService.logError(error, null, { context: 'AuthContext' });
  // Handle the error appropriately
}

// If catch is unnecessary, remove the try-catch
```

**Kabul Kriterleri:**
- [ ] Unnecessary catch kaldırıldı veya düzeltildi
- [ ] Error handling tutarlı
- [ ] ESLint warning yok
- [ ] Functionality bozulmadı

---

#### Görev 1.1.5: falAIService.ts - Unused Variables

**Prompt:**
```
You are an expert code cleanup engineer. Remove unused variables in falAIService.ts.

Current Problems:
1. Line 1: 'Constants' is defined but never used
2. Line 75: 'error' is defined but never used

Task:
1. Remove unused 'Constants' import if not needed
2. Remove or properly use the 'error' variable at line 75
3. Ensure no functionality is broken
4. Run tests to verify

File: src/services/falAIService.ts
Lines: 1, 75

Expected Actions:
- Remove unused imports
- Remove unused variables
- Keep necessary error handling
- No ESLint warnings
```

**Kabul Kriterleri:**
- [ ] Unused imports kaldırıldı
- [ ] Unused variables kaldırıldı
- [ ] Tests passing
- [ ] No ESLint warnings

---

#### Görev 1.1.6: AuthContext.tsx - 'any' Type Usage

**Prompt:**
```
You are an expert TypeScript type safety engineer. Replace 'any' types with proper types in AuthContext.tsx.

Current Problem:
- 7 instances of 'any' type usage detected
- Lines: 117, 125, 190, 286, 344, 510, 511

Task:
1. Identify each 'any' usage and its context
2. Replace with proper TypeScript types
3. Use union types, interfaces, or generics as appropriate
4. Maintain type safety without breaking functionality

File: src/contexts/AuthContext.tsx

Common Patterns to Replace:
```typescript
// ❌ Before:
const result = (await Promise.race([...]) as any);

// ✅ After:
const result = (await Promise.race([...])) as { data: { session: Session | null }, error: Error | null };

// ❌ Before:
catch (error: any) { ... }

// ✅ After:
catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
}
```

Priority:
1. First fix the most critical 'any' usages (public API returns)
2. Then fix error handling 'any' types
3. Finally, address internal 'any' types

**Kabul Kriterleri:**
- [ ] En az 5/7 'any' type'ı düzeltildi
- [ ] Critical path'ler type-safe
- [ ] TypeScript strict mode geçiyor
- [ ] Tests passing

---

### AKSIYON 1.2: Dependencies Minor Updates

**Öncelik:** P0 - Kritik  
**Süre:** 1 saat  
**Sorumluluk:** DevOps/Developer

#### Görev 1.2.1: Güvenli Minor Updates

**Prompt:**
```
You are an expert dependency management engineer. Update project dependencies safely.

Current State:
- 10 packages have minor version updates available
- All are backward compatible (minor versions)

Task:
1. Update the following packages to their latest minor versions
2. Test the application after each update group
3. Run all tests to ensure nothing breaks
4. Document any issues encountered

Packages to Update:
```bash
npm update @expo/cli@54.0.20
npm update @expo/config@12.0.13
npm update @react-navigation/bottom-tabs@7.9.0
npm update @react-navigation/native@7.1.26
npm update @react-navigation/native-stack@7.9.0
npm update expo@54.0.30
npm update expo-linking@8.0.11
npm update expo-splash-screen@31.0.13
npm update react-native-purchases@9.6.11
npm update react-native-purchases-ui@9.6.11
```

Verification Steps:
1. Run: `npm test`
2. Run: `npm start` and manually test key features
3. Check for console warnings or errors
4. Test on both iOS simulator and device if possible

Expected Output:
- All packages updated successfully
- No breaking changes
- All tests passing
- Application runs without errors
```

**Kabul Kriterleri:**
- [ ] 10 paket güncellendi
- [ ] npm test başarılı
- [ ] Uygulama çalışıyor
- [ ] Console error yok
- [ ] package.json ve package-lock.json commit edildi

---

### AKSIYON 1.3: Kritik ViewModel Oluştur

**Öncelik:** P0 - Kritik  
**Süre:** 1-2 gün  
**Sorumluluk:** Senior Developer

#### Görev 1.3.1: PaywallViewModel Oluştur

**Prompt:**
```
You are an expert MVVM architecture engineer. Create a PaywallViewModel following the project's MVVM pattern.

Context:
- PaywallScreen currently doesn't use a ViewModel
- It directly uses RevenueCat service
- Premium subscription logic should be in ViewModel

Task:
Create the following files:

1. src/presentation/viewmodels/PaywallViewModel.ts
2. src/presentation/hooks/usePaywallViewModel.ts
3. Update src/screens/PaywallScreen.tsx to use the ViewModel

Requirements:

**PaywallViewModel.ts:**
```typescript
import { RevenueCatOffering, RevenueCatPackage } from '../../services/revenueCatService';

export class PaywallViewModel {
  private offerings: RevenueCatOffering | null = null;
  private selectedPackage: RevenueCatPackage | null = null;
  private loading = false;
  private error: string | null = null;
  private purchaseInProgress = false;

  constructor(
    private revenueCatService: typeof import('../../services/revenueCatService').revenueCatService
  ) {}

  async loadOfferings(): Promise<void> {
    // Load available subscription offerings
  }

  selectPackage(pkg: RevenueCatPackage): void {
    // Select a subscription package
  }

  async purchasePackage(): Promise<boolean> {
    // Purchase selected package
    // Return true if successful
  }

  async restorePurchases(): Promise<boolean> {
    // Restore previous purchases
  }

  getState() {
    return {
      offerings: this.offerings,
      selectedPackage: this.selectedPackage,
      loading: this.loading,
      error: this.error,
      purchaseInProgress: this.purchaseInProgress,
    };
  }
}
```

**usePaywallViewModel.ts:**
- Create React hook that wraps PaywallViewModel
- Use useState for reactive state
- Use useCallback for actions
- Follow the pattern from useHomeViewModel.ts

**PaywallScreen.tsx Updates:**
- Remove direct RevenueCat service usage
- Use usePaywallViewModel hook
- Update UI to use ViewModel state
- Remove business logic from screen

Reference Files:
- src/presentation/viewmodels/HomeViewModel.ts (pattern reference)
- src/presentation/hooks/useHomeViewModel.ts (hook pattern)
- src/screens/PaywallScreen.tsx (screen to update)

**Kabul Kriterleri:**
- [ ] PaywallViewModel.ts oluşturuldu
- [ ] usePaywallViewModel.ts oluşturuldu
- [ ] PaywallScreen.tsx güncellendi
- [ ] MVVM pattern doğru uygulandı
- [ ] Business logic screen'den ayrıldı
- [ ] Tests yazıldı (optional for P0)
```

---

## 🟠 SPRINT 2: TEST COVERAGE ARTIRMA (1 HAFTA)

### AKSIYON 2.1: ViewModel Testleri

**Öncelik:** P1 - Yüksek  
**Süre:** 2-3 gün  
**Sorumluluk:** QA Engineer / Developer

#### Görev 2.1.1: GeneratingViewModel Test

**Prompt:**
```
You are an expert testing engineer. Write comprehensive unit tests for GeneratingViewModel.

Context:
- GeneratingViewModel handles image generation logic
- Uses GenerateImageUseCase
- Manages loading, progress, and error states

Task:
Create: src/presentation/viewmodels/__tests__/GeneratingViewModel.test.ts

Test Cases to Cover:

1. **Initialization**
   - Should initialize with default state
   - Should accept use case dependencies

2. **Image Generation**
   - Should start generation with valid parameters
   - Should update loading state during generation
   - Should update progress during generation
   - Should handle successful generation
   - Should handle generation errors
   - Should clear error on retry

3. **State Management**
   - Should update state correctly
   - Should provide current state via getState()
   - Should handle multiple state updates

4. **Error Scenarios**
   - Should handle network errors
   - Should handle invalid parameters
   - Should handle timeout errors

Reference Pattern:
```typescript
import { GeneratingViewModel } from '../GeneratingViewModel';
import { GenerateImageUseCase } from '../../../domain/usecases/GenerateImageUseCase';

describe('GeneratingViewModel', () => {
  let viewModel: GeneratingViewModel;
  let mockGenerateImageUseCase: jest.Mocked<GenerateImageUseCase>;

  beforeEach(() => {
    mockGenerateImageUseCase = {
      execute: jest.fn(),
    } as any;
    
    viewModel = new GeneratingViewModel(mockGenerateImageUseCase);
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const state = viewModel.getState();
      expect(state.loading).toBe(false);
      expect(state.progress).toBe(0);
      expect(state.error).toBeNull();
    });
  });

  describe('Image Generation', () => {
    it('should handle successful generation', async () => {
      // Mock successful response
      mockGenerateImageUseCase.execute.mockResolvedValue({
        success: true,
        imageUrl: 'https://example.com/image.jpg',
        seed: 12345,
      });

      // Start generation
      await viewModel.generateImage({
        sceneId: 'scene-1',
        imageUri: 'file://photo.jpg',
        gender: 'male',
      });

      // Verify state
      const state = viewModel.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.generatedImageUrl).toBe('https://example.com/image.jpg');
    });

    // Add more test cases...
  });
});
```

Coverage Target: 85%+

**Kabul Kriterleri:**
- [ ] Test file oluşturuldu
- [ ] 10+ test case yazıldı
- [ ] All tests passing
- [ ] Coverage 85%+
```

#### Görev 2.1.2: SceneDetailViewModel Test

**Prompt:**
```
You are an expert testing engineer. Write comprehensive unit tests for SceneDetailViewModel.

Context:
- SceneDetailViewModel handles scene detail display and interactions
- Uses GetSceneByIdUseCase
- Manages scene loading and like functionality

Task:
Create: src/presentation/viewmodels/__tests__/SceneDetailViewModel.test.ts

Test Cases to Cover:

1. **Scene Loading**
   - Should load scene by ID successfully
   - Should handle scene not found
   - Should handle loading errors
   - Should update loading state correctly

2. **Like Functionality**
   - Should handle like action
   - Should update like count
   - Should handle like errors
   - Should prevent double-liking

3. **State Management**
   - Should initialize with correct state
   - Should update state on actions
   - Should provide current state

4. **Error Handling**
   - Network errors
   - Invalid scene ID
   - API errors

Reference Files:
- src/presentation/viewmodels/SceneDetailViewModel.ts
- src/presentation/viewmodels/__tests__/HomeViewModel.test.ts (pattern)

Coverage Target: 85%+

**Kabul Kriterleri:**
- [ ] Test file oluşturuldu
- [ ] 8+ test case yazıldı
- [ ] All tests passing
- [ ] Coverage 85%+
```

#### Görev 2.1.3: AuthViewModel Test

**Prompt:**
```
You are an expert testing engineer. Write comprehensive unit tests for AuthViewModel.

Context:
- AuthViewModel handles authentication logic
- Manages sign in, sign up, and sign out
- Uses AuthContext and Supabase

Task:
Create: src/presentation/viewmodels/__tests__/AuthViewModel.test.ts

Test Cases to Cover:

1. **Sign In**
   - Should handle successful sign in
   - Should validate email format
   - Should validate password length
   - Should handle invalid credentials
   - Should handle network errors

2. **Sign Up**
   - Should handle successful sign up
   - Should validate all required fields
   - Should handle duplicate email
   - Should handle weak password

3. **Sign Out**
   - Should clear user session
   - Should clear error state
   - Should handle sign out errors

4. **Social Auth**
   - Should handle Google sign in
   - Should handle Apple sign in
   - Should handle social auth errors

5. **State Management**
   - Should track loading state
   - Should store error messages
   - Should clear errors appropriately

Coverage Target: 85%+

**Kabul Kriterleri:**
- [ ] Test file oluşturuldu
- [ ] 12+ test case yazıldı
- [ ] All tests passing
- [ ] Coverage 85%+
```

---

### AKSIYON 2.2: Use Case Testleri

**Öncelik:** P1 - Yüksek  
**Süre:** 2 gün  
**Sorumluluk:** Developer

#### Görev 2.2.1: GetImagesUseCase Test

**Prompt:**
```
You are an expert testing engineer. Write comprehensive unit tests for GetImagesUseCase.

Context:
- GetImagesUseCase fetches user images with pagination
- Uses IImageRepository
- Applies business logic filters

Task:
Create: src/domain/usecases/__tests__/GetImagesUseCase.test.ts

Test Cases to Cover:

1. **Basic Retrieval**
   - Should fetch images successfully
   - Should return empty array when no images
   - Should handle pagination correctly

2. **Filtering**
   - Should filter by user ID
   - Should filter by category
   - Should apply multiple filters

3. **Sorting**
   - Should sort by date (newest first)
   - Should sort by likes
   - Should sort by views

4. **Error Handling**
   - Should handle repository errors
   - Should return meaningful error messages
   - Should not crash on invalid input

5. **Business Logic**
   - Should only return active images
   - Should exclude deleted images
   - Should respect user privacy settings

Pattern:
```typescript
import { GetImagesUseCase } from '../GetImagesUseCase';
import { IImageRepository } from '../../repositories/IImageRepository';

describe('GetImagesUseCase', () => {
  let useCase: GetImagesUseCase;
  let mockRepository: jest.Mocked<IImageRepository>;

  beforeEach(() => {
    mockRepository = {
      getImages: jest.fn(),
    } as any;
    
    useCase = new GetImagesUseCase(mockRepository);
  });

  it('should fetch images successfully', async () => {
    const mockImages = [
      { id: '1', title: 'Image 1', /* ... */ },
      { id: '2', title: 'Image 2', /* ... */ },
    ];
    
    mockRepository.getImages.mockResolvedValue({
      data: mockImages,
      hasMore: false,
    });

    const result = await useCase.execute({ limit: 10, offset: 0 });
    
    expect(result.data).toHaveLength(2);
    expect(mockRepository.getImages).toHaveBeenCalledWith({
      limit: 10,
      offset: 0,
    });
  });

  // Add more tests...
});
```

Coverage Target: 90%+

**Kabul Kriterleri:**
- [ ] Test file oluşturuldu
- [ ] 10+ test case yazıldı
- [ ] All tests passing
- [ ] Coverage 90%+
```

#### Görev 2.2.2: GetTrendingImagesUseCase Test

**Prompt:**
```
You are an expert testing engineer. Write unit tests for GetTrendingImagesUseCase.

Context:
- GetTrendingImagesUseCase fetches trending images
- Applies trending algorithm (likes + views)
- Filters by time period

Task:
Create: src/domain/usecases/__tests__/GetTrendingImagesUseCase.test.ts

Test Cases:
1. Should fetch trending images
2. Should sort by engagement score
3. Should filter by time period (24h, 7d, 30d)
4. Should handle empty results
5. Should apply minimum threshold

Coverage Target: 90%+

**Kabul Kriterleri:**
- [ ] Test file oluşturuldu
- [ ] 6+ test case yazıldı
- [ ] All tests passing
- [ ] Coverage 90%+
```

#### Görev 2.2.3: Remaining Use Case Tests

**Prompt:**
```
You are an expert testing engineer. Write unit tests for the remaining use cases.

Task:
Create tests for:
1. src/domain/usecases/__tests__/GetSceneByIdUseCase.test.ts
2. src/domain/usecases/__tests__/GetSceneCategoriesUseCase.test.ts
3. src/domain/usecases/__tests__/LikeImageUseCase.test.ts

Each test file should:
- Cover all public methods
- Test success and error scenarios
- Mock repository dependencies
- Achieve 90%+ coverage

Reference existing tests:
- src/domain/usecases/__tests__/GetScenesUseCase.test.ts
- src/domain/usecases/__tests__/GenerateImageUseCase.test.ts

**Kabul Kriterleri:**
- [ ] 3 test file oluşturuldu
- [ ] Her biri 5+ test case içeriyor
- [ ] All tests passing
- [ ] Coverage 90%+
```

---

### AKSIYON 2.3: Service Testleri

**Öncelik:** P1 - Yüksek  
**Süre:** 2-3 gün  
**Sorumluluk:** Senior Developer

#### Görev 2.3.1: revenueCatService Test

**Prompt:**
```
You are an expert testing engineer. Write comprehensive tests for revenueCatService.

Context:
- revenueCatService handles in-app purchases
- Critical for app monetization
- Complex native module integration

Task:
Create: src/services/__tests__/revenueCatService.test.ts

Test Categories:

1. **Initialization**
   - Should initialize with valid API key
   - Should throw error with invalid API key
   - Should handle platform differences (iOS/Android)

2. **Offerings**
   - Should fetch current offerings
   - Should parse offering data correctly
   - Should handle no offerings available

3. **Purchase Flow**
   - Should purchase package successfully
   - Should handle purchase cancellation
   - Should handle purchase errors
   - Should update customer info after purchase

4. **Restore Purchases**
   - Should restore previous purchases
   - Should handle no purchases to restore

5. **Customer Info**
   - Should get customer info
   - Should check premium status
   - Should get active entitlements

Important:
- Mock the native module (Purchases)
- Test with different API key formats
- Cover error scenarios thoroughly

Pattern:
```typescript
import { revenueCatService } from '../revenueCatService';

// Mock the Purchases module
jest.mock('react-native-purchases', () => ({
  configure: jest.fn(),
  getOfferings: jest.fn(),
  purchasePackage: jest.fn(),
  restorePurchases: jest.fn(),
  getCustomerInfo: jest.fn(),
}));

describe('revenueCatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with valid iOS API key', async () => {
      await expect(
        revenueCatService.initialize('test-user-id')
      ).resolves.not.toThrow();
    });

    // More tests...
  });

  describe('purchase flow', () => {
    it('should purchase package successfully', async () => {
      const mockPurchasePackage = require('react-native-purchases').purchasePackage;
      mockPurchasePackage.mockResolvedValue({
        customerInfo: {
          entitlements: {
            active: { premium: {} },
          },
        },
      });

      const result = await revenueCatService.purchasePackage('monthly');
      
      expect(result).toBeDefined();
      expect(result.customerInfo.entitlements.active).toHaveProperty('premium');
    });

    // More tests...
  });
});
```

Coverage Target: 70%+ (native modules are harder to test)

**Kabul Kriterleri:**
- [ ] Test file oluşturuldu
- [ ] 15+ test case yazıldı
- [ ] Native module mocked
- [ ] Critical paths covered
- [ ] Coverage 70%+
```

#### Görev 2.3.2: imageGenerationService Test

**Prompt:**
```
You are an expert testing engineer. Write tests for imageGenerationService.

Context:
- imageGenerationService orchestrates image generation
- Uses falAIService
- Handles retries and error recovery

Task:
Create: src/services/__tests__/imageGenerationService.test.ts

Test Cases:
1. **Image Generation**
   - Should generate image successfully
   - Should handle generation failures
   - Should retry on failures (up to 3 times)
   - Should return appropriate error messages

2. **Image Enhancement**
   - Should enhance image successfully
   - Should handle enhancement failures
   - Should validate input images

3. **Progress Tracking**
   - Should report progress updates
   - Should handle progress callbacks

4. **Error Recovery**
   - Should retry on network errors
   - Should not retry on validation errors
   - Should exponential backoff

Mock Dependencies:
- falAIService
- File system operations

Coverage Target: 80%+

**Kabul Kriterleri:**
- [ ] Test file oluşturuldu
- [ ] 12+ test case yazıldı
- [ ] All tests passing
- [ ] Coverage 80%+
```

#### Görev 2.3.3: analyticsService Test

**Prompt:**
```
You are an expert testing engineer. Write tests for analyticsService.

Context:
- analyticsService tracks user events
- Critical for product analytics
- Must not block app functionality

Task:
Create: src/services/__tests__/analyticsService.test.ts

Test Cases:
1. **Event Tracking**
   - Should track events successfully
   - Should queue events when offline
   - Should batch events for efficiency

2. **User Properties**
   - Should set user properties
   - Should update user properties
   - Should clear user properties on logout

3. **Screen Views**
   - Should track screen views
   - Should include screen parameters
   - Should measure screen duration

4. **Error Handling**
   - Should never throw errors (fail silently)
   - Should retry failed events
   - Should drop events after max retries

5. **Privacy**
   - Should respect opt-out settings
   - Should not track sensitive data

Coverage Target: 75%+

**Kabul Kriterleri:**
- [ ] Test file oluşturuldu
- [ ] 10+ test case yazıldı
- [ ] All tests passing
- [ ] Coverage 75%+
```

---

## 🟡 SPRINT 3: KALAN VIEWMODEL'LER (2 HAFTA)

### AKSIYON 3.1: Öncelikli ViewModel'ler (Hafta 1)

**Öncelik:** P1 - Yüksek  
**Süre:** 5 gün  
**Sorumluluk:** Developer Team

#### Görev 3.1.1: EnhanceViewModel

**Prompt:**
```
You are an expert MVVM architecture engineer. Create EnhanceViewModel for the image enhancement feature.

Context:
- EnhanceScreen allows users to upscale/enhance images
- Uses Crystal Upscaler (via falAIService)
- Critical revenue-generating feature

Task:
Create these files:
1. src/presentation/viewmodels/EnhanceViewModel.ts
2. src/presentation/hooks/useEnhanceViewModel.ts
3. Update src/screens/EnhanceScreen.tsx

EnhanceViewModel Requirements:

```typescript
export class EnhanceViewModel {
  private sourceImage: string | null = null;
  private enhancedImage: string | null = null;
  private loading = false;
  private progress = 0;
  private error: string | null = null;

  constructor(
    private enhanceImageUseCase: EnhanceImageUseCase,
    private imageValidationService: ImageValidationService
  ) {}

  async selectImage(uri: string): Promise<void> {
    // Validate and set source image
    // Check file size, format, dimensions
  }

  async enhanceImage(): Promise<void> {
    // Start enhancement process
    // Track progress
    // Handle success/failure
  }

  async saveEnhancedImage(): Promise<boolean> {
    // Save to gallery
    // Track analytics
  }

  async shareEnhancedImage(): Promise<void> {
    // Share functionality
  }

  clearError(): void {
    this.error = null;
  }

  reset(): void {
    // Reset to initial state
  }

  getState() {
    return {
      sourceImage: this.sourceImage,
      enhancedImage: this.enhancedImage,
      loading: this.loading,
      progress: this.progress,
      error: this.error,
    };
  }
}
```

Hook Requirements:
- Wrap ViewModel with React state
- Handle lifecycle (cleanup on unmount)
- Expose all ViewModel methods
- Follow useHomeViewModel pattern

Screen Update Requirements:
- Remove direct service calls
- Use ViewModel hook
- Update UI to use ViewModel state
- Keep screen focused on rendering

Additional:
- Add unit tests
- Update documentation
- Follow MVVM pattern strictly

**Kabul Kriterleri:**
- [ ] EnhanceViewModel.ts oluşturuldu
- [ ] useEnhanceViewModel.ts oluşturuldu
- [ ] EnhanceScreen.tsx güncellendi
- [ ] Unit tests yazıldı
- [ ] MVVM pattern uygulandı
- [ ] Feature çalışıyor
```

#### Görev 3.1.2: PhotoUploadViewModel

**Prompt:**
```
You are an expert MVVM architecture engineer. Create PhotoUploadViewModel for photo selection and upload.

Context:
- PhotoUploadScreen handles photo selection from gallery or camera
- Validates and prepares images for AI generation
- Critical first step in generation flow

Task:
Create these files:
1. src/presentation/viewmodels/PhotoUploadViewModel.ts
2. src/presentation/hooks/usePhotoUploadViewModel.ts
3. Update src/screens/PhotoUploadScreen.tsx

PhotoUploadViewModel Requirements:

```typescript
export class PhotoUploadViewModel {
  private selectedPhoto: string | null = null;
  private photoSource: 'camera' | 'gallery' | null = null;
  private validationError: string | null = null;
  private loading = false;

  constructor(
    private imagePickerService: ImagePickerService,
    private imageValidationService: ImageValidationService
  ) {}

  async pickFromGallery(): Promise<void> {
    // Open gallery picker
    // Validate selected image
    // Optimize if needed
  }

  async pickFromCamera(): Promise<void> {
    // Open camera
    // Capture photo
    // Validate and optimize
  }

  validatePhoto(uri: string): boolean {
    // Check file size (< 10MB)
    // Check dimensions (min 512x512)
    // Check format (jpg, png)
    // Set validation error if fails
  }

  async optimizePhoto(uri: string): Promise<string> {
    // Resize if too large
    // Compress if needed
    // Return optimized URI
  }

  clearSelection(): void {
    this.selectedPhoto = null;
    this.photoSource = null;
    this.validationError = null;
  }

  getState() {
    return {
      selectedPhoto: this.selectedPhoto,
      photoSource: this.photoSource,
      validationError: this.validationError,
      loading: this.loading,
      isValid: this.selectedPhoto !== null && this.validationError === null,
    };
  }
}
```

Validation Rules:
- Min dimensions: 512x512px
- Max file size: 10MB
- Supported formats: JPG, PNG, HEIC
- No corrupted files

**Kabul Kriterleri:**
- [ ] PhotoUploadViewModel.ts oluşturuldu
- [ ] usePhotoUploadViewModel.ts oluşturuldu
- [ ] PhotoUploadScreen.tsx güncellendi
- [ ] Validation logic implemented
- [ ] Unit tests yazıldı
- [ ] Feature çalışıyor
```

#### Görev 3.1.3: OnboardingViewModel

**Prompt:**
```
You are an expert MVVM architecture engineer. Create OnboardingViewModel for user onboarding flow.

Context:
- OnboardingScreen shows app introduction to new users
- Multiple steps with swipeable carousel
- Tracks completion status

Task:
Create these files:
1. src/presentation/viewmodels/OnboardingViewModel.ts
2. src/presentation/hooks/useOnboardingViewModel.ts
3. Update src/screens/OnboardingScreen.tsx

OnboardingViewModel Requirements:

```typescript
export class OnboardingViewModel {
  private currentStep = 0;
  private totalSteps = 4;
  private completed = false;

  constructor(
    private localStorageService: LocalStorageService,
    private analyticsService: AnalyticsService
  ) {}

  async initialize(): Promise<void> {
    // Check if user has completed onboarding before
    // Load onboarding status from storage
  }

  goToNextStep(): void {
    // Move to next step
    // Track step view in analytics
    if (this.currentStep === this.totalSteps - 1) {
      this.completeOnboarding();
    } else {
      this.currentStep++;
    }
  }

  goToPreviousStep(): void {
    // Move to previous step
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    // Jump to specific step
    if (step >= 0 && step < this.totalSteps) {
      this.currentStep = step;
    }
  }

  async skipOnboarding(): Promise<void> {
    // Skip to end
    // Track skip event
    await this.completeOnboarding();
  }

  async completeOnboarding(): Promise<void> {
    // Save completion status
    // Track completion event
    this.completed = true;
    await this.localStorageService.setItem('onboarding_completed', 'true');
    this.analyticsService.trackEvent('onboarding_completed', {
      steps_viewed: this.currentStep + 1,
    });
  }

  getState() {
    return {
      currentStep: this.currentStep,
      totalSteps: this.totalSteps,
      completed: this.completed,
      isFirstStep: this.currentStep === 0,
      isLastStep: this.currentStep === this.totalSteps - 1,
      progress: (this.currentStep + 1) / this.totalSteps,
    };
  }
}
```

Analytics Events:
- onboarding_started
- onboarding_step_viewed (with step number)
- onboarding_completed
- onboarding_skipped

**Kabul Kriterleri:**
- [ ] OnboardingViewModel.ts oluşturuldu
- [ ] useOnboardingViewModel.ts oluşturuldu
- [ ] OnboardingScreen.tsx güncellendi
- [ ] Analytics tracking implemented
- [ ] Local storage integration
- [ ] Unit tests yazıldı
```

#### Görev 3.1.4: PrivacySettingsViewModel

**Prompt:**
```
You are an expert MVVM architecture engineer. Create PrivacySettingsViewModel for privacy settings management.

Context:
- PrivacySettingsScreen allows users to control privacy settings
- Includes analytics opt-out, data deletion, etc.
- Critical for GDPR/privacy compliance

Task:
Create these files:
1. src/presentation/viewmodels/PrivacySettingsViewModel.ts
2. src/presentation/hooks/usePrivacySettingsViewModel.ts
3. Update src/screens/PrivacySettingsScreen.tsx

PrivacySettingsViewModel Requirements:

```typescript
export interface PrivacySettings {
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  personalizedAdsEnabled: boolean;
  dataSharingEnabled: boolean;
}

export class PrivacySettingsViewModel {
  private settings: PrivacySettings = {
    analyticsEnabled: true,
    crashReportingEnabled: true,
    personalizedAdsEnabled: false,
    dataSharingEnabled: false,
  };
  private loading = false;
  private saving = false;
  private error: string | null = null;

  constructor(
    private userRepository: IUserRepository,
    private analyticsService: AnalyticsService,
    private localStorageService: LocalStorageService
  ) {}

  async loadSettings(): Promise<void> {
    // Load privacy settings from backend and local storage
  }

  async updateSetting(key: keyof PrivacySettings, value: boolean): Promise<void> {
    // Update individual setting
    // Save to backend and local storage
    // Apply change immediately (e.g., disable analytics)
  }

  async saveAllSettings(): Promise<void> {
    // Save all settings to backend
  }

  async requestDataDeletion(): Promise<void> {
    // Initiate account deletion process
    // Show confirmation dialog
    // Track deletion request
  }

  async exportUserData(): Promise<void> {
    // Export user data (GDPR requirement)
    // Download as JSON file
  }

  async clearCache(): Promise<void> {
    // Clear local cache
    // Clear image cache
  }

  getState() {
    return {
      settings: this.settings,
      loading: this.loading,
      saving: this.saving,
      error: this.error,
    };
  }
}
```

GDPR Compliance:
- Right to access data
- Right to deletion
- Right to data portability
- Opt-out of analytics/tracking

**Kabul Kriterleri:**
- [ ] PrivacySettingsViewModel.ts oluşturuldu
- [ ] usePrivacySettingsViewModel.ts oluşturuldu
- [ ] PrivacySettingsScreen.tsx güncellendi
- [ ] GDPR requirements implemented
- [ ] Unit tests yazıldı
- [ ] Privacy controls working
```

#### Görev 3.1.5: ChangePasswordViewModel

**Prompt:**
```
You are an expert MVVM architecture engineer. Create ChangePasswordViewModel for password change functionality.

Context:
- ChangePasswordScreen allows users to change their password
- Requires current password for verification
- Includes validation and error handling

Task:
Create these files:
1. src/presentation/viewmodels/ChangePasswordViewModel.ts
2. src/presentation/hooks/useChangePasswordViewModel.ts
3. Update src/screens/ChangePasswordScreen.tsx

ChangePasswordViewModel Requirements:

```typescript
export class ChangePasswordViewModel {
  private currentPassword = '';
  private newPassword = '';
  private confirmPassword = '';
  private loading = false;
  private error: string | null = null;
  private success = false;
  private validationErrors: {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  } = {};

  constructor(
    private authService: AuthService,
    private validationService: ValidationService
  ) {}

  setCurrentPassword(password: string): void {
    this.currentPassword = password;
    this.validateCurrentPassword();
  }

  setNewPassword(password: string): void {
    this.newPassword = password;
    this.validateNewPassword();
  }

  setConfirmPassword(password: string): void {
    this.confirmPassword = password;
    this.validateConfirmPassword();
  }

  validateCurrentPassword(): boolean {
    if (!this.currentPassword) {
      this.validationErrors.currentPassword = 'Current password is required';
      return false;
    }
    delete this.validationErrors.currentPassword;
    return true;
  }

  validateNewPassword(): boolean {
    if (!this.newPassword) {
      this.validationErrors.newPassword = 'New password is required';
      return false;
    }
    if (this.newPassword.length < 6) {
      this.validationErrors.newPassword = 'Password must be at least 6 characters';
      return false;
    }
    if (this.newPassword === this.currentPassword) {
      this.validationErrors.newPassword = 'New password must be different';
      return false;
    }
    delete this.validationErrors.newPassword;
    return true;
  }

  validateConfirmPassword(): boolean {
    if (!this.confirmPassword) {
      this.validationErrors.confirmPassword = 'Please confirm password';
      return false;
    }
    if (this.confirmPassword !== this.newPassword) {
      this.validationErrors.confirmPassword = 'Passwords do not match';
      return false;
    }
    delete this.validationErrors.confirmPassword;
    return true;
  }

  isValid(): boolean {
    return (
      this.validateCurrentPassword() &&
      this.validateNewPassword() &&
      this.validateConfirmPassword()
    );
  }

  async changePassword(): Promise<boolean> {
    if (!this.isValid()) {
      this.error = 'Please fix validation errors';
      return false;
    }

    try {
      this.loading = true;
      this.error = null;

      await this.authService.changePassword(
        this.currentPassword,
        this.newPassword
      );

      this.success = true;
      this.clearForm();
      return true;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to change password';
      return false;
    } finally {
      this.loading = false;
    }
  }

  clearForm(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.validationErrors = {};
  }

  getState() {
    return {
      loading: this.loading,
      error: this.error,
      success: this.success,
      validationErrors: this.validationErrors,
      isValid: this.isValid(),
    };
  }
}
```

Password Requirements:
- Minimum 6 characters
- Must be different from current
- Must match confirmation
- Cannot be empty

**Kabul Kriterleri:**
- [ ] ChangePasswordViewModel.ts oluşturuldu
- [ ] useChangePasswordViewModel.ts oluşturuldu
- [ ] ChangePasswordScreen.tsx güncellendi
- [ ] Validation implemented
- [ ] Unit tests yazıldı
- [ ] Feature çalışıyor
```

---

### AKSIYON 3.2: İkincil ViewModel'ler (Hafta 2)

**Öncelik:** P1 - Yüksek  
**Süre:** 5 gün  
**Sorumluluk:** Developer Team

#### Görev 3.2.1: Batch ViewModel Creation

**Prompt:**
```
You are an expert MVVM architecture engineer. Create the remaining ViewModels following the established pattern.

Context:
- 5 more ViewModels need to be created
- Follow the same pattern as previous ViewModels
- Focus on business logic separation

Task:
Create ViewModels for these screens:

1. **ForgotPasswordViewModel**
   - Email validation
   - Reset link sending
   - Success confirmation

2. **AboutViewModel**
   - App version display
   - Legal links management
   - Contact information

3. **HelpViewModel**
   - FAQ data loading
   - Search functionality
   - Contact support

4. **TermsOfServiceViewModel**
   - Terms content loading
   - Version tracking
   - Acceptance recording

5. **CategoryDetailViewModel**
   - Category scenes loading
   - Filtering and sorting
   - Navigation logic

For Each ViewModel:
- Create ViewModel class file
- Create hook file
- Update corresponding screen
- Write unit tests
- Follow MVVM pattern

Reference Files:
- Use previous ViewModels as templates
- Follow naming conventions
- Maintain consistency

Time Allocation:
- Day 1: ForgotPasswordViewModel + AboutViewModel
- Day 2: HelpViewModel + TermsOfServiceViewModel
- Day 3: CategoryDetailViewModel
- Day 4: Testing all ViewModels
- Day 5: Integration and bug fixes

**Kabul Kriterleri:**
- [ ] 5 ViewModel oluşturuldu
- [ ] 5 hook oluşturuldu
- [ ] 5 screen güncellendi
- [ ] Unit tests yazıldı
- [ ] All features working
- [ ] MVVM pattern consistent
```

---

## 🟡 SPRINT 4: PERFORMANCE & ERROR TRACKING (2 HAFTA)

### AKSIYON 4.1: Error Tracking Entegrasyonu

**Öncelik:** P2 - Orta  
**Süre:** 3-4 gün  
**Sorumluluk:** Senior Developer

#### Görev 4.1.1: Sentry Setup

**Prompt:**
```
You are an expert error tracking and monitoring engineer. Integrate Sentry into the MonzieAI project.

Context:
- Sentry will provide production error tracking
- Critical for debugging production issues
- Must not impact app performance

Task:
1. Install and configure Sentry
2. Integrate with existing error logging
3. Set up source maps for production
4. Configure user context and tags

Steps:

**1. Installation**
```bash
npm install @sentry/react-native
npx @sentry/wizard -i reactNative
```

**2. Configuration**

Create: src/services/sentryService.ts
```typescript
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

class SentryService {
  private initialized = false;

  initialize(): void {
    if (this.initialized) return;

    const dsn = Constants.expoConfig?.extra?.sentryDsn;
    
    if (!dsn) {
      console.warn('Sentry DSN not configured');
      return;
    }

    Sentry.init({
      dsn,
      environment: __DEV__ ? 'development' : 'production',
      enableInExpoDevelopment: false,
      debug: __DEV__,
      tracesSampleRate: __DEV__ ? 1.0 : 0.2,
      integrations: [
        new Sentry.ReactNativeTracing({
          tracingOrigins: ['localhost', 'https://groguatbjerebweinuef.supabase.co'],
          routingInstrumentation: new Sentry.ReactNavigationInstrumentation(),
        }),
      ],
    });

    this.initialized = true;
  }

  setUser(user: { id: string; email: string; name: string }): void {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  }

  clearUser(): void {
    Sentry.setUser(null);
  }

  captureException(error: Error, context?: Record<string, any>): void {
    Sentry.captureException(error, {
      extra: context,
    });
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    Sentry.captureMessage(message, level);
  }

  setTag(key: string, value: string): void {
    Sentry.setTag(key, value);
  }

  setContext(name: string, context: Record<string, any>): void {
    Sentry.setContext(name, context);
  }

  addBreadcrumb(breadcrumb: { message: string; category?: string; level?: string }): void {
    Sentry.addBreadcrumb(breadcrumb);
  }
}

export const sentryService = new SentryService();
```

**3. Integration with ErrorLoggingService**

Update: src/services/errorLoggingService.ts
```typescript
import { sentryService } from './sentryService';

// In logError method:
if (!__DEV__) {
  sentryService.captureException(error, context);
}
```

**4. Update App.tsx**
```typescript
import { sentryService } from './src/services/sentryService';

// Initialize Sentry early
sentryService.initialize();
```

**5. Add to EAS Secrets**
```bash
eas secret:create --scope project --name SENTRY_DSN --value "your-dsn"
```

**6. Update app.json**
```json
{
  "extra": {
    "sentryDsn": process.env.SENTRY_DSN
  }
}
```

Configuration Options:
- Sample rate: 20% in production (reduce costs)
- Performance monitoring enabled
- Source maps uploaded automatically
- User context tracked (when logged in)
- Breadcrumbs for debugging

**Kabul Kriterleri:**
- [ ] Sentry installed and configured
- [ ] Integration with errorLoggingService
- [ ] User context tracking
- [ ] Source maps configured
- [ ] EAS secrets configured
- [ ] Tested in production build
- [ ] Errors visible in Sentry dashboard
```

---

### AKSIYON 4.2: Performance Optimization

**Öncelik:** P2 - Orta  
**Süre:** 4-5 gün  
**Sorumluluk:** Performance Engineer

#### Görev 4.2.1: Bundle Size Analysis

**Prompt:**
```
You are an expert performance optimization engineer. Analyze and optimize the app bundle size.

Context:
- App Store has size limits
- Large bundles slow downloads
- Users on limited data plans

Task:
1. Analyze current bundle size
2. Identify large dependencies
3. Optimize and remove unnecessary code
4. Measure improvements

Steps:

**1. Install Bundle Analyzer**
```bash
npm install --save-dev @expo/webpack-config
npm install --save-dev source-map-explorer
```

**2. Create Analysis Script**

Add to package.json:
```json
{
  "scripts": {
    "analyze:bundle": "npx expo export:web && npx source-map-explorer dist/static/js/*.js"
  }
}
```

**3. Run Analysis**
```bash
npm run analyze:bundle
```

**4. Document Findings**

Create: BUNDLE_SIZE_REPORT.md
```markdown
# Bundle Size Analysis

## Current Size
- iOS App: XXX MB
- Android App: XXX MB
- JavaScript Bundle: XXX MB

## Largest Dependencies
1. Dependency Name - XX MB
2. Dependency Name - XX MB
3. Dependency Name - XX MB

## Optimization Opportunities
- Remove unused dependencies
- Use dynamic imports for large features
- Optimize images and assets

## Action Items
- [ ] Remove unused dependencies
- [ ] Implement code splitting
- [ ] Optimize assets
```

**5. Optimization Actions**

a) Remove Unused Dependencies:
```bash
npm uninstall <unused-package>
```

b) Implement Code Splitting:
```typescript
// Lazy load large screens
const PaywallScreen = lazy(() => import('./screens/PaywallScreen'));
const GalleryScreen = lazy(() => import('./screens/GalleryScreen'));

// Use Suspense
<Suspense fallback={<LoadingScreen />}>
  <PaywallScreen />
</Suspense>
```

c) Optimize Images:
- Convert PNGs to WebP where possible
- Compress images
- Use appropriate resolutions

**6. Set Up Monitoring**

Create: scripts/analyze-bundle-size.js
```javascript
const fs = require('fs');
const path = require('path');

const MAX_BUNDLE_SIZE = 5 * 1024 * 1024; // 5MB

function analyzeBundleSize() {
  const bundlePath = path.join(__dirname, '../dist/static/js');
  
  if (!fs.existsSync(bundlePath)) {
    console.error('Bundle not found. Run expo export:web first.');
    process.exit(1);
  }

  const files = fs.readdirSync(bundlePath);
  let totalSize = 0;

  files.forEach(file => {
    const filePath = path.join(bundlePath, file);
    const stats = fs.statSync(filePath);
    totalSize += stats.size;
    console.log(`${file}: ${(stats.size / 1024).toFixed(2)} KB`);
  });

  console.log(`\nTotal bundle size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

  if (totalSize > MAX_BUNDLE_SIZE) {
    console.error(`Bundle size exceeds limit of ${MAX_BUNDLE_SIZE / 1024 / 1024}MB`);
    process.exit(1);
  }
}

analyzeBundleSize();
```

**7. Add to CI/CD**
```yaml
- name: Check Bundle Size
  run: |
    npm run build
    node scripts/analyze-bundle-size.js
```

Target Goals:
- JavaScript bundle < 5MB
- iOS app < 50MB
- Android app < 40MB

**Kabul Kriterleri:**
- [ ] Bundle analysis completed
- [ ] Report oluşturuldu
- [ ] Top 3 optimizations implemented
- [ ] Bundle size 15% azaldı
- [ ] Monitoring script oluşturuldu
- [ ] CI/CD integration
```

#### Görev 4.2.2: Memory Leak Detection

**Prompt:**
```
You are an expert performance engineer. Detect and fix memory leaks in the application.

Context:
- Memory leaks cause app crashes
- Especially important for image-heavy apps
- React Navigation can cause leaks if not properly cleaned up

Task:
1. Set up memory profiling
2. Identify memory leaks
3. Fix leaks
4. Add memory monitoring

Steps:

**1. Memory Profiling with React DevTools**

Setup:
1. Install React DevTools
2. Run app in development
3. Use Profiler to record memory usage

**2. Common Leak Sources**

Check these areas:
- Event listeners not cleaned up
- Timers not cleared
- Subscriptions not unsubscribed
- Large objects held in closures
- Image cache not cleared

**3. Fix Common Patterns**

a) Event Listeners:
```typescript
useEffect(() => {
  const subscription = someEmitter.addListener('event', handler);
  
  return () => {
    subscription.remove(); // ✅ Cleanup
  };
}, []);
```

b) Timers:
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    // do something
  }, 1000);
  
  return () => {
    clearTimeout(timer); // ✅ Cleanup
  };
}, []);
```

c) Subscriptions:
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('images')
    .on('*', handler)
    .subscribe();
  
  return () => {
    subscription.unsubscribe(); // ✅ Cleanup
  };
}, []);
```

d) Navigation Listeners:
```typescript
useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    // do something
  });
  
  return unsubscribe; // ✅ Cleanup
}, [navigation]);
```

**4. Image Cache Management**

Create: src/utils/imageCacheManager.ts
```typescript
import { Image } from 'expo-image';

class ImageCacheManager {
  async clearCache(): Promise<void> {
    try {
      await Image.clearMemoryCache();
      await Image.clearDiskCache();
      console.log('Image cache cleared');
    } catch (error) {
      console.error('Failed to clear image cache', error);
    }
  }

  async getCacheSize(): Promise<number> {
    // Get current cache size
    // Return in bytes
  }

  async clearOldCache(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    // Clear cache older than maxAge
  }
}

export const imageCacheManager = new ImageCacheManager();
```

**5. Add Memory Monitoring**

Create: src/utils/memoryMonitor.ts
```typescript
class MemoryMonitor {
  private warningThreshold = 0.8; // 80% of available memory

  startMonitoring(): void {
    if (__DEV__) {
      setInterval(() => {
        this.checkMemoryUsage();
      }, 30000); // Every 30 seconds
    }
  }

  checkMemoryUsage(): void {
    // Use react-native-device-info or similar
    // Log warning if memory usage is high
  }

  async performMemoryCleanup(): Promise<void> {
    // Clear image cache
    // Clear temporary data
    // Force garbage collection if possible
  }
}

export const memoryMonitor = new MemoryMonitor();
```

**6. Testing**

Create test scenarios:
- Navigate between screens 50 times
- Load 100+ images
- Generate 20 images in succession
- Monitor memory usage throughout

**7. Documentation**

Create: MEMORY_OPTIMIZATION.md
- List all fixed leaks
- Memory usage benchmarks
- Best practices for developers

**Kabul Kriterleri:**
- [ ] Memory profiling yapıldı
- [ ] 5+ leak bulundu ve düzeltildi
- [ ] Image cache management
- [ ] Memory monitoring implemented
- [ ] Tests passed (50 screen navigations)
- [ ] Documentation oluşturuldu
```

#### Görev 4.2.3: Render Performance

**Prompt:**
```
You are an expert React Native performance engineer. Optimize render performance.

Context:
- Unnecessary re-renders slow the app
- Especially critical for list views
- FlatList optimization is key

Task:
1. Identify unnecessary re-renders
2. Optimize components
3. Improve FlatList performance
4. Add performance monitoring

Steps:

**1. Install Profiling Tools**
```bash
npm install --save-dev why-did-you-render
```

**2. Set Up Why-Did-You-Render (Development Only)**

Create: src/utils/wdyr.ts
```typescript
import React from 'react';

if (__DEV__) {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    trackHooks: true,
    logOnDifferentValues: true,
  });
}
```

Import in App.tsx:
```typescript
import './src/utils/wdyr'; // Must be first import
```

**3. Optimize Components**

Common Optimizations:

a) Use React.memo:
```typescript
export const SceneCard = React.memo(({ scene, onPress }) => {
  // Component code
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.scene.id === nextProps.scene.id;
});
```

b) Use useCallback:
```typescript
const handlePress = useCallback(() => {
  navigation.navigate('SceneDetail', { sceneId: scene.id });
}, [navigation, scene.id]);
```

c) Use useMemo:
```typescript
const sortedScenes = useMemo(() => {
  return scenes.sort((a, b) => b.likes - a.likes);
}, [scenes]);
```

**4. FlatList Optimization**

Optimize all FlatLists:
```typescript
<FlatList
  data={scenes}
  renderItem={renderScene}
  keyExtractor={(item) => item.id}
  
  // Performance props
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={10}
  windowSize={5}
  
  // Layout optimization
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  
  // Image optimization
  renderItem={({ item }) => (
    <SceneCard
      scene={item}
      onPress={handlePress}
      // Use lower quality for list items
      imageQuality={0.7}
    />
  )}
/>
```

**5. Identify Re-render Issues**

Check these screens for unnecessary re-renders:
- HomeScreen (large list)
- GalleryScreen (image grid)
- FavoritesScreen (filtered list)
- SceneDetailScreen (comments section)

**6. Add Performance Monitoring**

Update: src/utils/performanceMonitor.ts
```typescript
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startRender(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      
      if (!this.metrics.has(componentName)) {
        this.metrics.set(componentName, []);
      }
      
      this.metrics.get(componentName)!.push(renderTime);
      
      // Warn if render takes too long
      if (renderTime > 16.67) { // 60fps = 16.67ms per frame
        console.warn(`Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
    };
  }

  getMetrics(componentName: string): { avg: number; max: number; count: number } {
    const times = this.metrics.get(componentName) || [];
    return {
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      max: Math.max(...times),
      count: times.length,
    };
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  reportMetrics(): void {
    console.log('=== Performance Metrics ===');
    this.metrics.forEach((times, componentName) => {
      const metrics = this.getMetrics(componentName);
      console.log(`${componentName}: avg=${metrics.avg.toFixed(2)}ms, max=${metrics.max.toFixed(2)}ms, renders=${metrics.count}`);
    });
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

Usage:
```typescript
const MyComponent = () => {
  useEffect(() => {
    if (__DEV__) {
      const endRender = performanceMonitor.startRender('MyComponent');
      return endRender;
    }
  });
  
  return <View>...</View>;
};
```

**7. Create Performance Report**

Create: RENDER_PERFORMANCE_REPORT.md
```markdown
# Render Performance Report

## Baseline Measurements
- HomeScreen render: XX ms
- GalleryScreen render: XX ms
- FlatList scroll FPS: XX fps

## Optimizations Applied
1. Added React.memo to X components
2. Optimized Y FlatLists
3. Reduced Z re-renders

## Results
- HomeScreen render: XX ms (-XX%)
- GalleryScreen render: XX ms (-XX%)
- FlatList scroll FPS: 60 fps (target achieved)

## Remaining Issues
- List any components still needing optimization
```

Target Goals:
- 60 FPS scroll performance
- < 100ms initial render for screens
- < 16ms for component updates

**Kabul Kriterleri:**
- [ ] Why-Did-You-Render setup
- [ ] 10+ components optimized with React.memo
- [ ] All FlatLists optimized
- [ ] Performance monitoring implemented
- [ ] 60 FPS scroll achieved
- [ ] Report oluşturuldu
```

---

## 🟡 SPRINT 5: MAJOR DEPENDENCIES UPDATE (1 HAFTA)

### AKSIYON 5.1: React Native Update Planı

**Öncelik:** P2 - Orta  
**Süre:** 3-4 gün  
**Sorumluluk:** Senior Developer

#### Görev 5.1.1: React & React Native Update

**Prompt:**
```
You are an expert React Native upgrade engineer. Safely upgrade React and React Native to latest versions.

Context:
- Current: React 19.1.0, React Native 0.81.5
- Target: React 19.2.3, React Native 0.83.1
- Breaking changes may exist
- Comprehensive testing required

Task:
Plan and execute the upgrade with minimal disruption.

Steps:

**1. Research Breaking Changes**

Read official documentation:
- React 19.2 release notes
- React Native 0.82 changelog
- React Native 0.83 changelog

Document breaking changes:
```markdown
# Breaking Changes Analysis

## React 19.1 → 19.2
- List any breaking changes
- Migration steps needed

## React Native 0.81 → 0.83
- New architecture changes
- API deprecations
- Platform-specific changes

## Impact Assessment
- High impact: [list]
- Medium impact: [list]
- Low impact: [list]
```

**2. Create Upgrade Branch**

```bash
git checkout -b feature/react-native-upgrade
git push -u origin feature/react-native-upgrade
```

**3. Backup Current State**

```bash
# Create backup of critical files
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup
cp ios/Podfile.lock ios/Podfile.lock.backup
```

**4. Update React First**

```bash
# Update React packages
npm install react@19.2.3 react-test-renderer@19.2.3

# Test
npm test
npm start
```

Verify:
- [ ] All tests pass
- [ ] App runs without errors
- [ ] No console warnings

**5. Update React Native**

```bash
# Update React Native
npm install react-native@0.83.1

# Reinstall pods (iOS)
cd ios
pod deintegrate
pod install
cd ..

# Clean and rebuild
npx expo prebuild --clean
```

**6. Update Related Packages**

```bash
# Update packages that depend on React Native version
npm install @react-native-community/cli@latest
npm install @react-native-async-storage/async-storage@latest
npm install react-native-screens@latest
```

**7. Fix Breaking Changes**

Common issues to fix:
- PropTypes deprecated → use TypeScript types
- componentWillMount → useEffect
- findNodeHandle deprecated → useRef
- Animated API changes
- Platform-specific API changes

**8. Run Comprehensive Tests**

```bash
# Unit tests
npm test

# Type checking
npm run tsc

# Linting
npm run lint

# E2E tests (if available)
npm run test:e2e
```

**9. Test on Devices**

Manual testing checklist:
- [ ] iOS Simulator - Basic flow
- [ ] iOS Device - Production build
- [ ] Android Emulator - Basic flow
- [ ] Navigation working
- [ ] Image generation working
- [ ] Payments working
- [ ] Performance acceptable

**10. Performance Comparison**

Compare before/after:
- App launch time
- Screen transition speed
- Memory usage
- Bundle size

**11. Rollback Plan**

If issues occur:
```bash
# Restore backups
cp package.json.backup package.json
cp package-lock.json.backup package-lock.json

# Reinstall
npm install
cd ios && pod install && cd ..
```

**12. Documentation**

Create: REACT_NATIVE_UPGRADE_NOTES.md
```markdown
# React Native 0.81 → 0.83 Upgrade Notes

## Changes Made
- List all code changes
- Configuration changes
- Dependency updates

## Breaking Changes Handled
- How we fixed each breaking change

## Testing Results
- All test results
- Performance comparison

## Known Issues
- Any remaining issues
- Workarounds applied

## Rollback Instructions
- Step-by-step rollback if needed
```

**Kabul Kriterleri:**
- [ ] React updated to 19.2.3
- [ ] React Native updated to 0.83.1
- [ ] All tests passing
- [ ] No breaking changes in core features
- [ ] Performance maintained or improved
- [ ] Documentation complete
- [ ] Tested on real devices
```

---

## 🟢 SPRINT 6: CI/CD PIPELINE (1 HAFTA)

### AKSIYON 6.1: GitHub Actions Setup

**Öncelik:** P3 - Düşük  
**Süre:** 3-4 gün  
**Sorumluluk:** DevOps Engineer

#### Görev 6.1.1: CI Pipeline

**Prompt:**
```
You are an expert DevOps engineer. Set up a comprehensive CI/CD pipeline for MonzieAI using GitHub Actions.

Context:
- Need automated testing on every PR
- Need automated builds for releases
- Need quality checks (linting, type checking)

Task:
Create GitHub Actions workflows for CI/CD.

Steps:

**1. Create Workflow Directory**

```bash
mkdir -p .github/workflows
```

**2. Create CI Workflow**

Create: .github/workflows/ci.yml
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Type check
        run: npx tsc --noEmit
  
  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
          fail_ci_if_error: false
  
  build:
    name: Test Build
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Test Expo build
        run: npx expo export:web
      
      - name: Check bundle size
        run: node scripts/analyze-bundle-size.js
```

**3. Create EAS Build Workflow**

Create: .github/workflows/eas-build.yml
```yaml
name: EAS Build

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      platform:
        description: 'Platform to build'
        required: true
        default: 'all'
        type: choice
        options:
          - ios
          - android
          - all
      profile:
        description: 'Build profile'
        required: true
        default: 'preview'
        type: choice
        options:
          - development
          - preview
          - production

jobs:
  build:
    name: EAS Build
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build iOS
        if: github.event.inputs.platform == 'ios' || github.event.inputs.platform == 'all'
        run: |
          eas build --platform ios --profile ${{ github.event.inputs.profile || 'preview' }} --non-interactive
      
      - name: Build Android
        if: github.event.inputs.platform == 'android' || github.event.inputs.platform == 'all'
        run: |
          eas build --platform android --profile ${{ github.event.inputs.profile || 'preview' }} --non-interactive
```

**4. Create Release Workflow**

Create: .github/workflows/release.yml
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  create-release:
    name: Create Release
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
  
  submit-ios:
    name: Submit to App Store
    runs-on: macos-latest
    needs: create-release
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build and Submit
        run: |
          eas build --platform ios --profile production --auto-submit --non-interactive
```

**5. Setup GitHub Secrets**

Required secrets:
```bash
# Add these in GitHub Settings > Secrets and Variables > Actions

EXPO_TOKEN=<your-expo-token>
SENTRY_DSN=<your-sentry-dsn>
CODECOV_TOKEN=<your-codecov-token>
```

**6. Branch Protection Rules**

Configure in GitHub:
- Require PR reviews (1 approval)
- Require status checks (CI must pass)
- Require branches to be up to date
- Require linear history

**7. Create Status Badge**

Add to README.md:
```markdown
![CI](https://github.com/your-org/monzieai/workflows/CI/badge.svg)
![Coverage](https://codecov.io/gh/your-org/monzieai/branch/main/graph/badge.svg)
```

**8. Documentation**

Create: .github/CONTRIBUTING.md
```markdown
# Contributing to MonzieAI

## Development Workflow

1. Create feature branch from `develop`
2. Make changes
3. Run tests: `npm test`
4. Run lint: `npm run lint`
5. Create Pull Request
6. Wait for CI to pass
7. Request review
8. Merge after approval

## CI/CD Pipeline

### On Pull Request
- Linting
- Type checking
- Unit tests
- Build verification

### On Merge to Main
- All CI checks
- Code coverage report
- Bundle size check

### On Tag Push (v*)
- Production build (iOS + Android)
- App Store submission
- Release creation

## Building Locally

```bash
# Development build
eas build --platform ios --profile development --local

# Preview build
eas build --platform ios --profile preview

# Production build
eas build --platform ios --profile production
```
```

**Kabul Kriterleri:**
- [ ] CI workflow oluşturuldu
- [ ] EAS build workflow oluşturuldu
- [ ] Release workflow oluşturuldu
- [ ] GitHub secrets configured
- [ ] Branch protection enabled
- [ ] Status badges added
- [ ] Documentation complete
- [ ] First successful CI run
```

---

## 🟢 SPRINT 7: DARK MODE & i18n (1 HAFTA)

### AKSIYON 7.1: Dark Mode Implementation

**Öncelik:** P3 - Düşük  
**Süre:** 3-4 gün  
**Sorumluluk:** Frontend Developer

#### Görev 7.1.1: Theme System Setup

**Prompt:**
```
You are an expert React Native theming engineer. Implement a comprehensive dark mode system.

Context:
- App currently only supports light mode
- Need system-aware dark mode
- All screens and components need dark variants

Task:
Implement dark mode with theme switching capability.

Steps:

**1. Install Dependencies**

```bash
npm install @react-navigation/native
# Already installed, just verify theming support
```

**2. Update Theme Structure**

Update: src/theme/colors.ts
```typescript
export const lightColors = {
  primary: '#6C5CE7',
  secondary: '#A29BFE',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  card: '#FFFFFF',
  text: '#2D3436',
  textSecondary: '#636E72',
  border: '#DFE6E9',
  error: '#D63031',
  success: '#00B894',
  warning: '#FDCB6E',
  info: '#74B9FF',
  
  // Component specific
  inputBackground: '#F8F9FA',
  inputBorder: '#DFE6E9',
  buttonPrimary: '#6C5CE7',
  buttonSecondary: '#A29BFE',
  
  // Shadows
  shadowColor: '#000000',
  
  // Overlays
  overlayBackground: 'rgba(0, 0, 0, 0.5)',
};

export const darkColors = {
  primary: '#A29BFE',
  secondary: '#6C5CE7',
  background: '#1E1E1E',
  surface: '#2D2D2D',
  card: '#2D2D2D',
  text: '#FFFFFF',
  textSecondary: '#B2B2B2',
  border: '#3E3E3E',
  error: '#FF6B6B',
  success: '#51CF66',
  warning: '#FFD93D',
  info: '#74C0FC',
  
  // Component specific
  inputBackground: '#2D2D2D',
  inputBorder: '#3E3E3E',
  buttonPrimary: '#A29BFE',
  buttonSecondary: '#6C5CE7',
  
  // Shadows
  shadowColor: '#000000',
  
  // Overlays
  overlayBackground: 'rgba(0, 0, 0, 0.7)',
};

export type ThemeColors = typeof lightColors;
```

**3. Create Theme Context**

Create: src/contexts/ThemeContext.tsx
```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ThemeColors } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  colors: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  
  // Determine if dark mode is active
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;
  
  // Load saved preference
  useEffect(() => {
    AsyncStorage.getItem('theme_mode').then(saved => {
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        setThemeMode(saved as ThemeMode);
      }
    });
  }, []);
  
  const setTheme = async (mode: ThemeMode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem('theme_mode', mode);
  };
  
  return (
    <ThemeContext.Provider value={{ colors, mode: themeMode, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

**4. Update App.tsx**

```typescript
import { ThemeProvider } from './src/contexts/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      {/* Rest of app */}
    </ThemeProvider>
  );
}
```

**5. Update Navigation Theme**

Update: src/navigation/AppNavigator.tsx
```typescript
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

export default function AppNavigator() {
  const { isDark, colors } = useTheme();
  
  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };
  
  return (
    <NavigationContainer theme={navigationTheme}>
      {/* Navigation structure */}
    </NavigationContainer>
  );
}
```

**6. Update Components to Use Theme**

Example component update:
```typescript
import { useTheme } from '../contexts/ThemeContext';

export function MyComponent() {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>Hello</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  text: {
    fontSize: 16,
  },
});
```

**7. Create Theme Settings Screen**

Update: src/screens/SettingsScreen.tsx
```typescript
function ThemeSection() {
  const { mode, setTheme } = useTheme();
  
  return (
    <View>
      <Text>Theme</Text>
      <ThemeOption 
        label="Light" 
        selected={mode === 'light'}
        onPress={() => setTheme('light')}
      />
      <ThemeOption 
        label="Dark" 
        selected={mode === 'dark'}
        onPress={() => setTheme('dark')}
      />
      <ThemeOption 
        label="System" 
        selected={mode === 'system'}
        onPress={() => setTheme('system')}
      />
    </View>
  );
}
```

**8. Update All Screens**

Priority order:
1. HomeScreen
2. AuthScreen
3. PaywallScreen
4. GalleryScreen
5. ProfileScreen
6. All remaining screens

For each screen:
- Replace hardcoded colors with theme colors
- Test in both light and dark mode
- Ensure good contrast ratios

**9. Handle Images in Dark Mode**

For images that need dark mode variants:
```typescript
import { useTheme } from '../contexts/ThemeContext';

function Logo() {
  const { isDark } = useTheme();
  
  const logoSource = isDark 
    ? require('../assets/logo-dark.png')
    : require('../assets/logo-light.png');
  
  return <Image source={logoSource} />;
}
```

**10. Testing Checklist**

Test all screens in:
- [ ] Light mode
- [ ] Dark mode
- [ ] System mode (auto-switch)

Verify:
- [ ] All text is readable
- [ ] Contrast ratios meet WCAG guidelines
- [ ] Images look good in both modes
- [ ] Animations work properly
- [ ] No color bleeding
- [ ] Status bar matches theme

**Kabul Kriterleri:**
- [ ] Theme system implemented
- [ ] All screens support dark mode
- [ ] Theme switcher in settings
- [ ] System theme detection
- [ ] Preference persistence
- [ ] All contrast ratios pass WCAG
- [ ] Tested thoroughly
```

---

### AKSIYON 7.2: Internationalization (i18n)

**Öncelik:** P3 - Düşük  
**Süre:** 3-4 gün  
**Sorumluluk:** Frontend Developer

#### Görev 7.2.1: i18n Setup

**Prompt:**
```
You are an expert internationalization engineer. Implement multi-language support for MonzieAI.

Context:
- App currently only in English
- Need Turkish and English support initially
- Easy to add more languages later

Task:
Implement i18n using react-i18next.

Steps:

**1. Install Dependencies**

```bash
npm install react-i18next i18next
npm install @react-native-async-storage/async-storage # Already installed
```

**2. Create Translation Files**

Create: src/i18n/en.json
```json
{
  "common": {
    "app_name": "MonzieAI",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "done": "Done",
    "next": "Next",
    "back": "Back",
    "skip": "Skip"
  },
  "auth": {
    "sign_in": "Sign In",
    "sign_up": "Sign Up",
    "sign_out": "Sign Out",
    "email": "Email",
    "password": "Password",
    "name": "Full Name",
    "forgot_password": "Forgot Password?",
    "no_account": "Don't have an account?",
    "have_account": "Already have an account?",
    "sign_in_with_google": "Sign in with Google",
    "sign_in_with_apple": "Sign in with Apple",
    "email_required": "Email is required",
    "password_required": "Password is required",
    "password_min_length": "Password must be at least 6 characters",
    "invalid_credentials": "Invalid email or password"
  },
  "home": {
    "title": "Discover",
    "welcome": "Welcome back, {{name}}!",
    "search_placeholder": "Search scenes...",
    "categories": "Categories",
    "trending": "Trending",
    "new": "New",
    "popular": "Popular"
  },
  "scenes": {
    "select_scene": "Select a Scene",
    "scene_detail": "Scene Detail",
    "use_scene": "Use This Scene",
    "likes": "{{count}} likes",
    "views": "{{count}} views"
  },
  "generation": {
    "generating": "Generating...",
    "upload_photo": "Upload Photo",
    "take_photo": "Take Photo",
    "choose_from_gallery": "Choose from Gallery",
    "select_gender": "Select Gender",
    "male": "Male",
    "female": "Female",
    "generate": "Generate",
    "progress": "Progress: {{percent}}%",
    "success": "Image generated successfully!",
    "error": "Failed to generate image"
  },
  "settings": {
    "title": "Settings",
    "account": "Account",
    "preferences": "Preferences",
    "theme": "Theme",
    "language": "Language",
    "notifications": "Notifications",
    "privacy": "Privacy",
    "about": "About",
    "help": "Help",
    "terms": "Terms of Service",
    "privacy_policy": "Privacy Policy"
  }
}
```

Create: src/i18n/tr.json
```json
{
  "common": {
    "app_name": "MonzieAI",
    "loading": "Yükleniyor...",
    "error": "Hata",
    "success": "Başarılı",
    "cancel": "İptal",
    "confirm": "Onayla",
    "save": "Kaydet",
    "delete": "Sil",
    "edit": "Düzenle",
    "done": "Tamam",
    "next": "İleri",
    "back": "Geri",
    "skip": "Geç"
  },
  "auth": {
    "sign_in": "Giriş Yap",
    "sign_up": "Kaydol",
    "sign_out": "Çıkış Yap",
    "email": "E-posta",
    "password": "Şifre",
    "name": "Ad Soyad",
    "forgot_password": "Şifremi Unuttum?",
    "no_account": "Hesabın yok mu?",
    "have_account": "Zaten hesabın var mı?",
    "sign_in_with_google": "Google ile Giriş Yap",
    "sign_in_with_apple": "Apple ile Giriş Yap",
    "email_required": "E-posta gerekli",
    "password_required": "Şifre gerekli",
    "password_min_length": "Şifre en az 6 karakter olmalı",
    "invalid_credentials": "Geçersiz e-posta veya şifre"
  },
  "home": {
    "title": "Keşfet",
    "welcome": "Tekrar hoş geldin, {{name}}!",
    "search_placeholder": "Sahne ara...",
    "categories": "Kategoriler",
    "trending": "Trend",
    "new": "Yeni",
    "popular": "Popüler"
  },
  "scenes": {
    "select_scene": "Sahne Seç",
    "scene_detail": "Sahne Detayı",
    "use_scene": "Bu Sahneyi Kullan",
    "likes": "{{count}} beğeni",
    "views": "{{count}} görüntüleme"
  },
  "generation": {
    "generating": "Oluşturuluyor...",
    "upload_photo": "Fotoğraf Yükle",
    "take_photo": "Fotoğraf Çek",
    "choose_from_gallery": "Galeriden Seç",
    "select_gender": "Cinsiyet Seç",
    "male": "Erkek",
    "female": "Kadın",
    "generate": "Oluştur",
    "progress": "İlerleme: %{{percent}}",
    "success": "Görsel başarıyla oluşturuldu!",
    "error": "Görsel oluşturulamadı"
  },
  "settings": {
    "title": "Ayarlar",
    "account": "Hesap",
    "preferences": "Tercihler",
    "theme": "Tema",
    "language": "Dil",
    "notifications": "Bildirimler",
    "privacy": "Gizlilik",
    "about": "Hakkında",
    "help": "Yardım",
    "terms": "Kullanım Koşulları",
    "privacy_policy": "Gizlilik Politikası"
  }
}
```

**3. Configure i18next**

Create: src/i18n/index.ts
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';

import en from './en.json';
import tr from './tr.json';

const LANGUAGE_KEY = 'app_language';

// Get device language
const deviceLanguage = getLocales()[0]?.languageCode || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      tr: { translation: tr },
    },
    lng: deviceLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Load saved language preference
AsyncStorage.getItem(LANGUAGE_KEY).then(savedLanguage => {
  if (savedLanguage && ['en', 'tr'].includes(savedLanguage)) {
    i18n.changeLanguage(savedLanguage);
  }
});

// Save language on change
i18n.on('languageChanged', lng => {
  AsyncStorage.setItem(LANGUAGE_KEY, lng);
});

export default i18n;
```

**4. Initialize in App.tsx**

```typescript
import './src/i18n'; // Import at the top

// Rest of App.tsx
```

**5. Use in Components**

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('home.title')}</Text>
      <Text>{t('home.welcome', { name: 'John' })}</Text>
      <Button title={t('common.next')} />
    </View>
  );
}
```

**6. Language Selector**

Add to SettingsScreen:
```typescript
import { useTranslation } from 'react-i18next';

function LanguageSelector() {
  const { i18n } = useTranslation();
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  ];
  
  return (
    <View>
      {languages.map(lang => (
        <TouchableOpacity
          key={lang.code}
          onPress={() => i18n.changeLanguage(lang.code)}
          style={[
            styles.languageOption,
            i18n.language === lang.code && styles.selectedLanguage
          ]}
        >
          <Text style={styles.flag}>{lang.flag}</Text>
          <Text>{lang.name}</Text>
          {i18n.language === lang.code && <CheckIcon />}
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

**7. Update All Screens**

Priority screens to translate:
1. AuthScreen
2. HomeScreen
3. SettingsScreen
4. PaywallScreen
5. GeneratingScreen
6. All other screens

For each screen:
- Replace hardcoded strings with t() calls
- Test in both languages
- Ensure layout works with longer text (Turkish is often longer)

**8. Handle Pluralization**

```json
{
  "likes_count": "{{count}} like",
  "likes_count_plural": "{{count}} likes"
}
```

Usage:
```typescript
{t('likes_count', { count: likeCount })}
```

**9. Handle Date/Time Formatting**

```typescript
import { format } from 'date-fns';
import { enUS, tr } from 'date-fns/locale';

const dateLocale = i18n.language === 'tr' ? tr : enUS;

const formattedDate = format(new Date(), 'PPP', { locale: dateLocale });
```

**10. Testing Checklist**

Test in both languages:
- [ ] All screens translated
- [ ] No missing translations (fallback to English)
- [ ] Layout works with longer text
- [ ] RTL support (if needed later)
- [ ] Date/time formatting correct
- [ ] Number formatting correct
- [ ] Pluralization works

**Kabul Kriterleri:**
- [ ] i18next configured
- [ ] English translations complete
- [ ] Turkish translations complete
- [ ] Language selector in settings
- [ ] Device language detection
- [ ] Language persistence
- [ ] All screens translated
- [ ] Tested thoroughly
```

---

## 🎯 SPRINT 8: FINAL POLISHING (1 HAFTA)

### AKSIYON 8.1: App Store Submission Hazırlığı

**Öncelik:** P3 - Düşük  
**Süre:** 3-4 gün  
**Sorumluluk:** Product Manager + Developer

#### Görev 8.1.1: App Store Assets

**Prompt:**
```
You are an expert App Store optimization specialist. Prepare all assets and metadata for App Store submission.

Context:
- Need to submit to iOS App Store
- All assets must meet Apple guidelines
- Compelling copy needed for good conversion

Task:
Prepare complete App Store submission package.

Required Assets:

**1. App Icon**
- 1024x1024px PNG (no alpha channel)
- Design should be simple and recognizable
- No text or gradients recommended
- Consistent with brand

**2. Screenshots** 

For iPhone (6.7" display - iPhone 15 Pro Max):
- 1290 x 2796 pixels
- Need 3-10 screenshots
- Show key features:
  1. Home screen with scene categories
  2. Scene selection
  3. Photo upload
  4. AI generation in progress
  5. Generated result
  6. Gallery view
  7. Profile/Settings (optional)

For iPad Pro (12.9" display):
- 2048 x 2732 pixels
- Need 3-10 screenshots

**3. App Preview Video** (Optional but recommended)
- 15-30 seconds
- Show app in action
- No audio required
- Portrait orientation

**4. Marketing Materials**

App Name (max 30 characters):
```
MonzieAI - AI Photo Magic
```

Subtitle (max 30 characters):
```
Transform Photos with AI
```

Promotional Text (max 170 characters):
```
Create stunning AI-generated photos in seconds. Choose from 150+ scenes, upload your photo, and watch the magic happen. Try premium features free for 7 days!
```

Description (max 4000 characters):
```
Transform Your Photos with AI Magic ✨

MonzieAI uses advanced artificial intelligence to transform your photos into stunning artworks. Whether you want a professional headshot, a fantasy character, or a unique avatar, MonzieAI has you covered with over 150 AI-powered scenes.

KEY FEATURES:

🎨 150+ AI Scenes
Choose from a vast library of professional scenes including:
• Professional headshots
• Fantasy characters
• Artistic portraits
• Movie-style posters
• And much more!

⚡ Lightning Fast Generation
Generate your AI photo in under 60 seconds. Our powerful AI models work in real-time to create stunning results.

🖼️ Crystal Clear Enhancement
Enhance any photo to 4K quality with our Crystal Upscaler. Perfect for printing or social media.

📸 Personal Gallery
Save all your generated images in your personal gallery. Share them directly to social media or download to your device.

❤️ Favorites
Save your favorite images for quick access. Never lose track of your best creations.

HOW IT WORKS:

1. Choose a Scene
Browse our extensive library and pick the perfect scene for your photo.

2. Upload Your Photo
Select a photo from your gallery or take a new one with your camera.

3. Generate
Our AI works its magic in seconds, transforming your photo into a masterpiece.

4. Share & Save
Download your creation or share it directly to social media.

PREMIUM FEATURES:

Unlock unlimited potential with MonzieAI Premium:
• Unlimited AI generations
• Crystal Upscaler (4K enhancement)
• Priority processing
• Early access to new scenes
• Ad-free experience
• Cloud storage for all your creations

Try Premium FREE for 7 days!

PERFECT FOR:

• Social media content creators
• Professional photographers
• Digital artists
• Anyone who loves creative photos

PRIVACY FIRST:

Your photos are private and secure. We never store your original photos longer than necessary for processing. All data is encrypted and GDPR compliant.

---

Download MonzieAI today and discover the magic of AI-powered photo transformation!

Questions? Contact us at support@monzieai.com

Terms of Service: [URL]
Privacy Policy: [URL]
```

Keywords (max 100 characters, comma separated):
```
AI photo, avatar creator, AI art, photo editor, portrait maker, AI generator, face swap, photo magic
```

**5. App Store Categories**

Primary: Photo & Video
Secondary: Graphics & Design

**6. Age Rating**

Based on content:
- 4+ (likely)
- Or 9+ if there's any cartoon violence in scenes
- Or 12+ if there's mild suggestive content

**7. Support Information**

Support URL: https://monzieai.com/support
Marketing URL: https://monzieai.com
Privacy Policy URL: https://monzieai.com/privacy

**8. Review Notes**

Provide to Apple reviewers:
```
REVIEW NOTES:

Test Account:
Email: reviewer@monzieai.com
Password: ReviewPass123!

How to Test:
1. Sign in with provided account
2. Tap "Discover" to see scenes
3. Select any scene
4. Upload test photo (or use camera)
5. Tap "Generate" to create AI image
6. View result in "Gallery"

Premium Features:
The test account has premium access enabled for testing all features.

Notes:
- Image generation takes 30-60 seconds
- Internet connection required
- Some scenes are gender-specific

Contact for Issues:
Email: dev@monzieai.com
Phone: +1 (XXX) XXX-XXXX

Thank you for reviewing MonzieAI!
```

**9. App Privacy Details**

Required disclosures:
- Email address (for account)
- Name (for personalization)
- Photos (for AI generation)
- User content (generated images)
- Identifiers (analytics)
- Usage data (analytics)

Data used to track: No
Data linked to user: Yes (email, name, photos, generated content)
Data not linked to user: Usage data, diagnostics

**10. Localization**

Provide translations for:
- App name
- Description
- Keywords
- Screenshots (with localized text overlays)

Languages:
- English (US)
- Turkish

**Kabul Kriterleri:**
- [ ] App icon ready (1024x1024)
- [ ] Screenshots for all devices (10+)
- [ ] App preview video (optional)
- [ ] Description written
- [ ] Keywords researched
- [ ] Support URLs set up
- [ ] Privacy details filled
- [ ] Review notes prepared
- [ ] Test account created
- [ ] All assets uploaded to App Store Connect
```

---

### AKSIYON 8.2: Final QA & Bug Fixes

**Öncelik:** P3 - Düşük  
**Süre:** 2-3 gün  
**Sorumluluk:** QA Team + Developers

#### Görev 8.2.1: Comprehensive Testing

**Prompt:**
```
You are an expert QA engineer. Perform comprehensive final testing before App Store submission.

Testing Checklist:

**1. Functional Testing**

Core Features:
- [ ] User registration (email, Google, Apple)
- [ ] User login
- [ ] Password reset
- [ ] Scene browsing
- [ ] Scene search
- [ ] Scene filtering by category
- [ ] Photo upload from gallery
- [ ] Photo capture from camera
- [ ] Gender selection
- [ ] AI image generation
- [ ] Generation progress display
- [ ] Generated image preview
- [ ] Image save to gallery
- [ ] Image share
- [ ] Image delete
- [ ] Favorites add/remove
- [ ] Gallery view
- [ ] Profile view
- [ ] Settings management
- [ ] Theme switching
- [ ] Language switching
- [ ] Subscription purchase
- [ ] Subscription management
- [ ] Restore purchases
- [ ] Sign out

**2. UI/UX Testing**

- [ ] All screens render correctly
- [ ] Navigation flows smoothly
- [ ] Buttons are responsive
- [ ] Loading states display properly
- [ ] Error messages are clear
- [ ] Success messages show
- [ ] Images load properly
- [ ] Animations are smooth
- [ ] No UI glitches
- [ ] Layout works on all screen sizes
- [ ] Safe area insets correct
- [ ] Status bar color appropriate
- [ ] Dark mode looks good
- [ ] Light mode looks good
- [ ] All text is readable
- [ ] Icons are correct
- [ ] Colors are consistent

**3. Performance Testing**

- [ ] App launches in < 3 seconds
- [ ] Screen transitions are smooth (60fps)
- [ ] FlatLists scroll smoothly
- [ ] Images load within 2 seconds
- [ ] AI generation completes in 60 seconds
- [ ] No memory leaks after 30 minutes use
- [ ] Battery usage is reasonable
- [ ] Network requests don't timeout
- [ ] Offline handling works
- [ ] Background/foreground transitions work

**4. Security Testing**

- [ ] API keys not exposed in code
- [ ] User data encrypted
- [ ] Authentication tokens secure
- [ ] Password requirements enforced
- [ ] Email validation works
- [ ] Input sanitization working
- [ ] SQL injection prevented
- [ ] XSS prevention working
- [ ] File upload validation
- [ ] Image size limits enforced

**5. Error Handling**

- [ ] Network errors handled gracefully
- [ ] API errors show user-friendly messages
- [ ] Validation errors are clear
- [ ] Image upload errors handled
- [ ] Generation errors handled
- [ ] Payment errors handled
- [ ] No unhandled promise rejections
- [ ] No unhandled exceptions
- [ ] App doesn't crash on errors
- [ ] Error logging works (Sentry)

**6. Device Testing**

Test on:
- [ ] iPhone 15 Pro Max (latest)
- [ ] iPhone 13 (common)
- [ ] iPhone SE (small screen)
- [ ] iPad Pro 12.9" (tablet)
- [ ] iPad Mini (small tablet)

iOS Versions:
- [ ] iOS 17.x (latest)
- [ ] iOS 16.x
- [ ] iOS 15.x (minimum supported)

**7. Edge Cases**

- [ ] Poor network connectivity
- [ ] No network connectivity
- [ ] Background app refresh
- [ ] Interrupted generation (app backgrounded)
- [ ] Low storage space
- [ ] Low memory
- [ ] First time user experience
- [ ] Returning user experience
- [ ] Multiple rapid taps
- [ ] Very long text inputs
- [ ] Special characters in inputs
- [ ] Empty states
- [ ] Maximum limits (e.g., 100 favorites)

**8. Accessibility**

- [ ] VoiceOver works on all screens
- [ ] Dynamic Type supported
- [ ] Contrast ratios meet WCAG
- [ ] Touch targets are 44x44pt minimum
- [ ] Accessibility labels present
- [ ] Accessibility hints helpful
- [ ] Screen reader announcements correct

**9. Localization**

- [ ] All strings translated
- [ ] No missing translations
- [ ] Layout works with longer text
- [ ] Date formatting correct per locale
- [ ] Number formatting correct
- [ ] Currency formatting correct

**10. App Store Compliance**

- [ ] Privacy manifest included
- [ ] Privacy policy accessible
- [ ] Terms of service accessible
- [ ] Age rating appropriate
- [ ] Content guidelines met
- [ ] No broken links
- [ ] Support email works
- [ ] Test account works

**Bug Report Template:**

For any bugs found:
```markdown
## Bug Report

**Title:** Brief description

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happened

**Screenshots/Videos:**
Attach if relevant

**Environment:**
- Device: iPhone 15 Pro
- iOS Version: 17.2
- App Version: 1.0.0
- Build Number: 16

**Additional Notes:**
Any other relevant information
```

**Kabul Kriterleri:**
- [ ] All functional tests pass
- [ ] No critical bugs
- [ ] All high-priority bugs fixed
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Tested on multiple devices
- [ ] Accessibility verified
- [ ] Localization verified
- [ ] App Store compliance verified
```

---

## 📊 ÖZET VE TAKİP

### Sprint Özeti

```
Sprint 1 (Hafta 1): Acil Düzeltmeler
├── TypeScript/ESLint hataları düzelt
├── Dependencies minor updates
└── PaywallViewModel oluştur

Sprint 2 (Hafta 2): Test Coverage
├── ViewModel testleri (5 adet)
├── Use Case testleri (5 adet)
└── Service testleri (3 adet)

Sprint 3 (Hafta 3-4): ViewModel'ler
├── Öncelikli 5 ViewModel (Hafta 3)
└── İkincil 5 ViewModel (Hafta 4)

Sprint 4 (Hafta 5-6): Performance & Error Tracking
├── Sentry entegrasyonu
├── Bundle size optimization
├── Memory leak fixes
└── Render performance

Sprint 5 (Hafta 7): Major Dependencies
└── React Native 0.81 → 0.83 update

Sprint 6 (Hafta 8): CI/CD
├── GitHub Actions CI
├── EAS Build workflow
└── Release automation

Sprint 7 (Hafta 9): Dark Mode & i18n
├── Dark mode implementation
└── Turkish localization

Sprint 8 (Hafta 10): Final Polishing
├── App Store assets
├── Comprehensive QA
└── Bug fixes
```

### İlerleme Takibi

Create: PROGRESS_TRACKER.md
```markdown
# MonzieAI - İlerleme Takip Tablosu

## Sprint 1: Acil Düzeltmeler
- [ ] Görev 1.1.1: AuthScreen require() fix
- [ ] Görev 1.1.2: falAIService type errors
- [ ] Görev 1.1.3: ESLint plugin
- [ ] Görev 1.1.4: Unnecessary catch
- [ ] Görev 1.1.5: Unused variables
- [ ] Görev 1.1.6: 'any' types
- [ ] Görev 1.2.1: Dependencies update
- [ ] Görev 1.3.1: PaywallViewModel

## Sprint 2: Test Coverage
- [ ] Görev 2.1.1: GeneratingViewModel test
- [ ] Görev 2.1.2: SceneDetailViewModel test
- [ ] Görev 2.1.3: AuthViewModel test
- [ ] Görev 2.2.1: GetImagesUseCase test
- [ ] Görev 2.2.2: GetTrendingImagesUseCase test
- [ ] Görev 2.2.3: Remaining UseCase tests
- [ ] Görev 2.3.1: revenueCatService test
- [ ] Görev 2.3.2: imageGenerationService test
- [ ] Görev 2.3.3: analyticsService test

## Sprint 3: ViewModel'ler
- [ ] Görev 3.1.1: EnhanceViewModel
- [ ] Görev 3.1.2: PhotoUploadViewModel
- [ ] Görev 3.1.3: OnboardingViewModel
- [ ] Görev 3.1.4: PrivacySettingsViewModel
- [ ] Görev 3.1.5: ChangePasswordViewModel
- [ ] Görev 3.2.1: 5 İkincil ViewModel

## Sprint 4: Performance
- [ ] Görev 4.1.1: Sentry setup
- [ ] Görev 4.2.1: Bundle size analysis
- [ ] Görev 4.2.2: Memory leak detection
- [ ] Görev 4.2.3: Render performance

## Sprint 5: Dependencies
- [ ] Görev 5.1.1: React & React Native update

## Sprint 6: CI/CD
- [ ] Görev 6.1.1: CI pipeline

## Sprint 7: Dark Mode & i18n
- [ ] Görev 7.1.1: Theme system
- [ ] Görev 7.2.1: i18n setup

## Sprint 8: Final
- [ ] Görev 8.1.1: App Store assets
- [ ] Görev 8.2.1: Final QA

## Sağlık Skoru İlerlemesi
- Başlangıç: 84/100
- Hedef: 96-98/100

Sprint tamamlandıkça güncelle:
- Sprint 1 sonrası: 87/100 (Tahmin)
- Sprint 2 sonrası: 89/100 (Tahmin)
- Sprint 3 sonrası: 92/100 (Tahmin)
- Sprint 4 sonrası: 93/100 (Tahmin)
- Sprint 5 sonrası: 94/100 (Tahmin)
- Sprint 6 sonrası: 95/100 (Tahmin)
- Sprint 7 sonrası: 96/100 (Tahmin)
- Sprint 8 sonrası: 97-98/100 (Hedef)
```

---

## 🎯 ÖNCELİK SIRALAMASI

### Hemen Başlanmalı (Bu Hafta)
1. ✅ TypeScript/ESLint hatalarını düzelt
2. ✅ Dependencies minor updates
3. ✅ PaywallViewModel oluştur

### Öncelikli (Bu Ay)
4. ✅ Test coverage artır
5. ✅ Kalan kritik ViewModel'ler
6. ✅ Error tracking (Sentry)

### Gelecek (2-3 Ay)
7. 🟡 Performance optimizations
8. 🟡 Major dependencies updates
9. 🟡 CI/CD pipeline
10. 🟡 Dark mode & i18n

---

## 📝 NOTLAR

### Geliştirme İpuçları
- Her sprint başında öncelik gözden geçir
- Her görev için ayrı branch oluştur
- Code review zorunlu
- Test coverage düşmesin
- Documentation güncel tut

### Kod Review Checklist
- [ ] MVVM pattern uygulanmış
- [ ] Type safety korunmuş
- [ ] Tests yazılmış
- [ ] Documentation güncellenmiş
- [ ] Performance regresyon yok
- [ ] Breaking change yok

### Release Checklist
- [ ] Tüm testler geçiyor
- [ ] Performance kabul edilebilir
- [ ] Security review yapıldı
- [ ] Documentation tamamlandı
- [ ] App Store assets hazır
- [ ] Release notes yazıldı

---

**Oluşturan:** AI Assistant  
**Tarih:** 2025-01-27  
**Versiyon:** 1.0  
**Son Güncelleme:** 2025-01-27

---

## 🚀 BAŞARILAR!

Bu eylem planı tamamlandığında MonzieAI:
- ✅ Production-ready olacak
- ✅ 96-98/100 sağlık skoruna ulaşacak
- ✅ App Store'da yayınlanabilir durumda olacak
- ✅ Ölçeklenebilir ve sürdürülebilir olacak
- ✅ Modern best practices uygulayacak

İyi çalışmalar! 🎉