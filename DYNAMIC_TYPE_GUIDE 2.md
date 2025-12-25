# 📱 Dynamic Type Support Guide

This guide explains how to use Dynamic Type support in the MonzieAI app for better accessibility.

## Overview

Dynamic Type support allows users to adjust text sizes according to their system preferences, improving accessibility for users with visual impairments.

## Usage

### Basic Usage

```typescript
import { getScaledFontSize } from '../utils/dynamicType';
import { Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  title: {
    fontSize: getScaledFontSize(24), // Base size 24, will scale with system settings
  },
  body: {
    fontSize: getScaledFontSize(16), // Base size 16
  },
});
```

### With Maximum Scale

```typescript
import { getScaledFontSize } from '../utils/dynamicType';

// Limit maximum scale to 1.3x (default)
const fontSize = getScaledFontSize(16, 1.3);

// Or allow up to 2x scaling
const largeFontSize = getScaledFontSize(20, 2.0);
```

### Scaled Spacing

```typescript
import { getScaledSpacing } from '../utils/dynamicType';

const styles = StyleSheet.create({
  container: {
    padding: getScaledSpacing(16), // Scales with font size
  },
});
```

### Check Font Scale

```typescript
import { getFontScale, hasIncreasedFontSize } from '../utils/dynamicType';

// Get current font scale (1.0 = default, >1.0 = increased)
const scale = getFontScale();

// Check if user has increased font size
if (hasIncreasedFontSize()) {
  // Adjust UI accordingly
}
```

## Best Practices

1. **Always use scaled font sizes** for user-facing text
2. **Set reasonable maximum scales** to prevent UI breaking
3. **Test with different font sizes** in iOS Settings > Display & Brightness > Text Size
4. **Consider spacing** - larger text may need more padding
5. **Test on both iOS and Android** - scaling behavior may differ

## Implementation Checklist

- [ ] Replace hardcoded font sizes with `getScaledFontSize()`
- [ ] Adjust spacing with `getScaledSpacing()` where needed
- [ ] Test with maximum font size settings
- [ ] Verify UI doesn't break with large text
- [ ] Test on both iOS and Android

## Examples

### Before (No Dynamic Type)

```typescript
const styles = StyleSheet.create({
  title: {
    fontSize: 24, // Fixed size
  },
});
```

### After (With Dynamic Type)

```typescript
import { getScaledFontSize } from '../utils/dynamicType';

const styles = StyleSheet.create({
  title: {
    fontSize: getScaledFontSize(24), // Scales with user preferences
  },
});
```

## Resources

- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [iOS Dynamic Type](https://developer.apple.com/documentation/uikit/uifont/scaling_fonts_automatically)
- [Android Font Scaling](https://developer.android.com/guide/topics/ui/look-and-feel/fonts-in-xml)

