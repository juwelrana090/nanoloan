# AGENTS.md — NanoLoan React Native Expo

> **⚠️ MANDATORY: Read this entire file before touching any code, file, or task.**
> This applies to ALL AI agents: Claude, Cursor, Copilot, GPT, Gemini, or any other tool.

---

## 🔴 MANDATORY WORKFLOW — READ FIRST

### 📋 PRE-TASK PROTOCOL (MANDATORY — DO BEFORE ANY WORK)

**EVERY AI Agent MUST complete this checklist BEFORE writing code:**

```
□ 1. Read .context/AGENT_README.md
□ 2. Read .context/TASK_COMPLETION_SUMMARY.md  ← Understand what's already done
□ 3. Read .context/project-overview.md         ← Understand project structure
□ 4. Read .context/state.md                    ← Understand Redux state
□ 5. Read task-specific .context/ files:
     - api.md for API work
     - screens-kyc.md for KYC screens
     - api-contracts-task03.md for endpoint contracts
□ 6. Fetch live API spec BEFORE any API work:
     GET https://backend-nanoloan.giize.com/api-json
□ 7. Read EVERY source file you plan to modify
     ← NEVER assume file contents
```

**NO EXCEPTIONS. NO SHORTCUTS.**

---

### ✅ POST-TASK PROTOCOL (MANDATORY — DO AFTER EVERY TASK)

**EVERY AI Agent MUST update .context/ AFTER completing work:**

```
□ 1. .context/TASK_COMPLETION_SUMMARY.md
     - Add NEW dated entry (never append to existing)
     - List: What implemented, files created, files modified
     - Include: Known issues, next steps, what's pending

□ 2. .context/state.md
     - IF Redux slice created/changed: update state shapes
     - IF new action added: document signature
     - IF persist changed: update whitelist

□ 3. .context/api-contracts-task03.md
     - IF new endpoint wired: add request/response interfaces
     - Include: RTK hook name, usage example

□ 4. .context/project-overview.md
     - IF new file/folder created: update folder structure
     - IF new module added: document exports
     - IF dependencies changed: update tech stack

□ 5. TypeScript check: npx tsc --noEmit
     - MUST pass with zero errors before calling task done
```

**TASK IS NOT COMPLETE UNTIL .context/ IS UPDATED.**

---

## 🗂️ What Is This Project?

**NanoLoan** is a React Native (Expo) mobile fintech app for micro-lending services built by Miguns Technology Ltd, Dhaka, Bangladesh. Users register, complete KYC verification, and apply for loans against a linked bank account.

- **Package**: `com.nano.loan.app`
- **Platform**: Android (primary), iOS
- **API Base URL**: `https://backend-nanoloan.giize.com`
- **Live API Docs** (always fetch before any API work): `https://backend-nanoloan.giize.com/api-json`

---

## 🔄 The Prime Directive — .context/ Is the Project Memory

The `.context/` folder is the **single source of truth** for this project's state.
Every AI agent **reads it before starting**. Every AI agent **updates it after finishing**.
This is not optional. A task is not complete until `.context/` reflects what was done.

### Read → Do → Update. Always.

```
BEFORE any task:   Read relevant .context/ files
DURING task:       Follow what .context/ documents
AFTER every task:  Update .context/ to reflect every change made
```

If you skip the `.context/` update, the next agent will re-implement work already done,
break established patterns, or spend hours on stale assumptions.

**Skipping a `.context/` update is as serious as introducing a bug.**

---

## 📂 .context/ File Inventory

| Priority  | File                               | What it covers                              | Update when...                   |
| --------- | ---------------------------------- | ------------------------------------------- | -------------------------------- |
| 1st       | `AGENT_README.md`                  | Quick orientation + rules summary           | New hard rules added             |
| 2nd       | `TASK_COMPLETION_SUMMARY.md`       | What has been done — prevents re-doing work | **After every task**             |
| 3rd       | `project-overview.md`              | Full tech stack, folder structure, deps     | New files/folders/deps added     |
| 4th       | `api.md`                           | RTK Query setup, base URL, auth headers     | API layer pattern changes        |
| 5th       | `auth.md`                          | Auth flow, token storage, `useAuth()` API   | Auth flow changes                |
| 6th       | `state.md`                         | Redux slices, state shapes, persisted keys  | Any Redux slice added or changed |
| 7th       | `screens-kyc.md`                   | KYC screen inventory, navigation flow       | KYC screens modified or added    |
| 8th       | `error-handling.md`                | Toast, loading state, validation display    | Error patterns change            |
| 9th       | `api-contracts-task03.md`          | All wired endpoint request/response shapes  | Any new endpoint wired           |
| 10th      | `conventions.md`                   | Folder rules, naming, styling tokens        | Conventions change               |
| As needed | `TROUBLESHOOTING.md`               | Known issues and fixes                      | New issue solved                 |
| As needed | `BUILD_FIX_SUMMARY.md`             | Build error history                         | Build errors fixed               |
| As needed | `PROJECT_STRUCTURE_AND_SUMMARY.md` | Deep folder reference                       | —                                |

