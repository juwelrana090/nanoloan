# Senior Developer Agent Prompt — NanoLoan: Context Builder + 5 Screen API Integration

## 🎯 Your Role

You are a **Senior React Native Developer** working on the **NanoLoan** Expo Router project. You complete 3 tasks in sequence: audit the project → write full context documentation → wire up 5 screens to their backend APIs.

---

## 📁 Project Root

```
D:\ReactNative\nanoloan
```

---

## ⚠️ CRITICAL: Execution Order

**Do NOT skip phases. Do NOT start Task 02 before Task 01 is fully complete.**

---

# ═══════════════════════════════════════

# TASK 01 — Full Project Audit + Context

# ═══════════════════════════════════════

## Phase 1 — Read the ENTIRE project

Scan every file and folder. For each area, extract the exact information listed:

### 1.1 — Project foundation

Read: `package.json`, `app.json`, `tsconfig.json`, `babel.config.js`, `tailwind.config.js`
Extract:

- All installed dependencies (especially HTTP client, state management, storage)
- Path aliases (`@/`, `~/`, etc.)
- Expo SDK version
- NativeWind version

### 1.2 — Entry point and navigation

Read: `app/_layout.tsx`, `app/index.tsx`, all `_layout.tsx` files
Extract:

- Root layout structure (providers, guards, navigation)
- Auth-gated navigation pattern (how logged-in vs logged-out is handled)
- All route segments and their purpose

### 1.3 — Auth system

Search for: `login`, `token`, `auth`, `session`, `useAuth`, `AuthContext`, `zustand`, `redux`, `jotai`
Extract:

- How auth tokens are stored (AsyncStorage, SecureStore, Zustand, etc.)
- Where `accessToken` / `refreshToken` live
- Auth hook or context API (`useAuth()` → what it returns)
- How the auth header (`Authorization: Bearer <token>`) is attached to requests

### 1.4 — API / HTTP layer

Search for: `axios`, `fetch`, `api`, `httpClient`, `baseURL`, `interceptor`
Extract:

- Base URL constant (should be `https://backend-nanoloan.giize.com`)
- HTTP client setup file path
- How requests are made (custom hook, service function, direct fetch)
- How auth headers are injected
- How errors are handled globally (interceptors, try/catch pattern)
- Existing API service files and their patterns

### 1.5 — State management

Search for: `store`, `zustand`, `redux`, `context`, `useState`
Extract:

- Global state libraries and store locations
- KYC/biometric state (if exists): where document data, images, and session IDs are stored
- User profile state: where user data is stored after login

### 1.6 — KYC / eKYC screens inventory

Read all files in: `app/kyc/`, `app/auth/`, `modules/kyc/`, `shared/components/kyc/`
Map every screen:

- File path
- Screen name / component name
- What it does
- Navigation: where it comes from and where it goes next
- Current state (has API call? no API call? placeholder?)

### 1.7 — Existing screen files to integrate

Locate these exact files (search if paths differ):

```
app/auth/basic-information.tsx       OR  app/kyc/basic-information.tsx
app/auth/addresses-update.tsx        OR  app/kyc/addresses-update.tsx
app/kyc/started-verification.tsx
app/kyc/id-capture-preview.tsx
app/kyc/address-capture-preview.tsx
```

For each file, read it fully and note:

- Current form fields and their state variable names
- Current submit handler (if any)
- Navigation called on success
- Any existing API calls

### 1.8 — Error handling + feedback patterns

Search for: `toast`, `alert`, `Alert`, `showToast`, `Snackbar`, `notification`
Extract:

- How errors are currently shown to the user in other screens
- Toast/alert library used (if any)
- Loading state pattern used (local `useState`, global store)

---

## Phase 2 — Write Context Documentation

Create the `context/` folder at: `D:\ReactNative\nanoloan\context\`

Write these files completely. Every future AI agent **must read this folder first** before opening any source file.

---

### `context/AGENT_README.md`

```markdown
# NanoLoan — AI Agent Guide

> READ THIS FILE FIRST before opening any source file.

## What is this app?

NanoLoan is a React Native (Expo) mobile app for loan management.
Users register, complete KYC verification, and apply for loans.

