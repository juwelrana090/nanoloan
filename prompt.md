# 👤 NanoLoan — Edit Profile Screen: Wire Update Profile API

# Task 06 — `app/profile/edit-profile.tsx` Full Implementation

> **For local AI agents: Claude Code, Cursor, Copilot, or any local model.**
> Read this entire prompt before writing a single line of code.

---

## ⚠️ CRITICAL: Read Before Touching Anything

```
[ ] 1.  Read AGENTS.md                          — project-wide rules
[ ] 2.  Read CLAUDE.md                          — session protocol
[ ] 3.  Read .context/TASK_COMPLETION_SUMMARY.md — what's already done
[ ] 4.  Read .context/state.md                  — Redux auth slice shape
[ ] 5.  Read .context/api.md                    — RTK Query base pattern
[ ] 6.  Read .context/error-handling.md         — toast + loading patterns
[ ] 7.  Read .claude/agents/profile-agent.md    — profile screen agent doc
[ ] 8.  Fetch live API: GET https://backend-nanoloan.giize.com/api-json
        → Confirm PUT /v1/users/me request/response fields exactly
[ ] 9.  Read app/profile/edit-profile.tsx       — current implementation (full file)
[ ] 10. Read modules/profile/components/AccountSettingsSection.tsx
[ ] 11. Read modules/profile/types/index.ts
[ ] 12. Read shared/libs/redux/features/auth/authApi.ts
        → Confirm useUpdateProfileMutation already exists (DO NOT re-create)
[ ] 13. Read shared/libs/redux/features/auth/authSlice.ts
        → Confirm setUser action signature
[ ] 14. Read shared/hooks/useToast.ts
        → Confirm showSuccess / showError signatures
[ ] 15. Read shared/libs/types/auth.types.ts
        → Confirm UpdateProfileRequest field names
```

---

## 🎯 Mission

Wire the **Edit Profile** screen to the real backend API.
Replace all `Alert` placeholders with working API calls.

### What is already done — DO NOT re-create

| Item                                | Status                                         |
| ----------------------------------- | ---------------------------------------------- |
| `useUpdateProfileMutation` hook     | ✅ EXISTS in `authApi.ts`                      |
| `useGetMeQuery` hook                | ✅ EXISTS in `authApi.ts`                      |
| `setUser(user)` Redux action        | ✅ EXISTS in `authSlice.ts`                    |
| `useToast()` hook                   | ✅ EXISTS in `shared/hooks/useToast.ts`        |
| `UpdateProfileRequest` type         | ✅ EXISTS in `shared/libs/types/auth.types.ts` |
| `UserProfile` type                  | ✅ EXISTS in `shared/libs/types/auth.types.ts` |
| Green/white layout + avatar overlap | ✅ DO NOT TOUCH                                |
| ToggleRow inline component          | ✅ DO NOT TOUCH                                |
| `AccountSettingsSection` component  | ✅ Modify only — don't rewrite                 |

---

## 📋 Exact Changes Required

### Change 1 — `app/profile/edit-profile.tsx`

Replace the two `Alert` placeholders with real implementation.

#### 1a. Add imports at top of file

```typescript
// ADD these imports — check they are not already imported first
import { useAppDispatch } from '@/shared/hooks/useAppSelector';
import { useToast } from '@/shared/hooks/useToast';
import { useUpdateProfileMutation } from '@/shared/libs/redux/features/auth/authApi';
import { setUser } from '@/shared/libs/redux/features/auth/authSlice';
import type { UpdateProfileRequest } from '@/shared/libs/types/auth.types';
```

#### 1b. Add state for editable fields

Inside the component, add local state for the fields the API allows editing:

```typescript
// Editable fields — pre-fill from Redux auth state
const [fullName, setFullName] = useState(user?.fullName ?? '');
const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');

// RTK mutation hook
const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
const dispatch = useAppDispatch();
const { showSuccess, showError } = useToast();
```

> Remove the existing `const [isUpdating, setIsUpdating] = useState(false)` —
> `isLoading` from the RTK mutation replaces it.

#### 1c. Replace `handleUpdateProfile` with real implementation

```typescript
const handleUpdateProfile = async () => {
  // Build payload — only include changed fields
  const payload: UpdateProfileRequest = {};
  if (fullName.trim() && fullName.trim() !== user?.fullName) payload.fullName = fullName.trim();
  if (phoneNumber.trim() && phoneNumber.trim() !== user?.phoneNumber)
    payload.phoneNumber = phoneNumber.trim();

  // Nothing changed
  if (Object.keys(payload).length === 0) {
    showSuccess({ title: 'No changes', message: 'Nothing to update' });
    return;
  }

  try {
    const result = await updateProfile(payload).unwrap();
    // Update Redux auth state so the whole app sees fresh data
    if (result.data) {
      dispatch(setUser({ ...user!, ...result.data }));
    }
    showSuccess({ title: 'Profile Updated', message: 'Your profile has been updated.' });
    router.back();
  } catch (error: any) {
    if (error?.status === 422 && error?.data?.errors) {
      const firstError = Object.values(error.data.errors as Record<string, string[]>)[0]?.[0];
      showError({ title: 'Validation Error', message: firstError ?? 'Please check your input' });
    } else {
      showError({
        title: 'Update Failed',
        message: error?.data?.message ?? 'Something went wrong. Please try again.',
      });
    }
  }
};
```