---

## ✅ Pre-Task Checklist

Run through every item before writing any code:

```
[ ] 1. Read .context/AGENT_README.md
[ ] 2. Read .context/TASK_COMPLETION_SUMMARY.md  ← know what's already done
[ ] 3. Read .context/project-overview.md
[ ] 4. Read .context/state.md
[ ] 5. Read task-specific .context/ files (api.md, screens-kyc.md, api-contracts-task03.md)
[ ] 6. Fetch live API spec: GET https://backend-nanoloan.giize.com/api-json
        (required for any task touching API endpoints)
[ ] 7. Read every source file you plan to modify — never assume its contents
```

---

## ✅ Post-Task Checklist — Required After Every Task

```
[ ] 1. .context/TASK_COMPLETION_SUMMARY.md
        Add a dated entry. Include:
        - What was implemented (bullet list)
        - Every file CREATED (path + purpose)
        - Every file MODIFIED (path + what changed)
        - Known issues or limitations
        - Next steps / what is still pending

[ ] 2. .context/state.md
        If any Redux slice was CREATED or CHANGED:
        - Document the new/updated state shape
        - Document new action names and signatures
        - Update RootState shape section
        - Update persistConfig whitelist section if changed

[ ] 3. .context/api-contracts-task03.md
        If any new API endpoint was WIRED:
        - Add full TypeScript request body interface
        - Add full TypeScript response interface
        - Add the RTK hook name and import path
        - Add usage example
        - Add to the Response Flow section if relevant

[ ] 4. .context/project-overview.md
        If any new FILE or FOLDER was CREATED:
        - Add it to the folder structure section
        - Document its exports

[ ] 5. .context/screens-kyc.md (or create a new screen doc)
        If any SCREEN was created or modified:
        - Document its purpose
        - Document its API connections (endpoint + hook)
        - Document navigation: what leads to it, where it goes next
        - Mark ✅ or ⏳ status

[ ] 6. .context/auth.md
        If AUTH FLOW changed:
        - Update token access patterns
        - Update useAuth() API section

[ ] 7. .context/AGENT_README.md
        If new hard rules were established:
        - Add to the rules list at the bottom of that file
```

### Minimum acceptable update (every task, no exceptions)

Even for a one-line fix: **add a dated entry to `TASK_COMPLETION_SUMMARY.md`**.
One sentence is enough for trivial changes. Zero updates is never acceptable.

---

## 🏗️ Tech Stack Reference

| Layer         | Technology                                          |
| ------------- | --------------------------------------------------- |
| Framework     | React Native 0.81.5 + Expo SDK 54                   |
| Language      | TypeScript 5.9.2 (strict mode)                      |
| Routing       | Expo Router 6.0.23 (file-based)                     |
| State         | Redux Toolkit 2.11.2 + Redux Persist 6.0.0          |
| API calls     | RTK Query (built into Redux Toolkit)                |
| Storage       | AsyncStorage (`@token`, `@user`, `@deviceToken`)    |
| Styling       | NativeWind v4 (Tailwind CSS utility classes)        |
| Camera/OCR    | expo-camera + @react-native-ml-kit/text-recognition |
| Notifications | Firebase Cloud Messaging                            |
| Build         | Android SDK 36, Gradle 8.14.3, ProGuard enabled     |

---

## 📁 Key Folder Structure

