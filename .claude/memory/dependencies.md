# Module Dependencies
> Last updated: 2026-05-20 by /r-memory scan

## Module Dependency Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                          ENTRY POINT                                │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    app/ (Expo Router Screens)                      │
│  ├── (tabs)/          → home, analysis, category, profile, etc.     │
│  ├── auth/            → login, register, email-otp, etc.           │
│  ├── kyc/             → ID capture, preview, verification          │
│  ├── bank/            → accounts, account-detail                   │
│  └── loans/           → check-eligibility, apply, my-loans          │
└─────────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  modules/    │  │  shared/     │  │   types/     │
    │              │  │              │  │              │
    │ • auth       │  │ • components│  │ • kyc.ts     │
    │ • login      │  │ • hooks      │  │              │
    │ • register   │  │ • config     │  │              │
    │ • bank       │  │ • redux/     │  │              │
    │ • loan       │  │   └── features│  │              │
    │ • home       │  │ • libs/types │  │              │
    │ • kyc (min)  │  │              │  │              │
    └──────────────┘  └──────────────┘  └──────────────┘
          │                  │
          └──────────────────┴───────────┐
                                     │
                                     ▼
                          ┌──────────────────┐
                          │  External APIs   │
                          │                  │
                          │ • Backend API    │
                          │ • Firebase       │
                          │ • ML Kit (OCR)   │
                          └──────────────────┘
```

## Shared Utilities

**Files used across 3+ modules:**

1. **`shared/hooks/useAppSelector.ts`**
   - Used by: All screens with Redux state access
   - Purpose: Type-safe Redux selectors

2. **`shared/hooks/useToast.ts`**
   - Used by: All screens for notifications
   - Purpose: Show success/error/info toasts

3. **`shared/hooks/useSafePadding.ts`**
   - Used by: All screens with safe area handling
   - Purpose: Handle notch/status bar spacing

4. **`shared/libs/redux/apiSlice.ts`**
   - Used by: All API modules
   - Purpose: Base API configuration with auto-logout

5. **`shared/libs/redux/store.ts`**
   - Used by: App root, all modules accessing Redux
   - Purpose: Redux store configuration

6. **`shared/libs/types/auth.types.ts`**
   - Used by: auth, bank, loan modules
   - Purpose: Common API response types

7. **`shared/components/UI/icons/`**
   - Used by: All screens for icons
   - Purpose: SVG icon components

## High Risk Modules

**Most depended on — highest blast radius:**

1. **`shared/libs/redux/apiSlice.ts`** 🔴 **CRITICAL**
   - Dependents: All API modules
   - Blast radius: Entire app's API layer
   - Risk: Breaking this breaks ALL API calls
   - Change protocol: Extreme caution, thorough testing required

2. **`shared/libs/redux/store.ts`** 🔴 **CRITICAL**
   - Dependents: App root, all Redux consumers
   - Blast radius: Entire state management
   - Risk: Breaking this breaks ALL state access
   - Change protocol: Review all reducers, test persistence

3. **`shared/hooks/useAppSelector.ts`** 🟡 **HIGH**
   - Dependents: 50+ screens/components
   - Blast radius: All state reading code
   - Risk: Type errors across app
   - Change protocol: Ensure type compatibility

4. **`shared/hooks/useToast.ts`** 🟡 **HIGH**
   - Dependents: 40+ screens
   - Blast radius: User notifications
   - Risk: Broken notifications across app
   - Change protocol: Test toast types

5. **`shared/config/index.ts`** 🟡 **HIGH**
   - Dependents: All API calls
   - Blast radius: Backend connectivity
   - Risk: API URL misconfiguration
   - Change protocol: Update env vars

## External Package Usage

| Package | Version | Used For | Locations |
|---------|---------|----------|-----------|
| **Redux Toolkit** | 2.11.2 | State management | `shared/libs/redux/` |
| **RTK Query** | Built-in | API calls | All `*Api.ts` files |
| **Redux Persist** | 6.0.0 | State persistence | `store.ts` |
| **AsyncStorage** | 2.2.0 | Token storage | `apiSlice.ts` |
| **Expo Router** | 6.0.23 | Navigation | `app/` structure |
| **NativeWind** | Latest | Styling | All screens |
| **React Native SVG** | 15.12.1 | Icons/graphics | `shared/components/UI/icons/` |
| **ML Kit** | 2.0.0 | OCR for ID cards | KYC flow |
| **Firebase** | 12.10.0 | Push notifications, analytics | `shared/config/firebase.ts` |
| **Toast Message** | 2.3.3 | Notifications | `useToast.ts` |
| **Gesture Handler** | 2.28.0 | Touch gestures | Bottom sheets, swipes |
| **Reanimated** | 4.1.1 | Animations | Bottom sheets, modals |

## Circular Dependencies

**Status:** ✅ No circular dependencies detected

**Analysis:**
- All imports flow in one direction: `app/ → modules/ → shared/`
- `shared/` has no imports from `app/` or `modules/`
- `modules/` has no imports from `app/`

**Prevention:**
- Use path aliases to avoid relative imports
- Keep feature types in `modules/`, common types in `shared/libs/types/`
- Avoid importing from `app/` in any shared code
