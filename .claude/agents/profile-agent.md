# Profile Agent — NanoLoan React Native Expo

> This agent handles all work inside `app/profile/` and `modules/profile/`.
> The project is **React Native + Expo Router + RTK Query + NativeWind**.
> Do NOT use Next.js patterns (no server actions, no TanStack Query, no Zustand, no `withAuth()`).

---

## ⚠️ Mandatory Pre-Task Reading

```
[ ] 1. AGENTS.md           — project-wide rules, tech stack, absolute rules
[ ] 2. CLAUDE.md           — Claude-specific session protocol
[ ] 3. .context/TASK_COMPLETION_SUMMARY.md  — what is already done
[ ] 4. .context/state.md   — Redux slice shapes (auth state, user object)
[ ] 5. .context/api.md     — RTK Query base query, auth header injection
[ ] 6. .context/api-contracts-task03.md — wired endpoint contracts
[ ] 7. Read every file listed in "Current File Inventory" below before editing
[ ] 8. Fetch live API spec: GET https://backend-nanoloan.giize.com/api-json
```

---

## 📁 Current File Inventory

Read each file before modifying it. Never assume content from docs alone.

### Screen

| File                           | Status         | What it does                                                                |
| ------------------------------ | -------------- | --------------------------------------------------------------------------- |
| `app/profile/edit-profile.tsx` | ✅ Implemented | Full screen — green nav + white card + avatar + settings + toggles + button |

### Components (`modules/profile/components/`)

| File                         | Status         | What it does                                                                                       |
| ---------------------------- | -------------- | -------------------------------------------------------------------------------------------------- |
| `AccountSettingsSection.tsx` | ✅ Implemented | Shows Username / Phone / Email from Redux auth state. Currently **read-only** (`editable={false}`) |
| `SettingsItem.tsx`           | ✅ Implemented | Single toggle row: label left, Switch right                                                        |
| `UpdateProfileButton.tsx`    | ✅ Implemented | Full-width green pill button with loading state                                                    |
| `GreenHeader.tsx`            | ⚠️ Legacy stub | NOT used by `edit-profile.tsx`. Kept to avoid import errors elsewhere                              |
| `ProfileAvatar.tsx`          | ⚠️ Legacy      | Not used by current screen                                                                         |
| `ProfileHeader.tsx`          | ⚠️ Legacy      | Not used by current screen                                                                         |
| `index.ts`                   | ✅             | Exports all components above                                                                       |

### Types

| File                             | Status         | What it has                                                                |
| -------------------------------- | -------------- | -------------------------------------------------------------------------- |
| `modules/profile/types/index.ts` | ✅ Implemented | `UserProfile`, `Address`, `UpdateProfileRequest`, `UpdateBasicInfoRequest` |

---

## 🏗️ Current Screen Architecture

`edit-profile.tsx` is **self-contained** — it does not use `GreenHeader`.
The layout is a two-layer structure with an overlapping avatar:

```
<View bg="#00D09E">                         ← Full screen green bg

  <View>                                    ← SHORT green nav bar
    paddingTop: safeAreaTop + 10
    paddingBottom: 59px  ← creates space for top half of avatar
    │
    ├── Back button (BackIcon)
    ├── "Edit My Profile" title (centered)
    └── Bell button (BellIcon, circular semi-transparent bg)

  <View bg="#F0FFF4" borderTopRadius=40>    ← WHITE CARD (rounded top corners)

    <View marginTop={-55}>                  ← Avatar pulled UP 55px into green area
      ├── 110px circle (initials or photo)
      ├── Camera badge (bottom-right, 30px, bg #00D09E)
      ├── user.fullName (bold, 20px)
      └── "ID: {user.id}" (13px)

    <ScrollView>
      ├── <AccountSettingsSection />        ← Username / Phone / Email (read-only)
      ├── <ToggleRow> Push Notifications    ← inline component, default ON
      ├── <ToggleRow> Turn Dark Theme       ← inline component, default OFF
      └── Update Profile button             ← inline TouchableOpacity, full width
```

### Avatar overlap formula

```
AVATAR_SIZE  = 110px
OVERLAP      = 55px   (AVATAR_SIZE / 2)
GREEN_EXTRA  = 59px   (OVERLAP + 4) ← paddingBottom of green nav
marginTop    = -55px  ← pulls avatar up into green area

Result: exactly 55px of avatar in green, 55px in white card.
```