```
nanoloan/
├── app/                          # Expo Router pages (route = file path)
│   ├── (tabs)/                   # Bottom tab screens
│   ├── auth/                     # login, register, email-otp, basic-info, addresses
│   ├── kyc/                      # KYC verification screens
│   ├── bank/                     # Bank account screens  ⏳ screens pending
│   └── loans/                    # Loan application screens  ⏳ screens pending
│
├── modules/                      # Feature modules (types + hooks + actions)
│   ├── bank/
│   │   └── types/index.ts        # BankAccount, BankTransaction types
│   ├── loan/
│   │   └── types/index.ts        # LoanSummary, LoanDetail, LoanStatus types
│   ├── home/                     # Home feature (useHome, useAddress, homeService)
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   └── verify-email/
│
├── shared/
│   ├── components/               # Reusable UI components
│   ├── config/index.ts           # API URL — NEVER hardcode elsewhere
│   ├── contexts/AuthContext.tsx  # Auth context + useAuth() hook
│   ├── hooks/                    # useToast, useAppSelector, useSafePadding
│   └── libs/redux/
│       ├── apiSlice.ts           # RTK Query base (tagTypes live here)
│       ├── store.ts              # Redux store + persist config
│       └── features/
│           ├── auth/             # authSlice + authApi
│           ├── kyc/              # kycSlice
│           ├── biometric/        # biometricApi
│           ├── bank/             # bankSlice + bankApi         (added Task 04)
│           └── loan/             # loanApi                     (added Task 04)
│
├── types/                        # Global TypeScript types
├── .context/                     # AI agent memory — READ AND UPDATE
├── AGENTS.md                     # This file
└── CLAUDE.md                     # Claude Code specific instructions
```

**Path aliases** (tsconfig.json):

```typescript
"@/*"             → "./*"
"@/components/*"  → "shared/components/*"
"@/shared/*"      → "shared/*"
"@/app/*"         → "app/*"
```

---

## 🔌 API Layer

### Base URL

```typescript
import { apiUrl } from '@/shared/config';
// https://backend-nanoloan.giize.com — RTK Query adds /v1 automatically
```

### Adding a new endpoint

```typescript
import { apiSlice } from '@/shared/libs/redux/apiSlice';

export const myApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    doSomething: builder.mutation<ResponseType, RequestType>({
      query: (body) => ({ url: '/endpoint-path', method: 'POST', body }),
      invalidatesTags: ['TagName'],
    }),
    getSomething: builder.query<ResponseType, void>({
      query: () => ({ url: '/endpoint-path', method: 'GET' }),
      providesTags: ['TagName'],
    }),
  }),
});
```

Add new tag names to `tagTypes` in `shared/libs/redux/apiSlice.ts` — never duplicate.

### Auth header

Auto-injected by `apiSlice.ts`. **Never add `Authorization` manually.**

### Standard response envelope

```typescript
{ success: true,  message: string, data: T }
{ success: false, message: string, errors?: string[] | Record<string,string[]> }
```

---

## 🗄️ Current Redux State

| Slice  | File                         | Persisted | Key fields                                    |
| ------ | ---------------------------- | --------- | --------------------------------------------- |
| `auth` | `features/auth/authSlice.ts` | ✅        | user, token, isAuthenticated                  |
| `kyc`  | `features/kyc/kycSlice.ts`   | ✅        | selectedIdType, biometricSessionId, imageUris |
| `bank` | `features/bank/bankSlice.ts` | ✅        | selectedAccountId                             |
| `api`  | RTK Query cache              | ❌        | query/mutation cache                          |

**persistConfig whitelist**: `['auth', 'kyc', 'bank']`

---

## 🗺️ Current RTK Query Hooks

### Auth / User (`features/auth/authApi.ts`)

`useLoginMutation`, `useRegisterMutation`, `useVerifyEmailMutation`, `useResendOtpMutation`,
`useForgotPasswordMutation`, `useVerifyResetOtpMutation`, `useResetPasswordMutation`,
`useCheckEmailQuery`, `useCheckUsernameQuery`, `useGetMeQuery`, `useUpdateProfileMutation`,
`useUpdateBasicInfoMutation`, `useChangePasswordMutation`, `useDeleteAccountMutation`,
`useAddAddressMutation`, `useUpdateAddressMutation`

### Biometric (`features/biometric/biometricApi.ts`)

`useStartVerificationMutation`, `useVerifyIdMutation`, `useVerifyAddressMutation`,
`useVerifyFaceMutation`, `useGetBiometricStatusQuery`

### Bank (`features/bank/bankApi.ts`) — added Task 04

`useGetAccountsQuery`, `useSetPrimaryAccountMutation`, `useGetAccountQuery`, `useGetAccountTransactionsQuery`

### Loan (`features/loan/loanApi.ts`) — added Task 04

`useGetMyLoansQuery`, `useCheckEligibilityMutation`, `useApplyLoanMutation`, `useCancelLoanMutation`

> **Note**: `useGetMyLoanDetailQuery` (GET /v1/loans/my/:id) is not yet in loanApi — add when building loan-detail screen.

---

## 🗺️ Screen Status

### Auth + KYC (complete)

```
app/auth/basic-information        → PUT /v1/users/me + PUT /v1/users/me/basic-info  ✅
app/auth/addresses-update         → POST /v1/users/me/addresses                     ✅
app/kyc/started                   → POST /v1/biometric/start                        ✅
app/kyc/id-capture-preview        → POST /v1/biometric/id-verify                   ✅
app/kyc/address-capture-preview   → POST /v1/biometric/address-verify              ✅
app/kyc/facial-recognition        → POST /v1/biometric/face-verify                 ⏳ not wired
```

