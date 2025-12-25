# 📊 Analytics Guide

This guide explains how to use the analytics service in the MonzieAI app.

## Overview

The analytics service provides event tracking capabilities. Currently, it logs to console in development mode. It can be extended to integrate with Firebase Analytics, Mixpanel, or other analytics providers.

## Usage

### Basic Event Tracking

```typescript
import { analyticsService } from '../services/analyticsService';

// Track a custom event
analyticsService.track({
  name: 'image_generated',
  properties: {
    scene_id: 'professional-portrait',
    generation_time: 1234,
  },
});
```

### Screen View Tracking

```typescript
import { analyticsService } from '../services/analyticsService';
import { useEffect } from 'react';

function HomeScreen() {
  useEffect(() => {
    analyticsService.trackScreenView('Home', {
      user_type: 'premium',
    });
  }, []);
  
  // ... component code ...
}
```

### User Action Tracking

```typescript
import { analyticsService } from '../services/analyticsService';

function handleImageLike(imageId: string) {
  analyticsService.trackAction('image_liked', {
    image_id: imageId,
    source: 'gallery',
  });
}
```

### Set User ID

```typescript
import { analyticsService } from '../services/analyticsService';

// When user logs in
analyticsService.setUserId(user.id);

// When user logs out
analyticsService.setUserId(null);
```

## Common Events

### Authentication Events

```typescript
// User signed in
analyticsService.track({
  name: 'user_signed_in',
  properties: {
    method: 'email', // or 'google', 'apple'
  },
});

// User signed out
analyticsService.track({ name: 'user_signed_out' });
```

### Image Generation Events

```typescript
// Image generation started
analyticsService.track({
  name: 'image_generation_started',
  properties: {
    scene_id: scene.id,
    scene_name: scene.name,
  },
});

// Image generation completed
analyticsService.track({
  name: 'image_generation_completed',
  properties: {
    scene_id: scene.id,
    duration: 1234,
    success: true,
  },
});
```

### Subscription Events

```typescript
// Subscription purchased
analyticsService.track({
  name: 'subscription_purchased',
  properties: {
    plan_type: 'monthly', // or 'yearly'
    price: 9.99,
  },
});
```

## Integration with Firebase Analytics

To integrate with Firebase Analytics, update `analyticsService.ts`:

```typescript
import analytics from '@react-native-firebase/analytics';

class AnalyticsService {
  track(event: AnalyticsEvent): void {
    // ... existing code ...
    
    // Send to Firebase Analytics
    analytics().logEvent(event.name, event.properties);
  }
}
```

## Best Practices

1. **Use consistent event names** - `snake_case` recommended
2. **Include relevant properties** - But avoid PII (Personally Identifiable Information)
3. **Track key user actions** - Sign in, purchases, image generation
4. **Don't over-track** - Focus on meaningful events
5. **Test in development** - Verify events are logged correctly

## Privacy Considerations

- **Don't track PII** - No emails, names, or personal data
- **Respect user privacy** - Allow users to opt-out if required
- **Follow GDPR/CCPA** - If applicable to your region
- **Anonymize data** - Use user IDs, not personal identifiers

## Event Naming Convention

- Use `snake_case` for event names
- Be descriptive: `image_generated` not `event1`
- Use consistent prefixes: `user_`, `image_`, `subscription_`

## Resources

- [Firebase Analytics](https://firebase.google.com/docs/analytics)
- [Mixpanel](https://mixpanel.com/)
- [Amplitude](https://amplitude.com/)