---

## 📦 Data Source — Redux Auth State

All user data is read from Redux. There are NO profile-specific API calls yet.

```typescript
import { useAppSelector } from '@/shared/hooks/useAppSelector';

const { user } = useAppSelector((state) => state.auth);

// Available fields on user:
user.id; // string — shown as "ID: {user.id}"
user.fullName; // string — avatar initial + name display
user.username; // string — shown in AccountSettingsSection
user.email; // string — shown in AccountSettingsSection
user.phoneNumber; // string — shown in AccountSettingsSection
user.role; // string
user.isEmailVerified; // boolean
```

User type lives in `shared/libs/types/user.types.ts`.
Auth slice lives in `shared/libs/redux/features/auth/authSlice.ts`.

---

## 🔌 API Endpoints (Not Yet Wired)

These endpoints exist in the backend and need to be integrated.
Always verify shapes against live spec first: `GET https://backend-nanoloan.giize.com/api-json`

### GET `/v1/users/me`

**Purpose**: Fetch fresh user profile from server (supplements Redux state)
**Auth**: Auto-injected by RTK Query — do NOT add manually
**RTK hook to create**: `useGetMeQuery`
**Already exists in**: `shared/libs/redux/features/auth/authApi.ts` — check before creating

```typescript
// Response
{
  success: true,
  message: string,
  data: {
    id: string;
    fullName: string;
    email: string;
    username: string;
    phoneNumber: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
    dateOfBirth: string | null;
    age: number | null;
    role: string;
    isEmailVerified: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }
}
```

Docs: `https://backend-nanoloan.giize.com/docs#tag/users/GET/v1/users/me`

---

### PUT `/v1/users/me`

**Purpose**: Update user profile (fullName, gender, dateOfBirth)
**Auth**: Auto-injected by RTK Query — do NOT add manually
**RTK hook to create**: `useUpdateProfileMutation`
**Already exists in**: `shared/libs/redux/features/auth/authApi.ts` — check before creating

```typescript
// Request body
{
  fullName?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;   // ISO date string: "1990-01-15"
}

// Response
{
  success: true,
  message: string,
  data: {}
}
```

Docs: `https://backend-nanoloan.giize.com/docs#tag/users/PUT/v1/users/me`

---

## 🔌 RTK Query Pattern

Follow `shared/libs/redux/features/auth/authApi.ts` exactly.
Auth header is auto-injected — never add it manually.

```typescript
// In authApi.ts — add these endpoints if not already present
getMe: builder.query<ApiSuccessResponse<UserProfile>, void>({
  query: () => ({ url: '/users/me', method: 'GET' }),
  providesTags: ['UserProfile'],
}),

updateProfile: builder.mutation<ApiSuccessResponse<{}>, UpdateProfileRequest>({
  query: (body) => ({ url: '/users/me', method: 'PUT', body }),
  invalidatesTags: ['UserProfile'],
}),
```

Add `'UserProfile'` to `tagTypes` in `shared/libs/redux/apiSlice.ts` if not present.
Check for duplicates before adding.

---

## 🎨 Design Tokens (from Figma node `1-1974`)

```
Screen bg:            #00D09E   (green)
White card bg:        #F0FFF4
Input bg:             #DFF7E2
Avatar circle bg:     #C5F0DC
Avatar initial color: #00D09E
Text primary:         #0E3E3E
Text secondary:       #093030
Toggle active:        #00D09E
Toggle inactive:      #DFF7E2
Button bg:            #00D09E
Button text:          white

Border radius (white card):  40px top-left, 40px top-right
Border radius (button):      26px (52px height / 2)
Border radius (camera badge): 15px (30px / 2)
Padding horizontal:   24px
Avatar diameter:      110px
Camera badge size:    30px
```

---

## 📋 What Is Implemented vs Pending

### ✅ Fully Implemented

- Green nav bar + white card layout with `borderTopRadius: 40`
- Avatar overlapping boundary (marginTop: -55, 110px diameter)
- Avatar shows user initials from `state.auth.user.fullName`
- Name + ID display from Redux auth state
- `AccountSettingsSection` — reads username, phone, email from Redux (read-only)
- Push Notifications toggle (local state, default ON)
- Turn Dark Theme toggle (local state, default OFF)
- "Update Profile" button (shows Alert placeholder)
- Camera button (shows Alert placeholder)

