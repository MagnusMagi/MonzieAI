# 📊 Test Coverage Improvement Plan

Current coverage: ~70%  
Target coverage: 80%+

## Coverage Analysis

### Well Covered Areas ✅
- Domain entities (Scene, Image, User)
- Use cases (GetScenesUseCase, GenerateImageUseCase, etc.)
- Repositories (ImageRepository, SceneRepository)
- ViewModels (HomeViewModel, GalleryViewModel)
- Services (databaseService, sceneService)

### Areas Needing Coverage ⚠️

#### 1. Screens (Priority: High)
- [ ] `HomeScreen.tsx` - Main screen with scene selection
- [ ] `GalleryScreen.tsx` - Image gallery with search
- [ ] `GeneratingScreen.tsx` - Image generation progress
- [ ] `GeneratedScreen.tsx` - Generated image display
- [ ] `AuthScreen.tsx` - Authentication flow
- [ ] `ProfileScreen.tsx` - User profile
- [ ] `SettingsScreen.tsx` - App settings

#### 2. Services (Priority: Medium)
- [ ] `falAIService.ts` - AI image generation
- [ ] `imageGenerationService.ts` - Image generation orchestration
- [ ] `storageService.ts` - File storage operations
- [ ] `notificationService.ts` - Push notifications
- [ ] `errorLoggingService.ts` - Error logging

#### 3. Utilities (Priority: Medium)
- [ ] `imageOptimization.ts` - Image optimization utilities
- [ ] `retry.ts` - Retry mechanism
- [ ] `dynamicType.ts` - Dynamic Type utilities
- [ ] `performanceMonitor.ts` - Performance monitoring

#### 4. Hooks (Priority: Low)
- [ ] `useFadeIn.ts` - Fade-in animation hook
- [ ] `useImages.ts` - Images hook
- [ ] `useRealtimeImage.ts` - Real-time image updates
- [ ] `useScenes.ts` - Scenes hook

## Implementation Plan

### Phase 1: Critical Screens (Week 1)
1. Write tests for `HomeScreen`
2. Write tests for `GalleryScreen`
3. Write tests for `AuthScreen`

### Phase 2: Services (Week 2)
1. Write tests for `falAIService`
2. Write tests for `imageGenerationService`
3. Write tests for `storageService`

### Phase 3: Utilities & Hooks (Week 3)
1. Write tests for utility functions
2. Write tests for custom hooks
3. Increase overall coverage to 80%+

## Test Writing Guidelines

### Screen Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';

describe('HomeScreen', () => {
  it('renders correctly', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Home')).toBeTruthy();
  });

  it('handles scene selection', () => {
    // Test scene selection logic
  });
});
```

### Service Tests
```typescript
import { falAIService } from '../services/falAIService';

describe('falAIService', () => {
  it('generates image successfully', async () => {
    // Mock API call
    // Test image generation
  });
});
```

### Utility Tests
```typescript
import { getScaledFontSize } from '../utils/dynamicType';

describe('getScaledFontSize', () => {
  it('returns scaled font size', () => {
    const size = getScaledFontSize(16);
    expect(size).toBeGreaterThanOrEqual(16);
  });
});
```

## Coverage Goals

- **Overall**: 80%+
- **Screens**: 70%+
- **Services**: 85%+
- **Utilities**: 90%+
- **Hooks**: 75%+

## Running Coverage

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## Resources

- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

