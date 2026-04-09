# Project Snapshot — Nano Loan

_Last updated: 2026-04-09_

---

## Project Overview
React Native Expo app (Expo Router v6, SDK 54) for a micro-lending ("nano loan") product. Android-first (iOS listed but no iOS-specific config beyond `supportsTablet`). App scheme: `nanoloan`.

---

## Tech Stack

| Concern | Library / Approach |
|---|---|
| Navigation | `expo-router` v6 (file-based, Stack + Tabs) |
| State management | Redux Toolkit + `redux-persist` (AsyncStorage) |
| API layer | RTK Query (`@reduxjs/toolkit/query/react`) via `apiSlice` |
| Styling | NativeWind (Tailwind CSS for RN) |
| Auth context | `shared/contexts/AuthContext.tsx` (wraps Redux auth state) |
| Fonts | `@expo-google-fonts/inter`, `roboto`, `lilita-one` |
| Notifications | `expo-notifications` + `@react-native-firebase/messaging` |
| Storage | `AsyncStorage` (currently used for tokens — **not** `expo-secure-store`) |

---

## Key Directory Structure

```
app/
├── _layout.tsx          # Root layout — Redux Provider, PersistGate, AuthProvider, Stack
├── welcome.tsx          # Onboarding / landing screen
├── auth/
│   ├── _layout.tsx      # Auth stack layout (loading spinner on mount)
│   ├── login.tsx        # Login screen (UI only, handleLogin is a TODO)
│   ├── register.tsx     # Register screen (UI only, handleSignUp navigates to OTP)
│   ├── email-otp-verification.tsx   # OTP entry screen (UI only)
│   ├── basic-information.tsx        # Post-OTP user details
│   └── addresses-update.tsx
├── kyc/                 # KYC flow screens
└── (tabs)/              # Authenticated tab navigator

modules/                 # ← EMPTY. Feature modules live here per prompt conventions.

shared/
├── config/index.ts      # apiUrl = EXPO_PUBLIC_API_URL || "https://backend-nanoloan.giize.com"
├── contexts/AuthContext.tsx         # Auth state + actions (most are stubbed/commented out)
├── components/
│   ├── ProtectedRoute.tsx
│   └── SplashScreenAnimated.tsx
├── hooks/useAppSelector.ts
├── libs/
│   ├── redux/
│   │   ├── apiSlice.ts              # RTK Query base — baseUrl = apiUrl + "/v1", auto-logout on 401
│   │   ├── store.ts                 # Redux store with redux-persist
│   │   └── features/auth/
│   │       ├── authSlice.ts         # Auth slice: user, token, isAuthenticated, isLoading, error, deviceToken
│   │       └── authApi.ts           # RTK Query auth endpoints (MISMATCHED URLs — see below)
│   └── types/user.types.ts
```

---

## API Configuration

- **Base URL**: `https://backend-nanoloan.giize.com/v1` (set in `apiSlice.ts`)
- **ENV var**: `EXPO_PUBLIC_API_URL` in `.env`
- **Auth token storage**: `AsyncStorage` key `@token` (prompt says to use `expo-secure-store` — not yet done)

---

## Swagger API Contracts (Source of Truth)

### POST /v1/auth/register
**Request (RegisterDto):**
- `fullName` string required
- `email` string required
- `username` string required
- `password` string required (min 8)
- `phoneNumber` string required
- `dateOfBirth` string required

**Response:** 201 "Account created, OTP sent to email"

### POST /v1/auth/login
**Request (LoginDto):**
- `identifier` string required (email or username)
- `password` string required

**Response:** 200 JWT

### POST /v1/auth/verify-email
**Request (VerifyEmailDto):**
- `userId` string required
- `otp` string required (6 chars)

### POST /v1/auth/resend-otp
**Request (ResendOtpDto):**
- `userId` string required

### POST /v1/auth/forgot-password
**Request (ForgotPasswordDto):**
- `email` string required

### POST /v1/auth/verify-reset-otp
**Request (VerifyResetOtpDto):**
- `userId` string required
- `otp` string required (6 chars)

