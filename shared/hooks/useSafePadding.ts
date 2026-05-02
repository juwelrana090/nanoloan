import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

/**
 * Hook to get consistent safe area padding across all screens
 * Automatically handles system navigation detection on Android
 */
export const useSafePadding = () => {
  const insets = useSafeAreaInsets();

  return {
    // Top padding - mainly for status bar
    paddingTop: insets.top,

    // Bottom padding - handles system navigation automatically
    // insets.bottom > 0 means system navigation bar is present
    // insets.bottom === 0 means gesture navigation (no system bar)
    paddingBottom: Platform.select({
      android: insets.bottom > 0 ? insets.bottom + 12 : 20,
      ios: insets.bottom + 8,
    }),

    // Safe bottom padding for ScrollView contentContainerStyle
    // Ensures content is never hidden behind system navigation bar
    // insets.bottom > 0 = visible nav bar (Samsung/Pixel button nav)
    // insets.bottom === 0 = gesture-only nav (no bar to worry about)
    scrollPaddingBottom: Platform.select({
      android: insets.bottom > 0 ? insets.bottom + 24 : 24,
      ios: insets.bottom + 16,
      default: 24,
    }),

    // Bottom padding for tab bar screens (extra space for tab bar)
    paddingBottomForTabs: Platform.select({
      android: insets.bottom > 0 ? insets.bottom + 80 : 80,
      ios: insets.bottom + 75,
    }),

    // Bottom padding for modal/bottom sheets
    paddingBottomForModal: Platform.select({
      android: insets.bottom + 16,
      ios: insets.bottom + 16,
    }),

    // Side padding (left/right) for devices with notches/cutouts
    paddingHorizontal: insets.left > 0 || insets.right > 0 ? 16 : 0,

    // Raw insets for custom calculations
    insets,
  };
};