## How to navigate this context folder

| File                | What it covers                                     |
| ------------------- | -------------------------------------------------- |
| project-overview.md | Stack, dependencies, folder structure              |
| auth.md             | Auth flow, token storage, useAuth hook API         |
| api.md              | HTTP client setup, base URL, how to make API calls |
| state.md            | Global stores, KYC state, user state               |
| screens-kyc.md      | All KYC screens, navigation flow, API connections  |
| error-handling.md   | Toast/alert patterns, loading states               |

## ⛔ Rules for all agents

- ALWAYS attach `Authorization: Bearer <token>` for authenticated endpoints
- NEVER hardcode the base URL — use the existing constant
- ALWAYS read existing screen code before editing it
- ALWAYS follow the existing error handling pattern
- ALWAYS follow the existing loading state pattern
```

---

### `context/project-overview.md`

Fill in from your Phase 1 audit:

- Expo SDK version, NativeWind version, Router version
- All key dependencies with their purpose
- Full annotated folder structure (2 levels deep minimum)
- Path aliases and what they resolve to
- How to run the project

---

### `context/auth.md`

Fill in from your Phase 1 audit:

- Full auth flow (registration → OTP → login → token stored)
- Token storage mechanism and exact storage key
- `useAuth()` hook — full return type (token, user, login, logout, etc.)
- How to get the current access token in a component or service
- JWT payload structure (what fields are in the token)

---

### `context/api.md`

Fill in from your Phase 1 audit:

- Base URL: `https://backend-nanoloan.giize.com`
- HTTP client file path and how it's used
- Auth header injection (exact code pattern)
- Standard response envelope shape
- Standard error response shape
- Example of a complete API call (request + error handling + loading state)

---

### `context/state.md`

Fill in from your Phase 1 audit:

- State management library and store locations
- KYC state shape (document type, side, images, session token, extracted fields)
- User profile state shape
- How to read/write each store

---

### `context/screens-kyc.md`

Fill in from your Phase 1 audit:

- Full KYC navigation flow diagram (text-based)
- Every screen: file path, purpose, inputs, outputs, API call (if any)
- Where each screen navigates on success and on error

---

### `context/error-handling.md`

Fill in from your Phase 1 audit:

- How errors are shown to the user (exact function/component used)
- Loading state pattern (exact useState pattern or store field)
- Success feedback pattern

---

# ══════════════════════════════════════════

# TASK 02 — Read Live API Documentation

# ══════════════════════════════════════════

Fetch the full OpenAPI spec from:

```
https://backend-nanoloan.giize.com/api-json
```

From this spec, extract the full contract for each of these 5 endpoints:

- `PUT /v1/users/me`
- `POST /v1/users/me/addresses`
- `POST /v1/biometric/start`
- `POST /v1/biometric/id-verify`
- `POST /v1/biometric/address-verify`

For each endpoint, note:

- Required request headers
- Request body shape (all fields, types, required vs optional)
- Content-Type (`application/json` vs `multipart/form-data`)
- Success response shape (status code + body)
- Error response shapes (400, 401, 422, etc.)

Save a summary of all 5 contracts before proceeding to Task 03.

---

# ═══════════════════════════════════════════════

# TASK 03 — Wire 5 Screens to Backend APIs

# ═══════════════════════════════════════════════

## Global Rules for All API Integration

1. **Read the existing screen file fully** before editing it
2. **Follow the existing HTTP client pattern** from `context/api.md`
3. **Follow the existing auth header pattern** — attach `Authorization: Bearer <token>`
4. **Follow the existing loading state pattern** from `context/error-handling.md`
5. **Follow the existing error feedback pattern** from `context/error-handling.md`
6. **TypeScript strict** — all request bodies and responses must be typed
7. **Never hardcode base URL** — use the existing constant
8. **No new HTTP libraries** — use whatever is already in `package.json`

---

## Screen 01 — `BasicInformationScreen`

**File:** `app/auth/basic-information.tsx` (or current location from audit)
**API:** `PUT /v1/users/me`
**Auth:** Required — `Authorization: Bearer <token>`
**Content-Type:** `application/json`

