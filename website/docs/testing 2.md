---
sidebar_position: 11
title: Testing
---

# MonzieAI - Testing Guide

## 📋 Table of Contents

1. [Testing Overview](#testing-overview)
2. [Testing Strategy](#testing-strategy)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [E2E Testing](#e2e-testing)
6. [Component Testing](#component-testing)
7. [API Testing](#api-testing)
8. [Performance Testing](#performance-testing)
9. [Test Coverage](#test-coverage)
10. [Best Practices](#best-practices)

## 🎯 Testing Overview

MonzieAI follows a comprehensive testing approach to ensure code quality, reliability, and maintainability.

### Testing Pyramid

```
           ╱╲
          ╱  ╲       E2E Tests (5%)
         ╱    ╲      - Full user flows
        ╱──────╲     - Critical paths
       ╱        ╲    
      ╱          ╲   Integration Tests (15%)
     ╱            ╲  - Service integration
    ╱──────────────╲ - API integration
   ╱                ╲
  ╱                  ╲ Unit Tests (80%)
 ╱                    ╲ - Functions, utilities
╱──────────────────────╲ - Components, hooks
```

### Test Stack

- **Framework**: Jest 30.0.0
- **React Testing**: @testing-library/react-native
- **E2E**: Maestro
- **Mocking**: Jest mocks
- **Coverage**: Jest coverage reports
- **CI/CD**: GitHub Actions

### Coverage Goals

| Type | Target | Current |
|------|--------|---------|
| Statements | 80% | 75% |
| Branches | 75% | 70% |
| Functions | 80% | 72% |
| Lines | 80% | 75% |

## 🏗️ Testing Strategy

### What to Test

✅ **Do Test:**
- Business logic
- Data transformations
- API integrations
- User interactions
- Error handling
- Edge cases
- Critical user paths

❌ **Don't Test:**
- Third-party libraries
- Framework internals
- Simple getters/setters
- UI styling (use visual testing)

### Test Levels

```
1. Unit Tests
   └─ Individual functions, components, utilities
   
2. Integration Tests
   └─ Service interactions, API calls, database operations
   
3. E2E Tests
   └─ Full user workflows, critical business scenarios
   
4. Performance Tests
   └─ Load testing, stress testing, memory profiling
```

## 🧪 Unit Testing

### Setup

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Single file
npm test -- ImageService.test.ts
```

### Configuration

**jest.config.js**:
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.styles.ts',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo|@expo|@supabase)',
  ],
};
```

### Testing Services

**Example: imageGenerationService.test.ts**

```typescript
import { imageGenerationService } from '@/services/imageGenerationService';
import { falAIService } from '@/services/falAIService';
import { storageService } from '@/services/storageService';
import { databaseService } from '@/services/databaseService';

// Mock dependencies
jest.mock('@/services/falAIService');
jest.mock('@/services/storageService');
jest.mock('@/services/databaseService');

describe('ImageGenerationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generate', () => {
    const mockParams = {
      userId: 'test-user-id',
      sceneId: 'test-scene-id',
      photoUri: 'test-photo.jpg',
      gender: 'male' as const,
    };

    it('should generate image successfully', async () => {
      // Arrange
      const mockScene = {
        id: 'test-scene-id',
        name: 'Test Scene',
        prompt_template: 'A {gender} portrait',
        negative_prompt: null,
      };

      const mockAIResult = {
        imageUrl: 'https://generated-image.jpg',
        seed: 123456,
        hasNsfwConcepts: [false],
        timings: { inference: 45.2 },
      };

      (databaseService.getById as jest.Mock).mockResolvedValue(mockScene);
      (storageService.uploadFromUri as jest.Mock).mockResolvedValue(
        'https://uploaded-photo.jpg'
      );
      (falAIService.generate as jest.Mock).mockResolvedValue(mockAIResult);
      (storageService.uploadFromUrl as jest.Mock).mockResolvedValue(
        'https://stored-image.jpg'
      );
      (databaseService.insert as jest.Mock).mockResolvedValue({
        id: 'generated-id',
        created_at: new Date().toISOString(),
      });

      // Act
      const result = await imageGenerationService.generate(mockParams);

      // Assert
      expect(result).toBeDefined();
      expect(result.imageUrl).toBe('https://stored-image.jpg');
      expect(result.generationTime).toBeGreaterThan(0);
      expect(falAIService.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining('male'),
        })
      );
    });

    it('should throw error when scene not found', async () => {
      // Arrange
      (databaseService.getById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        imageGenerationService.generate(mockParams)
      ).rejects.toThrow('Scene not found');
    });

    it('should handle FAL.AI errors gracefully', async () => {
      // Arrange
      (databaseService.getById as jest.Mock).mockResolvedValue({
        id: 'test-scene-id',
        prompt_template: 'Test {gender}',
      });
      (falAIService.generate as jest.Mock).mockRejectedValue(
        new Error('AI service error')
      );

      // Act & Assert
      await expect(
        imageGenerationService.generate(mockParams)
      ).rejects.toThrow('AI service error');
    });
  });
});
```

### Testing Utilities

**Example: formatDate.test.ts**

```typescript
import { formatDate, formatRelativeTime } from '@/utils/dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDate(date)).toBe('Jan 15, 2024');
    });

    it('should handle invalid date', () => {
      expect(formatDate(null)).toBe('Invalid Date');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T10:30:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "just now" for recent times', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('just now');
    });

    it('should return minutes ago', () => {
      const fiveMinutesAgo = new Date('2024-01-15T10:25:00Z');
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
    });

    it('should return hours ago', () => {
      const twoHoursAgo = new Date('2024-01-15T08:30:00Z');
      expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago');
    });
  });
});
```

## 🔗 Integration Testing

### Testing API Integration

**Example: sceneService.integration.test.ts**

```typescript
import { sceneService } from '@/services/sceneService';
import { databaseService } from '@/services/databaseService';

describe('SceneService Integration', () => {
  // Use real database connection (test database)
  beforeAll(async () => {
    // Setup test database
    await setupTestDatabase();
  });

  afterAll(async () => {
    // Cleanup test database
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // Reset data before each test
    await resetTestData();
  });

  it('should fetch and cache scenes', async () => {
    // First call - from database
    const scenes1 = await sceneService.getScenes();
    expect(scenes1).toHaveLength(5);

    // Second call - from cache
    const scenes2 = await sceneService.getScenes();
    expect(scenes2).toEqual(scenes1);

    // Verify only one database call was made
    const calls = jest.spyOn(databaseService, 'query');
    expect(calls).toHaveBeenCalledTimes(1);
  });

  it('should filter scenes by category', async () => {
    const portraitScenes = await sceneService.getScenesByCategory('portrait');
    
    expect(portraitScenes).toHaveLength(3);
    expect(portraitScenes.every(s => s.category === 'portrait')).toBe(true);
  });

  it('should handle database errors', async () => {
    // Simulate database connection error
    jest.spyOn(databaseService, 'query').mockRejectedValue(
      new Error('Connection failed')
    );

    await expect(sceneService.getScenes()).rejects.toThrow(
      'Connection failed'
    );
  });
});
```

## 🎭 Component Testing

### Testing React Components

**Example: Button.test.tsx**

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('should render with title', () => {
    const { getByText } = render(<Button title="Click Me" onPress={() => {}} />);
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Click Me" onPress={onPress} />);
    
    fireEvent.press(getByText('Click Me'));
    
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Click Me" onPress={onPress} disabled={true} />
    );
    
    const button = getByText('Click Me');
    fireEvent.press(button);
    
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should render loading state', () => {
    const { getByTestId } = render(
      <Button title="Click Me" onPress={() => {}} loading={true} />
    );
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});
```

### Testing Screens

**Example: HomeScreen.test.tsx**

```typescript
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '@/screens/HomeScreen';
import { sceneService } from '@/services/sceneService';

jest.mock('@/services/sceneService');

describe('HomeScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    const { getByTestId } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );
    
    expect(getByTestId('loading-skeleton')).toBeTruthy();
  });

  it('should display scenes after loading', async () => {
    const mockScenes = [
      { id: '1', name: 'Scene 1', category: 'portrait' },
      { id: '2', name: 'Scene 2', category: 'outdoor' },
    ];

    (sceneService.getScenes as jest.Mock).mockResolvedValue(mockScenes);

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText('Scene 1')).toBeTruthy();
      expect(getByText('Scene 2')).toBeTruthy();
    });
  });

  it('should navigate to scene detail on press', async () => {
    const mockScenes = [
      { id: '1', name: 'Scene 1', category: 'portrait' },
    ];

    (sceneService.getScenes as jest.Mock).mockResolvedValue(mockScenes);

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      fireEvent.press(getByText('Scene 1'));
    });

    expect(mockNavigation.navigate).toHaveBeenCalledWith('SceneDetail', {
      sceneId: '1',
    });
  });
});
```

### Testing Hooks

**Example: useAuth.test.ts**

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase');

describe('useAuth', () => {
  it('should initialize with null user', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
  });

  it('should sign in successfully', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });

    expect(result.current.user).toEqual(mockUser);
  });

  it('should handle sign in error', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' },
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await expect(
        result.current.signIn('test@example.com', 'wrong')
      ).rejects.toThrow('Invalid credentials');
    });

    expect(result.current.user).toBeNull();
  });
});
```