### ✅ Implemented (Task 06 — 2026-06-01)

- ✅ `PUT /v1/users/me` API call from Update Profile button
- ✅ `useUpdateProfileMutation` RTK hook wiring
- ✅ After update: dispatch `setUser()` to update Redux auth state
- ✅ `AccountSettingsSection` editable mode (phone field editable when `editable=true`)
- ✅ `fullName` edit field (added above AccountSettingsSection)
- ✅ Username and Email fields read-only (opacity 0.7 visual distinction)
- ✅ Camera button shows info toast (not Alert)
- ✅ Loading state from RTK mutation (`isLoading`)
- ✅ Success/error toast feedback

### ⏳ Not Yet Implemented

- Profile photo upload (`expo-image-picker` + multipart upload)
- Push notifications actual registration (FCM)
- Dark theme actual implementation


---

## 🗂️ Future Enhancements (Optional)

Remaining items that could be implemented in future tasks:

```
1. Profile photo upload — wire expo-image-picker + multipart upload to API
2. Push notifications — wire to FCM token registration
3. Dark theme — implement theme context and toggle functionality
```

---

## ❌ Hard Rules — Never Violate

1. **NEVER use Next.js patterns** — no `"use server"`, no `getServerSideProps`, no TanStack Query, no Zustand, no `withAuth()`
2. **NEVER use `fetch()` directly** — RTK Query only
3. **NEVER attach `Authorization` headers manually** — `apiSlice.ts` auto-injects them
4. **NEVER use `StyleSheet.create`** — NativeWind `className` + inline `style={{}}` only
5. **NEVER skip loading/error states** — every mutation needs `isLoading` + disabled button + toast on error
6. **NEVER modify the green/white layout constants** without re-verifying pixel alignment:
   ```
   AVATAR_SIZE = 110
   OVERLAP     = 55   (AVATAR_SIZE / 2)
   GREEN_EXTRA = 59   (OVERLAP + 4)
   CARD_RADIUS = 40
   ```
7. **NEVER put avatar, name, or ID inside a ScrollView** — they must stay fixed above it
8. **ALWAYS update `.context/`** after completing any task

---

## 🖥️ Component API Reference

### `<AccountSettingsSection />`

```typescript
interface AccountSettingsSectionProps {
  username?: string; // override Redux value
  phone?: string; // override Redux value
  email?: string; // override Redux value
  onUsernameChange?: (text: string) => void;
  onPhoneChange?: (text: string) => void;
  onEmailChange?: (text: string) => void;
  editable?: boolean; // default false — enables TextInput editing
}
```

Falls back to `state.auth.user` values when props not provided.

---

### `<SettingsItem />`

```typescript
interface SettingsItemProps {
  label: string;
  value: boolean;
  onValueChange?: (value: boolean) => void;
}
```

---

### `<UpdateProfileButton />`

```typescript
interface UpdateProfileButtonProps {
  onPress: () => void;
  isLoading?: boolean; // shows ActivityIndicator, disables touch
  disabled?: boolean; // reduces opacity to 0.6
}
```

---

### `ToggleRow` (inline in `edit-profile.tsx`)

```typescript
// Inline component — not exported from components/index.ts
function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
});
```

---

## 🧭 Navigation

| From                     | To                             | How                                      |
| ------------------------ | ------------------------------ | ---------------------------------------- |
| `app/(tabs)/profile.tsx` | `app/profile/edit-profile.tsx` | `router.push('/profile/edit-profile')`   |
| `edit-profile.tsx`       | Back to profile tab            | Back button → `router.back()`            |
| `edit-profile.tsx`       | After update success           | `router.back()` (returns to profile tab) |

Figma reference: `https://www.figma.com/design/5Fqdm9dDSbBFJjBEvcODpJ/Nano-Loan?node-id=1-1974&m=dev`

---

## ✅ Post-Task Checklist

After completing any task on this screen:

```
[ ] .context/TASK_COMPLETION_SUMMARY.md  — add dated entry
[ ] .context/api-contracts-task03.md     — add any new endpoint wired
[ ] .context/state.md                    — update if auth slice changed
[ ] npx tsc --noEmit                     — zero new TypeScript errors
```

---

_Last updated: 2026-06-01 — Reflects implementation after UI fix (green/white overlap layout)._
_The previous version of this file documented Next.js Admin patterns — those are incorrect for this project._