#### 1d. Remove the camera `Alert` placeholder

Replace `handleCameraPress` Alert with a real image picker stub:

```typescript
const handleCameraPress = () => {
  // TODO: Implement with expo-image-picker in a future task
  // For now, show an informational toast (not Alert)
  showInfo({ title: 'Coming Soon', message: 'Profile photo upload will be available soon.' });
};
```

Import `showInfo` from `useToast()`.

#### 1e. Pass editable state down to `AccountSettingsSection`

Replace the `<AccountSettingsSection />` usage with props:

```tsx
<AccountSettingsSection
  editable={true}
  phone={phoneNumber}
  onPhoneChange={setPhoneNumber}
  username={user?.username} // read-only — no onChange
  email={user?.email} // read-only — no onChange
/>
```

#### 1f. Add Full Name field ABOVE `AccountSettingsSection`

The Figma shows Username/Phone/Email, but `fullName` is the most important editable field
and is separate from `username`. Add it as a standalone field inside the ScrollView,
before `<AccountSettingsSection />`:

```tsx
{
  /* Full Name — editable, maps to PUT /v1/users/me fullName */
}
<View className="mt-5 gap-2">
  <Text className="font-poppins-medium text-[15px] text-[#093030]">Full Name</Text>
  <View className="rounded-[10px] px-5 py-[14px]" style={{ backgroundColor: '#DFF7E2' }}>
    <TextInput
      value={fullName}
      onChangeText={setFullName}
      placeholder="Enter your full name"
      placeholderTextColor="#93B5A0"
      autoCapitalize="words"
      className="font-poppins-light m-0 p-0 text-[13px] text-[#093030]"
      style={{ height: 20 }}
    />
  </View>
</View>;
```

Import `TextInput` from `react-native` if not already imported.

#### 1g. Wire `isUpdating` to the button

The inline Update Profile button currently uses:

```tsx
opacity: isUpdating ? 0.7 : 1;
```

`isUpdating` is now from RTK mutation `isLoading` — ensure the variable name matches.
Also add `disabled={isUpdating}` if not already there.

---

### Change 2 — `modules/profile/components/AccountSettingsSection.tsx`

The component already has `editable` prop and `onPhoneChange` handler.
Verify that phone field passes `onChangeText={onPhoneChange}` and `editable={editable}`.

Make `username` and `email` fields **always read-only** regardless of `editable` prop:

```tsx
{
  /* Username — always read-only */
}
<Field
  label="Username"
  value={displayUsername}
  placeholder="Username"
  editable={false} // ← always false, cannot be changed via API
  autoCapitalize="none"
/>;

{
  /* Phone — editable when editable prop is true */
}
<Field
  label="Phone"
  value={displayPhone}
  placeholder="+880 000 0000 00"
  onChangeText={onPhoneChange}
  editable={editable} // ← controlled by parent
  keyboardType="phone-pad"
  autoCapitalize="none"
/>;

{
  /* Email — always read-only */
}
<Field
  label="Email Address"
  value={displayEmail}
  placeholder="example@example.com"
  editable={false} // ← always false, cannot be changed via API
  keyboardType="email-address"
  autoCapitalize="none"
/>;
```

Add a subtle visual distinction for read-only fields:

```tsx
// In Field component — add opacity when not editable
<View
  className="rounded-[10px] px-5 py-[14px]"
  style={{ backgroundColor: '#DFF7E2', opacity: editable ? 1 : 0.7 }}>
```

---

## 🔌 API Reference

### PUT `/v1/users/me`

**RTK Hook**: `useUpdateProfileMutation` — already in `authApi.ts`
**Auth**: Auto-injected by RTK Query — never add manually
**Verify at**: `GET https://backend-nanoloan.giize.com/api-json`

```typescript
// Request — all fields optional, only send what changed
interface UpdateProfileRequest {
  fullName?:    string;
  phoneNumber?: string;
  dateOfBirth?: string;   // "YYYY-MM-DD" format
  gender?:      'MALE' | 'FEMALE' | 'OTHER';
}

// Response
{
  success: true,
  message: string,
  data: UserProfile   // full updated user object
}

// Error (422)
{
  success: false,
  message: string,
  errors: Record<string, string[]>  // field-level validation errors
}
```

**After success:** dispatch `setUser({ ...user, ...result.data })` to update Redux.

---

## 📐 Layout Rules — DO NOT CHANGE

The green/white overlapping avatar layout must NOT be modified.
These constants are load-bearing — changing them breaks the UI:

