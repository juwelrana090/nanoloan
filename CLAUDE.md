# CLAUDE.md — NanoLoan React Native Expo

# Claude Code Agent Instructions

> **Read AGENTS.md first, then this file.**
> AGENTS.md has all project rules, tech stack, API reference, and screen inventory.
> This file has Claude-specific behaviour, session patterns, and `.context/` update mechanics.

---

## 🔄 .context/ Update — Claude's Responsibility

After every task — no matter how small — Claude must update the `.context/` folder.
This is the only way the next session has accurate context.

### What Claude does at the END of every session

```
1. Open .context/TASK_COMPLETION_SUMMARY.md
   → Add a dated entry (use template from AGENTS.md)
   → List every file created and every file modified
   → List what is still pending

2. If a Redux slice was created or changed:
   → Update .context/state.md

3. If a new API endpoint was wired:
   → Update .context/api-contracts-task03.md

4. If new files or folders were created:
   → Update .context/project-overview.md folder structure section

5. If a screen was created or its API wiring changed:
   → Update .context/screens-kyc.md (or create a new screen doc)
```

### What Claude says when done

After updating `.context/`, Claude ends the session with a brief summary:

```
✅ Task complete. .context/ updated:
- TASK_COMPLETION_SUMMARY.md → added Task XX entry
- state.md → added bankSlice shape
- api-contracts-task03.md → added GET /v1/bank/accounts contract
Files created: [list]
Files modified: [list]
Next: [what should be built next]
```

This gives Juwel a clear handoff and confirms `.context/` was not skipped.

---

## 🔁 Session Start Protocol (Every Session)

```
[ ] 1. Read AGENTS.md (full file)
[ ] 2. Read CLAUDE.md (this file)
[ ] 3. Read .context/TASK_COMPLETION_SUMMARY.md  ← most important — what's already done
[ ] 4. Read .context/project-overview.md
[ ] 5. Read .context/state.md
[ ] 6. Read task-specific .context/ files
[ ] 7. Fetch live API spec: GET https://backend-nanoloan.giize.com/api-json
        (for any task touching endpoints)
[ ] 8. Read the actual source files to be modified
[ ] 9. Only then start coding
```

---

## 🤖 Claude-Specific Behaviour Rules

### Think before acting

- State the plan before writing code: which files will be read, which created, which modified, what API endpoints are involved, what state is affected
- Never generate code for a screen without reading that screen's current file first
- If `.context/` says something is done but the source file looks different, report the conflict — don't guess

### Phased execution for multi-file tasks

