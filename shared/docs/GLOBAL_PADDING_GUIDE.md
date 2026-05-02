# Global Padding System

This app uses a centralized padding system to automatically handle safe areas and system navigation across all screens.

## Installation

No installation needed - it's already set up! Just import and use.

## Usage

### Option 1: Use the Hook (Recommended for most screens)

```tsx
import { useSafePadding } from '@/shared/hooks/useSafePadding';

export default function MyScreen() {
  const { paddingTop, paddingBottom } = useSafePadding();

  return (
    <View style={{ paddingTop, paddingBottom }}>
      {/* Your screen content */}
    </View>
  );
}
```

### Option 2: Use the ScreenContainer Component

```tsx
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function MyScreen() {
  return (
    <ScreenContainer withTopPadding withBottomPadding>
      {/* Your screen content */}
    </ScreenContainer>
  );
}
```

## Available Padding Values

From the `useSafePadding` hook:

- **`paddingTop`** - Status bar padding (notch area)
- **`paddingBottom`** - Bottom padding with auto system navigation detection
- **`scrollPaddingBottom`** - ✅ Use this in `ScrollView contentContainerStyle`. Automatically adds extra space when system nav bar is present so buttons/content are never hidden
- **`paddingBottomForTabs`** - Extra bottom padding for tab screens (includes tab bar space)
- **`paddingBottomForModal`** - Padding for modals and bottom sheets
- **`paddingHorizontal`** - Side padding for devices with notches/cutouts
- **`insets`** - Raw safe area insets for custom calculations

## How It Works

The system automatically detects:
- ✅ System navigation bar (Samsung, Pixel, etc.)
- ✅ Gesture navigation (Android 10+)
- ✅ iPhone notch and Dynamic Island
- ✅ iPad landscape

### Android Detection Logic

```typescript
// System navigation bar detected
if (insets.bottom > 0) {
  // Use detected inset + padding
  return insets.bottom + 12;
}
// Gesture navigation (no system bar)
else {
  // Use minimum padding to keep content visible
  return 20;
}
```

## Examples

### Tab Screen
```tsx
import { useSafePadding } from '@/shared/hooks/useSafePadding';

export default function TabScreen() {
  const { paddingTop } = useSafePadding();
  
  return (
    <View style={{ paddingTop }} className="flex-1">
      {/* Content - tab bar handles its own bottom padding */}
    </View>
  );
}
```

### Modal Screen
```tsx
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function ModalScreen() {
  return (
    <ScreenContainer
      withTopPadding
      withBottomPadding
      backgroundColor="white"
    >
      {/* Modal content */}
    </ScreenContainer>
  );
}
```

### Full Screen with Custom Padding
```tsx
import { useSafePadding } from '@/shared/hooks/useSafePadding';

export default function CustomScreen() {
  const { paddingTop, paddingBottom, insets } = useSafePadding();
  
  return (
    <View style={{
      paddingTop,
      paddingBottom: insets.bottom + 100, // Custom calculation
      flex: 1
    }}>
      {/* Content */}
    </View>
  );
}
```

## Migration Guide

### Before (Old Way)
```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function MyScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{
      paddingTop: insets.top,
      paddingBottom: insets.bottom + 75 // Manual calculation
    }}>
      {/* Content */}
    </View>
  );
}
```

### After (New Way)
```tsx
import { useSafePadding } from '@/shared/hooks/useSafePadding';

function MyScreen() {
  const { paddingTop, paddingBottomForTabs } = useSafePadding();
  return (
    <View style={{ paddingTop, paddingBottom: paddingBottomForTabs }}>
      {/* Content */}
    </View>
  );
}
```

## Benefits

1. **Consistent** - Same padding across all screens
2. **Automatic** - Detects system navigation automatically
3. **Centralized** - Update padding logic in one place
4. **Type-safe** - Full TypeScript support
5. **Flexible** - Use hook or component based on your needs

## Troubleshooting

**Q: Bottom navigation still hidden on some devices?**
A: Make sure you removed `WindowCompat.setDecorFitsSystemWindows(window, false)` from MainActivity.kt

**Q: Padding too large/small?**
A: You can access raw `insets` from the hook for custom calculations

**Q: Not working on a specific screen?**
A: Ensure you're using `useSafePadding` hook or `ScreenContainer` component