### Request Body (from API spec — verify fields):

```typescript
interface UpdateUserProfileRequest {
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  educationLevel?: 'PRIMARY' | 'SECONDARY' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'PHD' | 'OTHER';
  nationalId?: string; // NID number
  tin?: string; // Tax Identification Number
  passportNo?: string; // Passport number
}
// ⚠️ Verify exact field names and enum values from the live API spec
```

### Implementation:

```typescript
// Create: services/users/updateProfile.ts (or follow existing service pattern)
export async function updateUserProfile(
  data: UpdateUserProfileRequest,
  token: string
): Promise<UpdateUserProfileResponse> {
  // Use existing HTTP client — do NOT use raw fetch
}
```

### Behavior:

- **On submit:** Show loading indicator → call API
- **On success:** Navigate to `AddressesUpdateScreen` (next step in KYC flow)
- **On 422 validation error:** Show field-level errors under each input
- **On 401:** Handle token expiry (follow existing pattern)
- **On any other error:** Show error feedback using existing toast/alert pattern

---

## Screen 02 — `AddressesUpdateScreen`

**File:** `app/auth/addresses-update.tsx` (or current location from audit)
**API:** `POST /v1/users/me/addresses`
**Auth:** Required — `Authorization: Bearer <token>`
**Content-Type:** `application/json`

### Request Body (from API spec — verify fields):

```typescript
interface CreateAddressRequest {
  type: 'PRESENT' | 'PERMANENT';
  address: string;
  postCode: string;
  city: string;
  state: string;
  country: string;
  yearsAtAddress: number;
}
// ⚠️ Verify exact field names from the live API spec
```

### Behavior:

- **On submit:** Show loading → call API
- **On success:** Navigate to `StartedVerificationScreen` (biometric start)
- **On 422:** Show field-level validation errors
- **On error:** Show error feedback using existing toast/alert pattern

---

## Screen 03 — `StartedVerificationScreen`

**File:** `app/kyc/started-verification.tsx` (or current location from audit)
**API:** `POST /v1/biometric/start`
**Auth:** Required — `Authorization: Bearer <token>`
**Content-Type:** `application/json`
**Request Body:** None (empty POST or verify from spec)

### Response (from API spec — verify):

```typescript
interface BiometricStartResponse {
  success: boolean;
  message: string;
  data: {
    sessionId?: string; // ⚠️ Verify field name from spec
    // ... other fields
  };
}
```

### Behavior:

- **On screen load (or on button press "Start Verification"):** Call this API automatically
- **Save the `sessionId`** (or equivalent) from the response into the KYC state/store — it will be needed by the ID verify and address verify calls
- **On success:** Navigate to `SelectIDTypeScreen`
- **On error:** Show error feedback + retry option

### Important:

After calling this endpoint, store the returned session token/ID in the KYC global state so `IDCapturePreviewScreen` and `AddressCapturePreviewScreen` can use it.

---

## Screen 04 — `IDCapturePreviewScreen`

**File:** `app/kyc/id-capture-preview.tsx` (or current location from audit)
**Trigger:** User presses "Confirm & Continue" button
**API:** `POST /v1/biometric/id-verify`
**Auth:** Required — `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`

### Request Body (from API spec — verify fields):

```typescript
// This is a multipart/form-data upload
const formData = new FormData();
formData.append('idType', idType); // 'NID' | 'PASSPORT'
formData.append('idCardImage', {
  // The cropped photo from id-capture screen
  uri: croppedImageUri,
  name: 'id-card.jpg',
  type: 'image/jpeg',
} as any);
// ⚠️ Verify exact field names from the live API spec
// Also append sessionId or biometricSessionToken if required by spec
```

### Read from KYC state:

- `croppedImageUri` — the cropped ID card image URI (from id-capture screen)
- `idType` — `'NID'` or `'PASSPORT'` (from select-id-type screen)
- `sessionId` — from biometric start response (stored in Step 03)

### Behavior:

- **On "Confirm & Continue" press:** Show loading → build FormData → call API
- **On success:** Navigate to `AddressRolesScreen` (next KYC step)
- **On error:** Show error feedback + "Retake" option to go back to camera

---

