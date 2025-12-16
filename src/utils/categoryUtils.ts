/**
 * Category utilities for organizing scenes
 */

export const MAIN_CATEGORIES = [
  { id: 'professional', name: 'Professional', icon: 'briefcase' },
  { id: 'travel', name: 'Travel', icon: 'airplane' },
  { id: 'social_media', name: 'Social Media', icon: 'share-social' },
  { id: 'nostalgia', name: 'Nostalgia', icon: 'time' },
  { id: 'wedding', name: 'Wedding & Special Occasion', icon: 'heart' },
  { id: 'fantasy', name: 'Fantasy', icon: 'sparkles' },
  { id: 'sports', name: 'Sports & Fitness', icon: 'fitness' },
  { id: 'fashion', name: 'Fashion & Model', icon: 'shirt' },
  { id: 'art', name: 'Art & Illustration', icon: 'color-palette' },
  { id: 'funny', name: 'Funny, Meme & GTA', icon: 'happy' },
] as const;

export type MainCategoryId = (typeof MAIN_CATEGORIES)[number]['id'];

/**
 * Extract subcategories from scene names
 * Groups scenes by their name patterns to create subcategories
 */
export function extractSubcategories(scenes: Array<{ name: string }>): string[] {
  // For now, each scene name is treated as a subcategory
  // In the future, we can group similar scene names together
  const subcategories = new Set<string>();

  scenes.forEach(scene => {
    // Extract subcategory from scene name
    // For example: "GTA V Loading Screen" -> "GTA V Loading Screen"
    // Or: "Plaza Window" -> "Plaza Window"
    subcategories.add(scene.name);
  });

  return Array.from(subcategories).sort();
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(categoryId: string): string {
  const category = MAIN_CATEGORIES.find(cat => cat.id === categoryId);
  return category?.name || categoryId;
}

/**
 * Get category icon name
 */
export function getCategoryIcon(categoryId: string): string {
  const category = MAIN_CATEGORIES.find(cat => cat.id === categoryId);
  return category?.icon || 'grid';
}