## 🤖 E2E Testing

### Maestro Setup

**Installation**:
```bash
# Install Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Verify installation
maestro --version
```

### E2E Test Examples

**.maestro/auth-flow.yaml**:
```yaml
appId: com.someplanets.monzieaiv2
---
- launchApp
- tapOn: "Get Started"
- tapOn: "Continue with Email"
- inputText: "test@example.com"
- tapOn: "Password"
- inputText: "password123"
- tapOn: "Sign In"
- assertVisible: "Welcome back"
- assertVisible: "Home"
```

**.maestro/image-generation.yaml**:
```yaml
appId: com.someplanets.monzieaiv2
---
# Prerequisites: User must be logged in
- launchApp
- assertVisible: "Home"

# Navigate to scene selection
- tapOn: "Generate New Image"
- assertVisible: "Choose a Scene"

# Select a scene
- tapOn: "Professional Portrait"
- assertVisible: "Scene Details"
- tapOn: "Try This Scene"

# Upload photo
- assertVisible: "Upload Photo"
- tapOn: "Choose from Gallery"
# Select first photo from gallery
- tapOn:
    point: "50%,30%"
- tapOn: "Continue"

# Wait for generation
- assertVisible: "Creating your AI art"
- waitForAnimationToEnd:
    timeout: 60000

# Verify result
- assertVisible: "Generated Image"
- assertVisible: "Save"
- assertVisible: "Share"
```

