# Architecture
> Last updated: 2026-05-20 by /r-memory scan

## Stack

**Core Framework**
- React Native: 0.81.5
- Expo SDK: 54.0.0
- React: 19.1.0
- Expo Router: 6.0.23 (file-based routing)
- TypeScript: 5.9.2 (strict mode)

**Styling & UI**
- NativeWind: Latest (Tailwind CSS for React Native)
- Tailwind CSS: 3.4.0
- Expo Vector Icons: 15.0.2
- React Native Gesture Handler: 2.28.0
- React Native Reanimated: 4.1.1
- React Native SVG: 15.12.1

**State Management**
- Redux Toolkit: 2.11.2
- Redux Persist: 6.0.0
- React Redux: 9.2.0
- RTK Query: Built-in with Redux Toolkit

**Storage & Data**
- AsyncStorage: 2.2.0 (token/user persistence)
- Firebase: 12.10.0 (Firestore, Messaging, Analytics)

## Folder Structure

```
app/                    # Expo Router pages (screens)
├── (tabs)/             # Bottom tab navigation (main app)
├── auth/               # Authentication screens
├── kyc/                # KYC verification flow
├── bank/               # Bank account management
├── loans/              # Loan management
├── _layout.tsx         # Root layout with providers
└── welcome.tsx         # Welcome/onboarding screen

shared/                 # Shared code (not in app folder)
├── components/         # Reusable UI components
│   ├── kyc/           # KYC-specific components
│   └── UI/            # General UI components
├── config/            # Configuration files
├── contexts/          # React Context providers
├── hooks/             # Custom React hooks
├── libs/              # Core libraries
│   └── redux/         # Redux setup
│       ├── features/  # Redux slices & APIs
│       ├── apiSlice.ts
│       └── store.ts
└── types/             # TypeScript type definitions

modules/               # Feature-specific code
├── auth/              # Authentication module
├── bank/              # Bank accounts module
├── home/              # Home screen logic
├── kyc/               # KYC module (minimal)
├── loan/              # Loan module
├── login/             # Login module
├── register/          # Registration module
└── verify-email/      # Email verification module

types/                 # Global type definitions
└── kyc.ts             # KYC-related types
```

## System Layers

**1. Presentation Layer** (`app/`)
- Screen components using functional components + hooks
- Expo Router for navigation
- NativeWind (Tailwind) for styling
- Uses RTK Query hooks for data fetching

**2. Business Logic Layer** (`modules/`, `shared/hooks/`)
- Custom hooks for complex logic (useLogin, useHome, useBiometricStatus)
- Module-specific actions and services
- Business rules and validations

**3. Data Layer** (`shared/libs/redux/`)
- Redux Toolkit for state management
- RTK Query for API calls
- Redux Persist for state persistence
- AsyncStorage for token storage

**4. Infrastructure Layer** (`shared/config/`)
- API configuration
- Firebase setup
- Environment variables

## Data Flow

**Client → Server Flow**
```
Screen Component
  ↓ (user action)
Custom Hook / Handler
  ↓ (dispatch action or call mutation)
RTK Query Mutation/Query
  ↓ (prepareHeaders with Bearer token)
Base Query with Auto-Logout
  ↓ (fetch)
Backend API (https://backend-nanoloan.giize.com/v1)
  ↓ (response)
Screen Component (unwrap result)
  ↓ (show toast / navigate)
User sees result
```

**State Update Flow**
```
API Response
  ↓ (RTK Query cache update)
Redux Slice (optional local state)
  ↓ (Redux Persist)
AsyncStorage
```

## Auth Flow

**Login Flow**
```
1. User enters credentials on /auth/login
2. useLogin hook calls loginMutation
3. POST /v1/auth/login
4. Response: { user, token }
5. Dispatch setUser(token, user)
6. AsyncStorage.setItem('@token', token)
7. Navigate to home /(tabs)
```

**Auto-Logout Flow**
```
1. Any API call returns 401
2. baseQueryWithAutoLogout catches it
3. AsyncStorage.multiRemove(['@user', '@token', '@deviceToken'])
4. Dispatch setLogout()
5. User redirected to login
```

**Protected Route Flow**
```
1. App starts
2. Redux Persist rehydrates state
3. Check isAuthenticated flag
4. If true: fetch user profile via GET /v1/users/me
5. If false: redirect to /auth/login
```

## External Services

**Backend API**
- URL: https://backend-nanoloan.giize.com
- Version: v1
- Authentication: Bearer token (JWT)
- Auto-logout on 401

**Firebase**
- Firestore: Data storage
- Cloud Messaging: Push notifications
- Analytics: User analytics

**OCR (ML Kit)**
- React Native ML Kit: 2.0.0
- Used for ID card text extraction
- Processes captured ID card images

## Environment Differences

**Development vs Production**
- Development: Expo dev server with hot reload
- Production: Standalone apps (APK/AAB)
- API URL configurable via EXPO_PUBLIC_API_URL

**Platform Differences**
- Android: Min SDK 24, Target SDK 36
- iOS: Supports tablets
- Camera handling differs by platform

## Key Design Decisions

**1. Redux Toolkit + RTK Query (2026-05-20)**
- **Decision**: Use RTK Query for all API calls instead of services/ folder
- **Reason**: Built-in caching, auto-refetching, type-safe
- **Tradeoff**: Learning curve for team unfamiliar with RTK Query
- **Revisit If**: Team size grows beyond 10 developers

**2. File-based routing with Expo Router (2026-05-20)**
- **Decision**: Use Expo Router over React Navigation
- **Reason**: Deep linking support, simpler navigation, Expo ecosystem
- **Tradeoff**: Less flexible than programmatic navigation
- **Revisit If**: Need complex nested navigators

**3. AsyncStorage + Redux Persist whitelist (2026-05-20)**
- **Decision**: Only persist auth, kyc, bank slices
- **Reason**: Minimize storage usage, avoid stale data
- **Tradeoff**: Some data must be refetched on app start
- **Revisit If**: Performance issues due to refetching

**4. Auto-logout on 401 (2026-05-20)**
- **Decision**: Centralized auto-logout in baseQueryWithAutoLogout
- **Reason**: Consistent auth handling across all API calls
- **Tradeoff**: Can't handle 401 for specific endpoints differently
- **Revisit If**: Need per-endpoint 401 handling

**5. Module types in /modules (2026-05-20)**
- **Decision**: Keep types alongside modules, not in shared/
- **Reason**: Better co-location with feature code
- **Tradeoff**: Some types duplicated between modules and shared
- **Revisit If**: Import cycles become problematic
