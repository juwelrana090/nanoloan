# Auth Module
> Last updated: 2026-05-20 by /r-memory scan

## Purpose
Handles user authentication, registration, email verification, and profile management.

## Files
- `modules/auth/types/` - Type definitions (currently minimal, most types in `shared/libs/types/auth.types.ts`)
- `shared/libs/redux/features/auth/authSlice.ts` - Redux state for auth
- `shared/libs/redux/features/auth/authApi.ts` - RTK Query endpoints for auth
- `shared/libs/types/auth.types.ts` - Shared auth types
- `app/auth/` - Auth screens (login, register, email-otp, etc.)

## State Shape
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  deviceToken: DeviceToken | null;
}
```

## Key Endpoints
- `POST /v1/auth/register` - User registration
- `POST /v1/auth/login` - User login
- `POST /v1/auth/verify-email` - Email OTP verification
- `POST /v1/auth/resend-otp` - Resend OTP
- `POST /v1/auth/forgot-password` - Forgot password
- `POST /v1/auth/reset-password` - Reset password
- `GET /v1/users/me` - Get user profile
- `PUT /v1/users/me` - Update profile
- `PUT /v1/users/me/basic-info` - Update basic info (KYC)
- `GET /v1/users/me/addresses` - Get addresses
- `POST /v1/users/me/addresses` - Add address
- `PUT /v1/users/me/addresses/:id` - Update address

## Dependencies
- Depends on: `shared/libs/redux/apiSlice`, `AsyncStorage`
- Used by: All authenticated screens
- High risk: Breaking this breaks all auth flows

## Patterns
- Custom hooks in `modules/*/hooks/` for business logic
- Redux for state persistence
- Toast notifications for user feedback
- Auto-logout on 401 responses

## Notes
- Token stored in both Redux and AsyncStorage
- `isAuthenticated` flag controls access to protected routes
- Biometric status fetched on app start to check KYC completion
