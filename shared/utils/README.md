# Onboarding System

## Overview

The onboarding system displays the welcome/onboarding screens only once when the user first opens the app. Subsequent launches will skip directly to the main welcome screen.

## Features

- ✅ Shows onboarding slides only on first app launch
- ✅ Persists onboarding completion status using AsyncStorage
- ✅ Automatically skips onboarding on subsequent launches
- ✅ Provides utility functions for managing onboarding state

## Usage

### Basic Flow

1. **First Launch**: User sees onboarding slides (Welcome → Get Started)
2. **Completion**: Onboarding is marked as complete in AsyncStorage
3. **Subsequent Launches**: App skips directly to AfterAuthScreen

### API Reference

```typescript
import { hasCompletedOnboarding, markOnboardingCompleted, resetOnboarding } from '@/shared/utils/onboarding';

// Check if user has completed onboarding
const hasCompleted = await hasCompletedOnboarding();
// Returns: boolean

// Mark onboarding as complete (called automatically)
await markOnboardingCompleted();

// Reset onboarding (for testing purposes)
await resetOnboarding();
```

## Implementation Details

### Storage Key
- **Key**: `@onboarding_completed`
- **Value**: `"true"` (string)

### Components Involved

1. **`app/welcome.tsx`**: Main welcome screen
   - Checks onboarding status on mount
   - Displays appropriate screen based on completion status

2. **`shared/components/welcome/OnBoarding.tsx`**: Onboarding slides
   - Displays welcome and get started slides
   - Calls `setStep(2)` when completed

3. **`shared/utils/onboarding.ts`**: Onboarding utilities
   - Manages AsyncStorage operations
   - Provides helper functions

## Testing

To test the onboarding flow, you can reset the onboarding status:

```typescript
import { resetOnboarding } from '@/shared/utils/onboarding';

// Reset onboarding to see it again
await resetOnboarding();
```

Add this temporarily in your code or use React Native Debugger to modify AsyncStorage directly.

## File Structure

```
shared/
├── utils/
│   ├── index.ts
│   ├── onboarding.ts
│   └── README.md
├── components/
│   └── welcome/
│       ├── OnBoarding.tsx
│       └── AfterAuthScreen.tsx
```

## Future Enhancements

Potential improvements:
- Add analytics tracking for onboarding completion
- Support multiple onboarding versions
- A/B testing different onboarding flows
- Skip onboarding button for returning users
- Animated transitions between screens
