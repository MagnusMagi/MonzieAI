# ⚡ Performance Monitoring Guide

This guide explains how to use the performance monitoring utilities in the MonzieAI app.

## Overview

The performance monitoring system allows you to track and measure performance metrics throughout the app, helping identify bottlenecks and optimize performance.

## Usage

### Basic Usage

```typescript
import { performanceMonitor } from '../utils/performanceMonitor';

// Start tracking
performanceMonitor.start('image-generation');

// ... do work ...

// End tracking
performanceMonitor.end('image-generation');
// Logs: "Performance: image-generation took 1234.56ms"
```

### Using Decorator

```typescript
import { measurePerformance } from '../utils/performanceMonitor';

class ImageService {
  @measurePerformance('generateImage')
  async generateImage(prompt: string) {
    // ... image generation logic ...
  }
}
```

### Get All Metrics

```typescript
import { performanceMonitor } from '../utils/performanceMonitor';

const metrics = performanceMonitor.getMetrics();
console.log(metrics);
// [
//   { name: 'image-generation', startTime: 1000, endTime: 2234, duration: 1234 },
//   ...
// ]
```

### Enable/Disable

```typescript
import { performanceMonitor } from '../utils/performanceMonitor';

// Disable in production (if needed)
performanceMonitor.setEnabled(false);

// Re-enable
performanceMonitor.setEnabled(true);
```

## Integration with React DevTools

Performance monitoring works alongside React DevTools Profiler:

1. Open React DevTools
2. Go to Profiler tab
3. Record a session
4. Check performance monitor logs in console

## Best Practices

1. **Track critical operations** - Image generation, API calls, heavy computations
2. **Use descriptive names** - `image-generation` not `task1`
3. **Clean up metrics** - Call `clear()` periodically if needed
4. **Monitor in development** - Disable in production for performance
5. **Set thresholds** - Alert if operations take too long

## Example: Image Generation

```typescript
import { performanceMonitor } from '../utils/performanceMonitor';

async function generateImage(prompt: string) {
  performanceMonitor.start('image-generation');
  
  try {
    const result = await falAIService.generate(prompt);
    performanceMonitor.end('image-generation');
    return result;
  } catch (error) {
    performanceMonitor.end('image-generation');
    throw error;
  }
}
```

## Example: Screen Load Time

```typescript
import { useEffect } from 'react';
import { performanceMonitor } from '../utils/performanceMonitor';

function HomeScreen() {
  useEffect(() => {
    performanceMonitor.start('home-screen-load');
    
    return () => {
      performanceMonitor.end('home-screen-load');
    };
  }, []);
  
  // ... component code ...
}
```

## Metrics to Track

- Screen load times
- API response times
- Image generation duration
- Image loading times
- Navigation transitions
- Heavy computations

## Resources

- [React DevTools Profiler](https://react.dev/learn/react-developer-tools#profiler)
- [Flipper Performance Plugin](https://fbflipper.com/docs/getting-started/react-native/)