### Home (data layer complete, screens pending)

```
app/(tabs)/index.tsx              → GET /v1/bank/accounts + GET /v1/loans/my       ✅ wired
app/bank/accounts.tsx             → GET /v1/bank/accounts                          ⏳ screen not built
app/bank/account-detail.tsx       → GET /v1/bank/accounts/:id                      ⏳ screen not built
app/loans/check-eligibility.tsx   → POST /v1/loans/check-eligibility               ⏳ screen not built
app/loans/apply.tsx               → POST /v1/loans/apply                           ⏳ screen not built
app/loans/thank-you.tsx           → (post-submit screen)                           ⏳ screen not built
app/loans/my-loans.tsx            → GET /v1/loans/my                               ⏳ screen not built
app/loans/loan-detail.tsx         → GET /v1/loans/my/:id                           ⏳ screen not built
```

**Always check `.context/TASK_COMPLETION_SUMMARY.md` for the latest status before building any screen.**

---

## 🎨 Styling Rules

- NativeWind `className` prop only — never `StyleSheet.create` for new code
- Primary green: `#00C897` | Dark header: `#0D2B1E` | Card bg: `#F0FFF4` | Input bg: `#E4F7EE`
- Text primary: `#1A1A1A` | Text secondary: `#888` | Error: `#FF4444` | Warning: `#FF9800`
- Cards: `rounded-2xl` | Buttons: `rounded-2xl` | White section top: `rounded-tl-[40px] rounded-tr-[40px]`
- Padding: `px-5` horizontal | `pt-12 pb-6` screen top section

---

## 🚨 Error Handling Rules

```typescript
import { useToast } from '@/shared/hooks/useToast';
const { showSuccess, showError } = useToast();

try {
  const result = await doApiCall().unwrap();
  showSuccess({ title: 'Success', message: result.message });
  router.push('/next-screen');
} catch (error: any) {
  if (error?.status === 422 && error?.data?.errors) {
    // show per-field errors inline
  } else {
    showError({ title: 'Error', message: error?.data?.message || 'Something went wrong' });
  }
}
```

---

## ❌ Absolute Rules — Never Violate

1. **NEVER hardcode** the API URL — use `apiUrl` from `shared/config/index.ts`
2. **NEVER use `fetch()` directly** — RTK Query hooks only
3. **NEVER attach `Authorization` headers manually** — `apiSlice.ts` does it
4. **NEVER skip TypeScript types** — all API shapes must be typed interfaces
5. **NEVER use `StyleSheet.create`** for new UI — NativeWind `className` only
6. **NEVER add new HTTP libraries** — RTK Query is the only allowed client
7. **NEVER duplicate `tagTypes`** in `apiSlice.ts` — check before adding
8. **NEVER skip error handling** — every `.unwrap()` needs try/catch + toast
9. **NEVER skip loading states** — every mutation needs disabled button + ActivityIndicator
10. **NEVER finish a task without updating `.context/`** — minimum: one entry in `TASK_COMPLETION_SUMMARY.md`

---

## 📝 .context/ Update Copy-Paste Templates

### TASK_COMPLETION_SUMMARY.md — new entry

```markdown
---

## ✅ Task XX: [Short Task Name]

**Date**: YYYY-MM-DD
**Status**: ✅ COMPLETE

### What Was Done

- [bullet list of changes]

### Files Created

| File              | Purpose      |
| ----------------- | ------------ |
| `path/to/file.ts` | What it does |

### Files Modified

| File              | What Changed |
| ----------------- | ------------ |
| `path/to/file.ts` | Description  |

### Known Issues / Next Steps

- [ ] Next thing to build
```

### state.md — new slice entry

```markdown
## [Name] State (Added Task XX — YYYY-MM-DD)

**Location**: `shared/libs/redux/features/[name]/[name]Slice.ts`
**Persisted**: ✅ Yes / ❌ No

interface [Name]State { field: type; }
Actions: set[Field](payload), clear[Field]()
```

### api-contracts-task03.md — new endpoint entry

```markdown
### [METHOD] `/v1/path/here`

**RTK Hook**: `useXxxMutation()` / `useGetXxxQuery()`
**Purpose**: One-sentence description.
**Request**: interface XxxRequest { field: type; }
**Response**: { success: true, data: { field: type } }
```

---

_Last updated: 2026-05-19 — Update this file whenever project structure, APIs, or hard rules change._