### POST /v1/auth/reset-password
**Request (ResetPasswordDto):**
- `userId` string required
- `otp` string required (6 chars)
- `newPassword` string required (min 8)

### GET /v1/users/me
**Auth:** Bearer JWT required
**Response:** User profile object

---

## Critical Issues / Mismatches

### authApi.ts URL mismatch (BLOCKER)
The existing `authApi.ts` uses **wrong endpoint paths** from a different backend:

| Endpoint in authApi.ts | Correct path per Swagger |
|---|---|
| `/auth/sign-in` | `/auth/login` |
| `/auth/sign-in-username` | ❌ Does not exist |
| `/auth/sign-up` | `/auth/register` |
| `/auth/check-email` (POST) | `GET /auth/check-email?email=...` (query param, not body) |
| `/auth/check-username` (POST) | `GET /auth/check-username?username=...` (query param, not body) |
| `/auth/send-otp` | ❌ Does not exist (use `POST /auth/resend-otp` with `{ userId }`) |
| `/auth/verify-otp` | `/auth/verify-email` |
| `/auth/reset-password` | `/auth/reset-password` ✅ (but different request shape: needs `userId`, `otp`, `newPassword`) |
| `/users/profile` (GET/POST) | `GET /users/me` and `PUT /users/me` |

All auth API endpoints in `authApi.ts` need to be rewritten to match the Swagger contracts.

### Full User Endpoints (from api-json)
- `GET /v1/users/me` — get current user (JWT required)
- `PUT /v1/users/me` — update profile: fullName?, phoneNumber?, dateOfBirth?, gender?(MALE/FEMALE/OTHER)
- `DELETE /v1/users/me`
- `PUT /v1/users/me/basic-info` — maritalStatus?, educationLevel?, nationalId?, tin?, passportNo?
- `PUT /v1/users/me/change-password` — currentPassword (required), newPassword (required, min 8)
- `GET /v1/auth/check-username?username=` — availability check
- `GET /v1/auth/check-email?email=` — availability check

### AuthContext.tsx — all logic is commented out
All actual API calls (`login`, `register`, `sendOtp`, `verifyOtp`, `resetPassword`) are commented out or throw `new Error('not yet implemented')`. Screens have `TODO` placeholders.

### Token storage
Currently uses `AsyncStorage` for `@token`. Prompt specifies `expo-secure-store`. `expo-secure-store` is **not in package.json** — must be installed before switching.

### User type mismatch
`shared/libs/types/user.types.ts` has `learningLanguage`, `level` fields from a different app. Needs updating for nano-loan user shape (fullName, email, username, phoneNumber, dateOfBirth, isEmailVerified, etc.).

### register.tsx field mismatch
Register screen collects `fullName`, `email`, `mobile`, `dob`, `password`, `confirmPassword`. The Swagger `RegisterDto` requires `username` (not collected by screen), `phoneNumber` (mapped from `mobile`), `dateOfBirth` (mapped from `dob`). Screen is missing a `username` field.

---

## Modules (per prompt convention)

`modules/` directory exists but is **empty**. All auth modules need to be created:

```
modules/
├── login/           { components/, actions/, hooks/, types/ }
├── register/        { components/, actions/, hooks/, types/ }
├── verify-email/    { components/, actions/, hooks/, types/ }
├── resend-otp/      { components/, actions/, hooks/, types/ }
└── forgot-password/ { components/, actions/, hooks/, types/ }
```

---

## Navigation Flow (current)
```
welcome → auth/login ↔ auth/register → auth/email-otp-verification → auth/basic-information
                                                                     → (tabs)/
```
Forgot password flow: not yet wired up (screen not present in app/auth/).

---

## Open Questions / Blockers

1. **Login response shape**: Swagger says "returns JWT" but doesn't specify the response body structure (e.g., `{ accessToken, user }` or `{ token, data }`). Need to verify against live API or check server code.
2. **userId after register**: The OTP verification screens need a `userId` (from register response), but the current screens receive no props. Need to confirm how `userId` is passed between screens (URL params or context).
3. **expo-secure-store**: Not installed. Confirm whether to install it or keep AsyncStorage.
4. **User type**: Need actual API response shape for `/v1/users/me` to define correct TypeScript interface.
