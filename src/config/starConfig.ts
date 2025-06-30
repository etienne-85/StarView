/**
 * Star Configuration - Comprehensive Star Visual Settings
 * 
 * Purpose: Provides centralized configuration for all star visual properties
 * including colors, size multipliers, glow multipliers, orbit speed, rendering limits,
 * and animation timing parameters.
 * 
 * Features:
 * - Three star categories: regular, highlighted (for suggested stars), selected
 * - Each category includes color, sizeMultiplier, and glowMultiplier
 * - Parameterized orbit speed for camera animations
 * - Configurable focus duration for star focusing animations
 * - Maximum star count for classic rendering mode
 * - Easy to modify and maintain
 * - Type-safe configuration with const assertion
 * 
 * Confidence Rating: High - Comprehensive centralized star configuration with animation timing
 */

export const STAR_SETTINGS = {
  regular: {
    color: '#F8F8FF', // Ghost white
    sizeMultiplier: 1.0,
    glowMultiplier: 1.0,
  },
  highlighted: { // For suggested stars
    color: '#7FFF94', // Aurora green
    sizeMultiplier: 1.5,
    glowMultiplier: 2.0,
  },
  selected: {
    color: '#9D4EDD', // Purple
    sizeMultiplier: 2.0,
    glowMultiplier: 2.5,
  }
} as const;

// Camera animation configuration
export const ORBIT_SPEED = 0.05; // Default orbit speed for camera animations
export const FOCUS_DURATION = 5000; // Duration in milliseconds for star focusing animations

// Rendering performance configuration
export const MAX_CLASSIC_RENDER_STARS = 5000; // Maximum stars rendered in classic mode

// Export individual settings for convenience
export const REGULAR_STAR_SETTINGS = STAR_SETTINGS.regular;
export const HIGHLIGHTED_STAR_SETTINGS = STAR_SETTINGS.highlighted;
export const SELECTED_STAR_SETTINGS = STAR_SETTINGS.selected;