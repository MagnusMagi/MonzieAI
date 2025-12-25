# 🎨 Image Generation Screen - Code Examples

## 1. Lottie Animation Integration

### Installation
```bash
npx expo install lottie-react-native
```

### Basic Usage
```typescript
import LottieView from 'lottie-react-native';
import { View, StyleSheet } from 'react-native';

export function GeneratingScreen() {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/animations/ai-processing.json')}
        autoPlay
        loop
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 200,
    height: 200,
  },
});
```

### With Progress
```typescript
import LottieView from 'lottie-react-native';
import { useRef, useEffect } from 'react';

export function GeneratingScreen({ progress }: { progress: number }) {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (progress === 100) {
      animationRef.current?.play(30, 60); // Play success animation
    }
  }, [progress]);

  return (
    <LottieView
      ref={animationRef}
      source={require('../assets/animations/ai-processing.json')}
      autoPlay
      loop
      progress={progress / 100}
    />
  );
}
```

---

## 2. React Native Reanimated - Animated Gradient

### Installation
```bash
npx expo install react-native-reanimated
```

### Animated Gradient Background
```typescript
import { useAnimatedStyle, withTiming, withRepeat } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';

export function GeneratingScreen() {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.5 + animatedValue.value * 0.5,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Content */}
    </Animated.View>
  );
}
```

### Smooth Progress Bar
```typescript
import { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { useEffect } from 'react';

export function ProgressBar({ progress }: { progress: number }) {
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withTiming(progress / 100, {
      duration: 500,
    });
  }, [progress]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value * 100}%`,
    };
  });

  return (
    <View style={styles.progressContainer}>
      <Animated.View style={[styles.progressFill, progressStyle]} />
    </View>
  );
}
```

---

## 3. Particle Effects

### Custom Particle System
```typescript
import { useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { View, StyleSheet } from 'react-native';

interface ParticleProps {
  delay: number;
  duration: number;
}

function Particle({ delay, duration }: ParticleProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    setTimeout(() => {
      translateY.value = withRepeat(
        withTiming(-500, { duration }),
        -1,
        false
      );
      opacity.value = withRepeat(
        withTiming(0, { duration }),
        -1,
        false
      );
    }, delay);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.particle, animatedStyle]} />
  );
}

export function ParticleBackground() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: i * 100,
    duration: 2000 + Math.random() * 1000,
  }));

  return (
    <View style={styles.container}>
      {particles.map(particle => (
        <Particle
          key={particle.id}
          delay={particle.delay}
          duration={particle.duration}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
});
```

---

## 4. Step-by-Step Progress

### Step Indicator Component
```typescript
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Step {
  id: string;
  label: string;
  icon: string;
  status: 'pending' | 'active' | 'completed';
}

export function StepIndicator({ steps, currentStep }: { steps: Step[], currentStep: number }) {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View key={step.id} style={styles.step}>
          <View
            style={[
              styles.stepIcon,
              index <= currentStep && styles.stepIconActive,
            ]}
          >
            <Ionicons
              name={step.icon as any}
              size={24}
              color={index <= currentStep ? '#fff' : '#999'}
            />
          </View>
          <Text
            style={[
              styles.stepLabel,
              index <= currentStep && styles.stepLabelActive,
            ]}
          >
            {step.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const steps: Step[] = [
  { id: '1', label: 'Preparing', icon: 'image-outline', status: 'pending' },
  { id: '2', label: 'Processing', icon: 'sparkles-outline', status: 'pending' },
  { id: '3', label: 'Enhancing', icon: 'brush-outline', status: 'pending' },
  { id: '4', label: 'Complete', icon: 'checkmark-circle-outline', status: 'pending' },
];
```

---

## 5. Haptic Feedback

### Installation
```bash
npx expo install expo-haptics
```

### Usage
```typescript
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';

export function GeneratingScreen({ progress }: { progress: number }) {
  useEffect(() => {
    if (progress === 25) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (progress === 50) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (progress === 75) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else if (progress === 100) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [progress]);
}
```

---

## 6. Shimmer Effect

### Custom Shimmer
```typescript
import { useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';

export function Shimmer({ children }: { children: React.ReactNode }) {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerValue.value * 300 }],
  }));

  return (
    <View style={styles.container}>
      {children}
      <Animated.View style={[styles.shimmer, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}
```

---

## 7. Complete Enhanced Screen

### Full Implementation Example
```typescript
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function EnhancedGeneratingScreen({ progress, status }: { progress: number, status: string }) {
  const gradientValue = useSharedValue(0);
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    gradientValue.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    // Haptic feedback at milestones
    if (progress === 25 || progress === 50 || progress === 75) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (progress === 100) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      animationRef.current?.play(30, 60); // Play success animation
    }
  }, [progress]);

  const gradientStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + gradientValue.value * 0.5,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress}%`,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.gradientContainer, gradientStyle]}>
        <LinearGradient
          colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={styles.content}>
        <LottieView
          ref={animationRef}
          source={require('../assets/animations/ai-processing.json')}
          autoPlay
          loop
          style={styles.animation}
        />

        <Text style={styles.title}>Generating Your Image</Text>
        <Text style={styles.subtitle}>{status}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  animation: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: spacing.xl,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginTop: spacing.md,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 300,
    marginTop: spacing['2xl'],
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
```

---

## 📚 Kaynaklar

### Lottie Animations
- [LottieFiles](https://lottiefiles.com/) - Ücretsiz animasyonlar
- [Lottie React Native Docs](https://github.com/lottie-react-native/lottie-react-native)

### Reanimated
- [React Native Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)
- [Reanimated Examples](https://github.com/software-mansion/react-native-reanimated/tree/main/Example)

### Haptics
- [Expo Haptics Docs](https://docs.expo.dev/versions/latest/sdk/haptics/)

---

**Not:** Tüm örnekler TypeScript ile yazılmıştır ve Expo uyumludur.