## Screen 05 — `AddressCapturePreviewScreen`

**File:** `app/kyc/address-capture-preview.tsx` (or current location from audit)
**Trigger:** User presses "Confirm" button
**API:** `POST /v1/biometric/address-verify`
**Auth:** Required — `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`

### Request Body (from API spec — verify fields):

```typescript
// This is a multipart/form-data upload
const formData = new FormData();
formData.append('addressImage', {
  uri: croppedAddressImageUri,
  name: 'address-doc.jpg',
  type: 'image/jpeg',
} as any);
// ⚠️ Verify exact field names from the live API spec
// Also append sessionId if required by spec
```

### Read from KYC state:

- `croppedAddressImageUri` — from address-capture screen
- `sessionId` — from biometric start response

### Behavior:

- **On "Confirm" press:** Show loading → build FormData → call API
- **On success:** Navigate to `FacialRecognitionScreen`
- **On error:** Show error feedback + "Retake" option

---

## Shared API Service Layer

Create (or extend) the service files following the existing project pattern:

```
services/
  users/
    updateProfile.ts         ← PUT /v1/users/me
    createAddress.ts         ← POST /v1/users/me/addresses
  biometric/
    startVerification.ts     ← POST /v1/biometric/start
    verifyId.ts              ← POST /v1/biometric/id-verify
    verifyAddress.ts         ← POST /v1/biometric/address-verify
```

Each service function must:

- Accept typed request params
- Return typed response
- Throw typed errors (or return `{ data, error }` — match existing pattern)
- Never contain UI logic (no `Alert`, no `router.push`)

---

## KYC State Updates Required

After Task 01 audit, update the KYC state store to include these fields if missing:

```typescript
interface KYCState {
  // Biometric session
  biometricSessionId: string | null; // from POST /v1/biometric/start

  // ID verification
  idType: 'NID' | 'PASSPORT' | null;
  idSide: 'front' | 'back';
  idFrontImageUri: string | null; // cropped front image
  idBackImageUri: string | null; // cropped back image

  // Address verification
  addressImageUri: string | null; // cropped address document

  // Parsed OCR fields (from previous task fix)
  extractedIdFields: NIDFrontFields | PassportFrontFields | null;
  extractedAddressFields: NIDBackFields | PassportBackFields | null;
}
```

---

## ✅ Definition of Done

```
✅ TASK 01 — Context Complete

Files created in D:\ReactNative\nanoloan\context\:
- [ ] AGENT_README.md
- [ ] project-overview.md
- [ ] auth.md              (token storage + useAuth API documented)
- [ ] api.md               (HTTP client pattern + auth header documented)
- [ ] state.md             (KYC state + user state documented)
- [ ] screens-kyc.md       (full KYC flow + all screens documented)
- [ ] error-handling.md    (toast/alert + loading patterns documented)

✅ TASK 02 — API Contracts Documented

Endpoint contracts verified from live spec:
- [ ] PUT  /v1/users/me            — request body + response typed
- [ ] POST /v1/users/me/addresses  — request body + response typed
- [ ] POST /v1/biometric/start     — response + sessionId field confirmed
- [ ] POST /v1/biometric/id-verify — multipart fields confirmed
- [ ] POST /v1/biometric/address-verify — multipart fields confirmed

✅ TASK 03 — API Integration Complete

- [ ] BasicInformationScreen       — PUT /v1/users/me wired, loading + error handled
- [ ] AddressesUpdateScreen        — POST /v1/users/me/addresses wired, loading + error handled
- [ ] StartedVerificationScreen    — POST /v1/biometric/start wired, sessionId saved to KYC state
- [ ] IDCapturePreviewScreen       — POST /v1/biometric/id-verify wired, image FormData built correctly
- [ ] AddressCapturePreviewScreen  — POST /v1/biometric/address-verify wired, image FormData built correctly
- [ ] All 5 service files created  — fully typed, no UI logic
- [ ] KYC state updated            — biometricSessionId + image URIs stored
- [ ] TypeScript compiles clean    — no errors
- [ ] context/screens-kyc.md updated — reflects new API connections

⚠️ Issues found (if any):
- [list anything that could not be completed and why]
```
