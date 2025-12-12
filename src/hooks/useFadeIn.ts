import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Custom hook for fade-in animation
 * Returns an animated value that fades in from 0 to 1
 * @param duration - Animation duration in milliseconds (default: 300)
 * @param delay - Animation delay in milliseconds (default: 0)
 */
export function useFadeIn(duration: number = 300, delay: number = 0) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [duration, delay]);

  return opacity;
}