```typescript
const AVATAR_SIZE = 110; // px
const OVERLAP = 55; // AVATAR_SIZE / 2
const GREEN_EXTRA = 59; // OVERLAP + 4 — paddingBottom of green nav
const CARD_RADIUS = 40; // borderTopRadius of white card
// marginTop: -OVERLAP (-55) on avatar container — DO NOT CHANGE
```

---

## 🎨 TextInput Styling (match existing fields)

All editable `TextInput` elements must match the existing style in `AccountSettingsSection`:

```tsx
<View className="rounded-[10px] px-5 py-[14px]" style={{ backgroundColor: '#DFF7E2' }}>
  <TextInput
    className="font-poppins-light m-0 p-0 text-[13px] text-[#093030]"
    style={{ height: 20 }}
    placeholderTextColor="#93B5A0"
    // ...other props
  />
</View>
```

---

## 🗺️ Data Flow — Full Picture

```
User taps "Update Profile"
       │
       ▼
handleUpdateProfile()
       │
       ├─ Build payload from local state (fullName, phoneNumber)
       ├─ Skip fields unchanged from user
       ├─ If nothing changed → showSuccess "No changes" → return
       │
       ▼
useUpdateProfileMutation(payload)
  PUT /v1/users/me
       │
  ┌────┴────┐
  ✅         ❌
  │          │
  ▼          ▼
dispatch   422 → showError field message
setUser()  other → showError generic message
  │
  ▼
showSuccess "Profile Updated"
  │
  ▼
router.back()  ← returns to profile tab
```

---

## ❌ Hard Rules — Never Violate

1. **NEVER re-create** `useUpdateProfileMutation` — it already exists in `authApi.ts`
2. **NEVER attach `Authorization` headers** — `apiSlice.ts` injects them automatically
3. **NEVER use `fetch()` directly** — RTK Query only
4. **NEVER use `Alert`** for success/error feedback — use `useToast()` only
5. **NEVER use `StyleSheet.create`** — NativeWind `className` + inline `style={{}}` only
6. **NEVER change** `AVATAR_SIZE`, `OVERLAP`, `GREEN_EXTRA`, `CARD_RADIUS` constants
7. **NEVER put `username` or `email` as editable** — the API does not support changing them
8. **ALWAYS dispatch `setUser()`** after a successful profile update so Redux stays in sync
9. **ALWAYS show loading state** — `isUpdating` from RTK hook must disable the button
10. **ALWAYS update `.context/`** after task completion

---

## ✅ Definition of Done

All items must be true before calling this task complete:

- [ ] "Update Profile" button calls `PUT /v1/users/me` via `useUpdateProfileMutation`
- [ ] `isUpdating` from RTK hook disables button and shows `ActivityIndicator` while request is in flight
- [ ] On success: `setUser()` dispatched, success toast shown, `router.back()` called
- [ ] On 422 error: first field-level error message shown in error toast
- [ ] On other error: generic error toast shown, screen stays open
- [ ] `fullName` field is editable and pre-filled from `state.auth.user.fullName`
- [ ] `phoneNumber` field is editable and pre-filled from `state.auth.user.phoneNumber`
- [ ] `username` field is read-only (opacity 0.7)
- [ ] `email` field is read-only (opacity 0.7)
- [ ] Camera button shows info toast instead of Alert
- [ ] No `Alert` calls remain in the screen
- [ ] Green/white layout unchanged — avatar still straddles boundary
- [ ] `npx tsc --noEmit` passes with zero new TypeScript errors
- [ ] `.context/TASK_COMPLETION_SUMMARY.md` updated with Task 06 entry
- [ ] `.context/api-contracts-task03.md` updated with PUT /v1/users/me contract
- [ ] `.claude/agents/profile-agent.md` updated to mark implemented items as ✅

---

## 📝 .context/ Files to Update After Task

```
.context/TASK_COMPLETION_SUMMARY.md
  → Add Task 06 dated entry
  → Files modified: app/profile/edit-profile.tsx,
                    modules/profile/components/AccountSettingsSection.tsx
  → Mark: useUpdateProfileMutation wired, setUser dispatched on success

.context/api-contracts-task03.md
  → Add PUT /v1/users/me entry:
    Hook: useUpdateProfileMutation (already in authApi.ts)
    Request: UpdateProfileRequest { fullName?, phoneNumber?, dateOfBirth?, gender? }
    Response: ApiSuccessResponse<UserProfile>
    After success: dispatch setUser({ ...user, ...result.data })

.claude/agents/profile-agent.md
  → Change ⏳ to ✅ for:
    - PUT /v1/users/me API call from Update Profile button
    - useUpdateProfileMutation RTK hook wiring
    - After update: dispatch setUser() to update Redux auth state
    - Profile photo: change placeholder from Alert to showInfo toast
```

---

_Prompt version: June 2026 — Task 06, Edit Profile API wiring._
_Prerequisites: Task 04 (bankApi/loanApi), Task 05 (loan screens) should be done._
_The UI layout is complete. This task is API wiring only._