**.maestro/premium-flow.yaml**:
```yaml
appId: com.someplanets.monzieaiv2
---
- launchApp
- tapOn: "Profile"
- tapOn: "Upgrade to Premium"
- assertVisible: "Unlock Premium"
- assertVisible: "Monthly"
- assertVisible: "Annual"
- tapOn: "Monthly"
- assertVisible: "$29.99"
# Note: Actual purchase testing requires sandbox account
```

### Running E2E Tests

```bash
# Run all tests
npm run test:e2e

# Run specific test
maestro test .maestro/auth-flow.yaml

# Run on specific device
maestro test --device iPhone-15-Pro .maestro/auth-flow.yaml

# Record test
maestro record .maestro/new-test.yaml

# Debug mode
maestro test --debug .maestro/auth-flow.yaml
```

## 🌐 API Testing

### Manual API Testing

**test-api.http** (use with REST Client extension):
```http
### Get Scenes
GET https://groguatbjerebweinuef.supabase.co/rest/v1/scenes
Authorization: Bearer YOUR_SUPABASE_KEY
apikey: YOUR_SUPABASE_KEY

### Create Generated Image
POST https://groguatbjerebweinuef.supabase.co/rest/v1/generated_images
Authorization: Bearer YOUR_USER_TOKEN
apikey: YOUR_SUPABASE_KEY
Content-Type: application/json

{
  "user_id": "test-user-id",
  "scene_id": "scene-id",
  "image_url": "https://example.com/image.jpg",
  "prompt": "Test prompt"
}

### Get User Images
GET https://groguatbjerebweinuef.supabase.co/rest/v1/generated_images?user_id=eq.test-user-id
Authorization: Bearer YOUR_USER_TOKEN
apikey: YOUR_SUPABASE_KEY
```

### Automated API Testing

```typescript
import { databaseService } from '@/services/databaseService';

describe('Supabase API', () => {
  it('should authenticate user', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password',
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
  });

  it('should fetch scenes', async () => {
    const scenes = await databaseService.query('scenes', {
      filters: { is_active: true },
    });

    expect(scenes.length).toBeGreaterThan(0);
    expect(scenes[0]).toHaveProperty('name');
    expect(scenes[0]).toHaveProperty('prompt_template');
  });

  it('should respect RLS policies', async () => {
    // Try to access another user's images
    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('user_id', 'another-user-id');

    // Should return empty or error depending on RLS config
    expect(data).toEqual([]);
  });
});
```

## ⚡ Performance Testing

### Load Testing

```typescript
describe('Performance Tests', () => {
  it('should handle multiple concurrent requests', async () => {
    const promises = Array(10)
      .fill(null)
      .map(() => sceneService.getScenes());

    const startTime = Date.now();
    const results = await Promise.all(promises);
    const endTime = Date.now();

    expect(results).toHaveLength(10);
    expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
  });

  it('should cache scenes efficiently', async () => {
    // First call
    const start1 = Date.now();
    await sceneService.getScenes();
    const time1 = Date.now() - start1;

    // Second call (cached)
    const start2 = Date.now();
    await sceneService.getScenes();
    const time2 = Date.now() - start2;

    // Cached call should be significantly faster
    expect(time2).toBeLessThan(time1 * 0.1);
  });
});
```

### Memory Testing

