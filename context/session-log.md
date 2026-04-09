# Session Log

## 2026-04-09

### Done (Session 1 — First-time setup)
- Read full project structure, all auth-related files, and Swagger/API-JSON docs
- Created `context/` folder with project-snapshot.md, conventions.md

### Done (Session 2 — Auth implementation)
- Created `shared/libs/types/auth.types.ts` — all API contract types derived from Swagger
- Updated `shared/libs/types/user.types.ts` — UserProfile type for nano-loan (removed old learningLanguage/level fields)
- Rewrote `shared/libs/redux/features/auth/authApi.ts` — all endpoints corrected to match Swagger (`/auth/login`, `/auth/register`, `/auth/verify-email`, `/auth/resend-otp`, etc.)
- Fixed `AuthContext.tsx` initializeAuth — removed incorrect `token` field merge on user object
- Scaffolded `modules/login/` — types, actions, hooks; wired up `app/auth/login.tsx`
- Scaffolded `modules/register/` — types, actions, hooks; wired up `app/auth/register.tsx` (added missing `username` field)
- Scaffolded `modules/verify-email/` — types, actions, hooks; rewrote `app/auth/email-otp-verification.tsx` (reads `userId`+`email` from URL params, calls verify-email + resend-otp API)
- Scaffolded `modules/forgot-password/` — types, actions, hooks (screens not yet created)

### Decisions
- `userId` passed between register → verify-email via URL params: `/auth/email-otp-verification?userId=<id>&email=<email>`
- `expo-secure-store` NOT installed — kept AsyncStorage for tokens pending user confirmation
- Login response type assumed as `{ accessToken: string, user: UserProfile }` — marked with TODO to verify
- Register response type assumed as `{ userId: string }` — marked with TODO to verify
- `check-email` and `check-username` are GET with query params (not POST with body)

### Open Questions / Blockers
- Login and register response shapes unverified — hit live API to confirm `accessToken` vs `token` field name
- Forgot-password flow has no screens yet (need `/auth/forgot-password-otp` and `/auth/reset-password` screens)
- `expo-secure-store` migration pending user approval

### Next
- Create forgot-password screens and wire up the full reset flow
- Test login + register against live API; fix response field names if needed
- Decide on `expo-secure-store` vs AsyncStorage