**Phase 1 — Audit** (report, don't code yet)

- Read all relevant `.context/` files
- Read all source files to be modified
- Fetch live API spec
- State: "Here is what I found and here is my plan"

**Phase 2 — Types + API module**

- Create TypeScript interfaces matching live API spec exactly
- Add RTK Query endpoints

**Phase 3 — Screen / feature implementation**

- Wire the screen to the API
- Add loading state, error handling, success toast, navigation

**Phase 4 — `.context/` update**

- Update every relevant `.context/` file
- Post completion summary

### Reading before writing

When editing an existing screen:

1. Read the full file
2. Identify the existing state management pattern (RTK Query hook or local useState)
3. Identify existing imports
4. Follow the same pattern — do not mix patterns

---

## 📦 Where to Put New Code

| What                             | Where                                              |
| -------------------------------- | -------------------------------------------------- |
| New RTK endpoint (auth/user)     | `shared/libs/redux/features/auth/authApi.ts`       |
| New RTK endpoint (bank)          | `shared/libs/redux/features/bank/bankApi.ts`       |
| New RTK endpoint (loan)          | `shared/libs/redux/features/loan/loanApi.ts`       |
| New Redux slice                  | `shared/libs/redux/features/[name]/[name]Slice.ts` |
| New TypeScript types (bank)      | `modules/bank/types/index.ts`                      |
| New TypeScript types (loan)      | `modules/loan/types/index.ts`                      |
| New TypeScript types (auth/user) | `shared/libs/types/auth.types.ts`                  |
| New screen (bank)                | `app/bank/[screen-name].tsx`                       |
| New screen (loans)               | `app/loans/[screen-name].tsx`                      |
| Reusable component               | `shared/components/[ComponentName].tsx`            |
| Feature-specific component       | `modules/[feature]/components/[Component].tsx`     |

---

## 🧱 Standard Screen Template

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { useToast } from '@/shared/hooks/useToast';
import { useSomeMutation } from '@/shared/libs/redux/features/[feature]/[feature]Api';

export default function ScreenName() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [doSomething, { isLoading }] = useSomeMutation();

  const handleSubmit = async () => {
    try {
      const result = await doSomething(payload).unwrap();
      showSuccess({ title: 'Success', message: result.message });
      router.push('/next-screen');
    } catch (error: any) {
      if (error?.status === 422 && error?.data?.errors) {
        // handle field-level errors inline
      } else {
        showError({ title: 'Error', message: error?.data?.message || 'Something went wrong' });
      }
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-5 pb-6 pt-12">{/* header */}</View>
      <View className="px-5">
        {/* content */}
        <TouchableOpacity
          className={`items-center rounded-2xl py-4 ${isLoading ? 'opacity-60' : ''} bg-[#00C897]`}
          onPress={handleSubmit}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-[16px] font-semibold text-white">Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
```

---

## 🗺️ Route Reference

| Screen            | Route                          | Status            |
| ----------------- | ------------------------------ | ----------------- |
| Welcome           | `/welcome`                     | ✅                |
| Login             | `/auth/login`                  | ✅                |
| Register          | `/auth/register`               | ✅                |
| Email OTP         | `/auth/email-otp-verification` | ✅                |
| Basic Info        | `/auth/basic-information`      | ✅                |
| Addresses         | `/auth/addresses-update`       | ✅                |
| KYC Start         | `/kyc/started`                 | ✅                |
| ID Type           | `/kyc/select-id-type`          | ✅                |
| ID Camera         | `/kyc/id-capture`              | ✅                |
| ID Preview        | `/kyc/id-capture-preview`      | ✅                |
| Addr Roles        | `/kyc/address-roles`           | ✅                |
| Addr Camera       | `/kyc/address-capture`         | ✅                |
| Addr Preview      | `/kyc/address-capture-preview` | ✅                |
| Face              | `/kyc/facial-recognition`      | ⏳ API not wired  |
| Verified          | `/kyc/verified`                | ✅                |
| Home              | `/(tabs)/`                     | ✅ wired Task 04  |
| Bank Accounts     | `/bank/accounts`               | ⏳ screen pending |
| Account Detail    | `/bank/account-detail`         | ⏳ screen pending |
| Check Eligibility | `/loans/check-eligibility`     | ⏳ screen pending |
| Apply Loan        | `/loans/apply`                 | ⏳ screen pending |
| Thank You         | `/loans/thank-you`             | ⏳ screen pending |
| My Loans          | `/loans/my-loans`              | ⏳ screen pending |
| Loan Detail       | `/loans/loan-detail`           | ⏳ screen pending |

---

## 🧠 What Has Been Completed

> Always read `.context/TASK_COMPLETION_SUMMARY.md` for the authoritative list.
> This section is a summary only — the `.context/` file is the source of truth.

| Task    | What                                                 | Status     |
| ------- | ---------------------------------------------------- | ---------- |
| Task 01 | Full project audit + .context/ documentation         | ✅         |
| Task 02 | Live API spec fetched + documented                   | ✅         |
| Task 03 | 5 KYC screens wired to API                           | ✅         |
| Task 04 | bankApi, loanApi, bankSlice, types, HomeScreen wired | ✅         |
| Task 05 | bank/loan screens                                    | ⏳ pending |

---

## 🛑 Stop and Ask Rules

Stop coding and ask for clarification when:

1. Live API spec has a **different field name or shape** than `.context/api-contracts-task03.md`
2. A source file has **significantly different code** than what `.context/` describes
3. The task requires changes to **`app/_layout.tsx`, `store.ts`, or `apiSlice.ts`** — high-risk files
4. Asked to add a **new Redux slice** but an existing one could be extended
5. The task is ambiguous about **which screen or endpoint** is involved
6. A route is referenced that **doesn't exist** in the `app/` directory yet

---

## ⚙️ Development Environment

- **OS**: Windows with PowerShell + NVM for Windows
- **Run dev**: `npm start` or `expo start`
- **Android**: `npm run android`
- **Release APK**: `.\build-release.ps1`
- **Release AAB**: `cd android && ./gradlew bundleRelease --no-daemon -Dorg.gradle.jvmargs="-Xmx4096m"`
- **TypeScript check**: `npx tsc --noEmit` — must pass zero errors before calling a task done

---

## 📝 Code Style

- Functional components only, arrow function handlers
- Explicit return types on RTK endpoints and utilities
- No `any` except FormData file objects (`as any`)
- Destructured imports: `import { useRouter } from 'expo-router'`
- Single quotes for strings (Prettier handles trailing commas)

---

_Last updated: 2026-05-19 — Update when workflow, session protocol, or Claude-specific rules change._