```typescript
describe('Memory Tests', () => {
  it('should not leak memory on component mount/unmount', () => {
    const { unmount } = render(<HomeScreen />);
    
    const initialMemory = (performance as any).memory?.usedJSHeapSize;
    
    // Mount and unmount 100 times
    for (let i = 0; i < 100; i++) {
      const { unmount: unmountInstance } = render(<HomeScreen />);
      unmountInstance();
    }

    const finalMemory = (performance as any).memory?.usedJSHeapSize;
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be minimal (< 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});
```

## 📊 Test Coverage

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

### Coverage Configuration

**jest.config.js**:
```javascript
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.styles.ts',
    '!src/**/__tests__/**',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
    './src/services/': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
  },
};
```

### Coverage Reports

```bash
# Text summary
npm run test:coverage

# Detailed HTML report
npm run test:coverage -- --coverageReporters=html

# JSON for CI/CD
npm run test:coverage -- --coverageReporters=json

# Upload to Codecov
bash <(curl -s https://codecov.io/bash)
```

## ✅ Best Practices

### Writing Good Tests

#### 1. AAA Pattern (Arrange, Act, Assert)

```typescript
it('should do something', () => {
  // Arrange: Setup test data
  const input = 'test';
  const expected = 'TEST';

  // Act: Execute the code
  const result = toUpperCase(input);

  // Assert: Verify the result
  expect(result).toBe(expected);
});
```

#### 2. Test Naming

```typescript
// ✅ Good: Descriptive, clear intent
it('should return uppercase string when given lowercase input', () => {});
it('should throw error when input is null', () => {});
it('should call onPress callback when button is pressed', () => {});

// ❌ Bad: Vague, unclear
it('works', () => {});
it('test function', () => {});
it('should do stuff', () => {});
```

#### 3. One Assertion Per Test

```typescript
// ✅ Good: Single responsibility
it('should return user with correct id', () => {
  const user = getUser('123');
  expect(user.id).toBe('123');
});

it('should return user with correct email', () => {
  const user = getUser('123');
  expect(user.email).toBe('test@example.com');
});

// ❌ Bad: Multiple assertions
it('should return correct user', () => {
  const user = getUser('123');
  expect(user.id).toBe('123');
  expect(user.email).toBe('test@example.com');
  expect(user.name).toBe('Test User');
  // If first assertion fails, we don't know about others
});
```

#### 4. Mock External Dependencies

```typescript
// ✅ Good: Mock external services
jest.mock('@/services/apiService');

it('should fetch data', async () => {
  (apiService.get as jest.Mock).mockResolvedValue({ data: 'test' });
  const result = await fetchData();
  expect(result).toEqual({ data: 'test' });
});

// ❌ Bad: Real API calls in tests
it('should fetch data', async () => {
  const result = await fetch('https://api.example.com/data');
  // Slow, unreliable, requires network
});
```

#### 5. Test Edge Cases

```typescript
describe('divideNumbers', () => {
  it('should divide positive numbers', () => {
    expect(divideNumbers(10, 2)).toBe(5);
  });

  it('should divide negative numbers', () => {
    expect(divideNumbers(-10, 2)).toBe(-5);
  });

  it('should handle zero numerator', () => {
    expect(divideNumbers(0, 5)).toBe(0);
  });

  it('should throw error for zero denominator', () => {
    expect(() => divideNumbers(10, 0)).toThrow('Division by zero');
  });

  it('should handle decimal results', () => {
    expect(divideNumbers(10, 3)).toBeCloseTo(3.33, 2);
  });
});
```

### Test Organization

```
src/
├── services/
│   ├── imageGenerationService.ts
│   └── __tests__/
│       ├── imageGenerationService.test.ts
│       └── imageGenerationService.integration.test.ts
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx
│   └── Card/
│       ├── Card.tsx
│       └── Card.test.tsx
└── utils/
    ├── dateUtils.ts
    └── __tests__/
        └── dateUtils.test.ts
```

### CI/CD Integration

**.github/workflows/test.yml**:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20.x'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
      
      - name: Check coverage threshold
        run: |
          npm run test:coverage -- --coverageThreshold='{"global":{"statements":80}}'
```

## 🎯 Testing Checklist

Before submitting PR, ensure:

- [ ] All tests pass
- [ ] Coverage meets thresholds (80%)
- [ ] No console errors or warnings
- [ ] Tests are descriptive and maintainable
- [ ] Edge cases are covered
- [ ] Mocks are properly cleaned up
- [ ] Integration tests pass
- [ ] E2E tests pass (if applicable)
- [ ] Performance tests pass (if applicable)
- [ ] Documentation is updated

## 📚 Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Maestro Documentation](https://maestro.mobile.dev/)

### Tools
- [Jest](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Maestro](https://maestro.mobile.dev/)
- [Codecov](https://codecov.io/)

### Best Practices
- [Testing Best Practices](https://testingjavascript.com/)
- [React Testing Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated**: 2024-01-15
**Coverage Target**: 80%
**Current Coverage**: 75%