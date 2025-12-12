import { Platform, PixelRatio } from 'react-native';

/**
 * Dynamic Type Support Utilities
 * Provides utilities for supporting iOS Dynamic Type and Android font scaling
 */

/**
 * Get scaled font size based on system font scale
 * @param baseSize Base font size in points
 * @param maxScale Maximum scale factor (default: 1.3)
 * @returns Scaled font size
 */
export function getScaledFontSize(baseSize: number, maxScale: number = 1.3): number {
  if (Platform.OS === 'ios') {
    // iOS uses Dynamic Type
    const fontScale = PixelRatio.getFontScale();
    const scaledSize = baseSize * Math.min(fontScale, maxScale);
    return Math.round(scaledSize);
  } else {
    // Android uses system font scale
    const fontScale = PixelRatio.getFontScale();
    const scaledSize = baseSize * Math.min(fontScale, maxScale);
    return Math.round(scaledSize);
  }
}

/**
 * Get scaled spacing based on system font scale
 * @param baseSpacing Base spacing value
 * @param maxScale Maximum scale factor (default: 1.2)
 * @returns Scaled spacing value
 */
export function getScaledSpacing(baseSpacing: number, maxScale: number = 1.2): number {
  const fontScale = PixelRatio.getFontScale();
  const scaledSpacing = baseSpacing * Math.min(fontScale, maxScale);
  return Math.round(scaledSpacing);
}

/**
 * Check if user has increased font size preference
 * @returns true if font scale is greater than 1.0
 */
export function hasIncreasedFontSize(): boolean {
  return PixelRatio.getFontScale() > 1.0;
}

/**
 * Get current font scale factor
 * @returns Current font scale (1.0 = default, >1.0 = increased)
 */
export function getFontScale(): number {
  return PixelRatio.getFontScale();
}

