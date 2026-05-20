# 🏦 NanoLoan — Loan Application Screens Implementation Prompt

# Task 05 — All Loan + Bank Screens (Data Layer Already Done in Task 04)

> **For local AI agents (Claude Code, Cursor, Copilot, etc.)**
> Read this entire prompt before writing a single line of code.

---

## ⚠️ CRITICAL: What Already Exists — Do NOT Re-Create

Task 04 is complete. The following files **already exist** in the project.
Do NOT overwrite, re-create, or modify these unless the task explicitly says so:

| File                                           | Status      | What it has                                                                                                                                      |
| ---------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `modules/bank/types/index.ts`                  | ✅ EXISTS   | BankAccount, BankTransaction, AccountType, AccountStatus                                                                                         |
| `modules/loan/types/index.ts`                  | ✅ EXISTS   | LoanSummary, LoanDetail, LoanInstalment, LoanStatus, CheckEligibilityRequest, EligibilityResult, LoanApplicationRequest, LoanApplicationResponse |
| `shared/libs/redux/features/bank/bankApi.ts`   | ✅ EXISTS   | useGetAccountsQuery, useSetPrimaryAccountMutation, useGetAccountQuery, useGetAccountTransactionsQuery                                            |
| `shared/libs/redux/features/bank/bankSlice.ts` | ✅ EXISTS   | selectedAccountId state, setSelectedAccount action                                                                                               |
| `shared/libs/redux/features/loan/loanApi.ts`   | ✅ EXISTS   | useGetMyLoansQuery, useCheckEligibilityMutation, useApplyLoanMutation, useCancelLoanMutation                                                     |
| `shared/libs/redux/store.ts`                   | ✅ MODIFIED | bankReducer added, 'bank' in whitelist                                                                                                           |
| `shared/libs/redux/apiSlice.ts`                | ✅ MODIFIED | BankAccounts + MyLoans in tagTypes                                                                                                               |
| `app/(tabs)/index.tsx`                         | ✅ MODIFIED | Wired to real bank + loan API data                                                                                                               |
| `app/bank/_layout.tsx`                         | ✅ EXISTS   | Stack layout, headerShown: false                                                                                                                 |
| `app/bank/accounts.tsx`                        | ⚠️ STUB     | Placeholder only — needs full implementation                                                                                                     |
| `app/bank/account-detail.tsx`                  | ⚠️ STUB     | Placeholder only — needs full implementation                                                                                                     |
| `app/loans/_layout.tsx`                        | ✅ EXISTS   | Stack layout, headerShown: false                                                                                                                 |
| `app/loans/check-eligibility.tsx`              | ⚠️ STUB     | Placeholder only — needs full implementation                                                                                                     |
| `app/loans/apply.tsx`                          | ⚠️ STUB     | Placeholder only — needs full implementation                                                                                                     |
| `app/loans/thank-you.tsx`                      | ⚠️ STUB     | Placeholder only — needs full implementation                                                                                                     |
| `app/loans/my-loans.tsx`                       | ⚠️ STUB     | Placeholder only — needs full implementation                                                                                                     |
| `app/loans/loan-detail.tsx`                    | ⚠️ STUB     | Placeholder only — needs full implementation                                                                                                     |

**Missing from loanApi.ts** (add this before building loan-detail screen):

```typescript
// Add to shared/libs/redux/features/loan/loanApi.ts
useGetMyLoanDetailQuery(id: string)  // GET /v1/loans/my/:id
```

---

## 🎯 Mission

Replace all stub screens with full Figma-pixel-perfect implementations.
All data layer (RTK Query hooks, Redux slices, TypeScript types) is already done.
This task is **screens only**.

Screens to implement (9 total):

| Screen            | File                              | Figma                   | Status  |
| ----------------- | --------------------------------- | ----------------------- | ------- |
| My Accounts       | `app/bank/accounts.tsx`           | `94-2678`               | ⚠️ stub |
| Account Detail    | `app/bank/account-detail.tsx`     | `33-2510`               | ⚠️ stub |
| Check Eligibility | `app/loans/check-eligibility.tsx` | `55-23921`              | ⚠️ stub |
| Apply for Loan    | `app/loans/apply.tsx`             | `135-1095`              | ⚠️ stub |
| Thank You         | `app/loans/thank-you.tsx`         | `57-24035`              | ⚠️ stub |
| My Loans          | `app/loans/my-loans.tsx`          | `144-6441`              | ⚠️ stub |
| Loan Detail       | `app/loans/loan-detail.tsx`       | `144-4560` + `144-6302` | ⚠️ stub |

---

## 📋 MANDATORY PRE-TASK CHECKLIST

```
[ ] 1.  Read AGENTS.md (project root) — full file
[ ] 2.  Read CLAUDE.md (project root) — full file
[ ] 3.  Read .context/AGENT_README.md
[ ] 4.  Read .context/TASK_COMPLETION_SUMMARY.md  ← know exactly what Task 04 did
[ ] 5.  Read .context/state.md  ← bankSlice shape + how to read selectedAccountId
[ ] 6.  Read .context/api-contracts-task03.md  ← all endpoint contracts
[ ] 7.  Read .context/error-handling.md  ← toast patterns
[ ] 8.  Read .context/conventions.md  ← naming, folder rules
[ ] 9.  Fetch live API spec: GET https://backend-nanoloan.giize.com/api-json
        → Confirm field names match what's in modules/bank/types + modules/loan/types
        → If any field names differ, update the types files to match live spec
[ ] 10. Read modules/bank/types/index.ts  ← exact interface field names
[ ] 11. Read modules/loan/types/index.ts  ← exact interface field names
[ ] 12. Read shared/libs/redux/features/bank/bankApi.ts  ← exact hook names
[ ] 13. Read shared/libs/redux/features/loan/loanApi.ts  ← exact hook names
[ ] 14. Read shared/libs/redux/features/bank/bankSlice.ts ← setSelectedAccount action
[ ] 15. Read shared/hooks/useToast.ts  ← showSuccess/showError signatures
[ ] 16. Read shared/config/index.ts  ← API URL constant name
[ ] 17. Read app/kyc/id-capture-preview.tsx  ← existing screen pattern to copy
[ ] 18. Read the STUB file for each screen before replacing it
```

Only after all 18 items — start coding.

---

## 🎨 Figma Design References

Figma file: `https://www.figma.com/design/5Fqdm9dDSbBFJjBEvcODpJ/Nano-Loan`

Open **each frame in dev mode** before coding its screen.
Extract exact: font sizes, font weights, colors, spacing (px), border radii, icon names, shadow values.

| Screen               | Figma URL                                                                              |
| -------------------- | -------------------------------------------------------------------------------------- |
| My Accounts          | `https://www.figma.com/design/5Fqdm9dDSbBFJjBEvcODpJ/Nano-Loan?node-id=94-2678&m=dev`  |
| Account Transactions | `https://www.figma.com/design/5Fqdm9dDSbBFJjBEvcODpJ/Nano-Loan?node-id=33-2510&m=dev`  |
| Check Eligibility    | `https://www.figma.com/design/5Fqdm9dDSbBFJjBEvcODpJ/Nano-Loan?node-id=55-23921&m=dev` |
| Apply for Loan       | `https://www.figma.com/design/5Fqdm9dDSbBFJjBEvcODpJ/Nano-Loan?node-id=135-1095&m=dev` |
| My Loans List        | `https://www.figma.com/design/5Fqdm9dDSbBFJjBEvcODpJ/Nano-Loan?node-id=144-6441&m=dev` |
| Loan Detail          | `https://www.figma.com/design/5Fqdm9dDSbBFJjBEvcODpJ/Nano-Loan?node-id=144-4560&m=dev` |
| Instalment Schedule  | `https://www.figma.com/design/5Fqdm9dDSbBFJjBEvcODpJ/Nano-Loan?node-id=144-6302&m=dev` |
| Thank You            | `https://www.figma.com/design/5Fqdm9dDSbBFJjBEvcODpJ/Nano-Loan?node-id=57-24035&m=dev` |

**Design tokens (use exactly — do not invent new values):**

```
Primary green:    #00C897
Dark green:       #0D2B1E
Card bg:          #F0FFF4
Input bg:         #E4F7EE
Text primary:     #1A1A1A
Text secondary:   #888888
Error:            #FF4444
Warning/Pending:  #FF9800
Border radius:    rounded-2xl (cards, buttons, inputs)
H padding:        px-5 (20px)
Screen top:       pt-12
```

---

## 🔌 API Contracts

> These are already implemented in `bankApi.ts` and `loanApi.ts`.
> Use these hook names exactly — do not re-implement.

### Bank Hooks (from `shared/libs/redux/features/bank/bankApi.ts`)

```typescript
// List all accounts for logged-in customer
const { data, isLoading, refetch } = useGetAccountsQuery();
// data.data: BankAccount[]

// Single account + recent transactions
const { data, isLoading } = useGetAccountQuery(accountId);
// data.data: { account: BankAccount, transactions: BankTransaction[] }

// Set primary account
const [setPrimary, { isLoading }] = useSetPrimaryAccountMutation();
await setPrimary(accountId).unwrap();

// Paginated transactions
const { data } = useGetAccountTransactionsQuery(accountId);
// data.data: { transactions: BankTransaction[], total: number, page: number }
```

### Loan Hooks (from `shared/libs/redux/features/loan/loanApi.ts`)

```typescript
// Customer's loan list
const { data, isLoading, refetch } = useGetMyLoansQuery();
// data.data: { loans: LoanSummary[], total: number }

// Eligibility check
const [checkEligibility, { isLoading }] = useCheckEligibilityMutation();
const result = await checkEligibility({ amount, tenure }).unwrap();
// result.data: EligibilityResult

// Submit application
const [applyLoan, { isLoading }] = useApplyLoanMutation();
const result = await applyLoan({ amount, tenure, purpose, bankAccountId }).unwrap();
// result.data: LoanApplicationResponse

// Cancel loan
const [cancelLoan, { isLoading }] = useCancelLoanMutation();
await cancelLoan(loanId).unwrap();

// ⚠️ ADD THIS to loanApi.ts before building loan-detail screen:
// useGetMyLoanDetailQuery(id: string) → GET /v1/loans/my/:id
// Response: { success: true, data: LoanDetail }
```

### Redux Bank State

```typescript
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { useAppDispatch } from '@/shared/hooks/useAppSelector'; // or from store
import { setSelectedAccount } from '@/shared/libs/redux/features/bank/bankSlice';

// Read selected account
const selectedAccountId = useAppSelector((state) => state.bank.selectedAccountId);

// Set selected account (for loan application)
const dispatch = useAppDispatch();
dispatch(setSelectedAccount(accountId));
```

### Key Response Types

```typescript
interface BankAccount {
  id: string;
  accountNumber: string; // 17 digits, starts with 172
  accountType: 'PERSONAL' | 'BUSINESS' | 'SAVINGS';
  accountName: string;
  bankName: string;
  balance: number; // BDT
  status: 'ACTIVE' | 'INACTIVE' | 'FROZEN';
  isPrimary: boolean;
  createdAt: string;
}

interface BankTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  transactionType: 'LOAN_DISBURSEMENT' | 'LOAN_REPAYMENT' | 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  balanceAfter: number;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

type LoanStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'DISBURSED'
  | 'ACTIVE'
  | 'CLOSED'
  | 'CANCELLED';

interface LoanSummary {
  id: string;
  loanNumber: string; // LN-YYYY-NNNNN
  amount: number;
  tenure: number; // months
  emi: number;
  status: LoanStatus;
  paidAmount?: number;
  remainingAmount?: number;
  nextInstalmentDate?: string;
  nextInstalmentAmount?: number;
  createdAt: string;
}

interface LoanDetail {
  id: string;
  loanNumber: string;
  amount: number;
  tenure: number;
  emi: number;
  interestRate: number;
  purpose: string;
  status: LoanStatus;
  bankAccount: BankAccount;
  instalments: LoanInstalment[];
  statusLogs: LoanStatusLog[];
  createdAt: string;
}

interface LoanInstalment {
  id: string;
  instalmentNumber: number;
  dueDate: string;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  paidAt?: string;
  paidAmount?: number;
}

interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  maxAmount?: number;
  minAmount?: number;
  maxTenure?: number;
  minTenure?: number;
  estimatedEmi?: number;
  interestRate?: number;
}

interface LoanApplicationResponse {
  id: string;
  loanNumber: string;
  amount: number;
  tenure: number;
  emi: number;
  status: 'PENDING';
  customerName: string;
  nextSteps: string[];
  createdAt: string;
}
```

---

## 🏗️ Screen Implementation Specs

Implement screens in this order — each depends on the previous being done.

---

### Screen 1: My Accounts (`app/bank/accounts.tsx`)

**Figma**: `node-id=94-2678`
**Hook**: `useGetAccountsQuery()`

**Layout:**

- Green header (`bg-[#00C897]`) with back button + title "My Accounts"
- Safe area top padding
- White scrollable body below header
- Account cards in a vertical list with `gap-3` spacing

**Each Account Card:**

```
┌─────────────────────────────────────────────┐
│  [Bank Icon]  Personal Account   [PRIMARY]  │
│               172*****6987                  │
│               Nano Bank                     │
│               ৳ 45,000.00        [Set Primary]│
└─────────────────────────────────────────────┘
```

- `isPrimary: true` → show green "Primary" badge, hide "Set Primary" button, card border `border-[#00C897]`
- `isPrimary: false` → show "Set Primary" button (outlined green), card border none
- Account number masking: `num.slice(0,3) + '*****' + num.slice(-4)`
- Balance: `৳${balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
- Tap card body → navigate to `/bank/account-detail?id=${acc.id}`
- "Set Primary" tap → `setPrimary(acc.id)` → success toast "Primary account updated" → refetch

**Loading state:** 3 skeleton placeholder cards (`bg-[#F0F0F0] animate-pulse rounded-2xl h-[90px]`)

**Empty state:** Only if no accounts AND API returned successfully — show "No accounts found" with a support contact message (auto-create on login means this rarely happens).

**Navigation:** Back button → `router.back()`

---

### Screen 2: Account Detail (`app/bank/account-detail.tsx`)

**Figma**: `node-id=33-2510`
**Hook**: `useGetAccountQuery(id)` where `id = useLocalSearchParams().id`

**Layout:**

- Green header with back button + account number (masked) as title
- Account summary card (white, `rounded-2xl`, shadow):
  ```
  Balance: ৳ 45,000.00  (large, bold)
  Account No: 172*****6987
  Account Type: Personal | Status: Active
  Bank: Nano Bank — Main Branch
  ```
- "Apply for Loan" CTA button (full width, green):
  - `dispatch(setSelectedAccount(id))`
  - `router.push('/loans/check-eligibility')`
- Section title "Transactions"
- Transaction list (FlatList with `keyExtractor={t => t.id}`)

**Each Transaction Row:**

```
[↑ green / ↓ red icon]  Loan Disbursement        + ৳ 20,000
                         Completed · 15 Jan 2026
```

- `type === 'CREDIT'` → green up-arrow icon, `+৳` prefix, green amount text
- `type === 'DEBIT'` → red down-arrow icon, `-৳` prefix, red amount text
- `transactionType` label mapping:
  ```
  LOAN_DISBURSEMENT → "Loan Disbursement"
  LOAN_REPAYMENT    → "Loan Repayment"
  TRANSFER          → "Transfer"
  DEPOSIT           → "Deposit"
  WITHDRAWAL        → "Withdrawal"
  ```
- Date: `new Date(createdAt).toLocaleDateString('en-BD', { day:'2-digit', month:'short', year:'numeric' })`
- Pull-to-refresh: `refetch()` on pull

**Empty transactions state:** "No transactions yet" centered message.

---

### Screen 3: Check Eligibility (`app/loans/check-eligibility.tsx`)

**Figma**: `node-id=55-23921`
**Hook**: `useCheckEligibilityMutation()`

**Layout:**

- White screen, back button header, title "Check Eligibility"
- Form section:

  ```
  Loan Amount (৳)
  [_______________________]  ← TextInput, keyboardType="numeric"

  Tenure (Months)
  [_______________________]  ← TextInput, keyboardType="numeric"
  ```

- "Check Eligibility" button (full width, green, loading state)
- Result card (shown after API call, below button):
  - **Eligible** → green card:
    ```
    ✅ You are eligible!
    Estimated EMI: ৳ 1,743 / month
    Interest Rate: 9% per annum
    Amount Range: ৳5,000 – ৳100,000
    [Proceed to Apply →]
    ```
  - **Not Eligible** → red/orange card:
    ```
    ❌ Not eligible
    Reason: [reason from API]
    ```

**Validation (before API call):**

- amount must be > 0
- tenure must be between 1 and 60
- Show inline error text below field if invalid (red, `text-[12px]`)

**"Proceed to Apply" button:**

```typescript
router.push({
  pathname: '/loans/apply',
  params: {
    amount: String(amount),
    tenure: String(tenure),
    interestRate: String(result.interestRate ?? 9),
    estimatedEmi: String(result.estimatedEmi ?? 0),
  },
});
```

**selectedAccountId check:**

- Read `selectedAccountId` from Redux at screen mount
- If null → show an info banner: "Select a bank account first" with a link to `/bank/accounts`
- Don't block the eligibility check — just warn

---

### Screen 4: Apply for Loan (`app/loans/apply.tsx`)

**Figma**: `node-id=135-1095`
**Hook**: `useApplyLoanMutation()`, `useGetAccountQuery(selectedAccountId)`

**Route params received from check-eligibility:**

```typescript
const { amount, tenure, interestRate, estimatedEmi } = useLocalSearchParams();
```

**Layout:**

- Back button header, title "Loan Application"
- **Loan Summary card** (green, `rounded-2xl`):
  ```
  Loan Amount:    ৳ 20,000
  Tenure:         12 Months
  Est. EMI:       ৳ 1,743 / month
  Interest Rate:  9% per annum
  ```
- **Selected Bank Account card:**
  ```
  [Bank icon]  Personal Account
               172*****6987
               ৳ 45,000.00
  [Change Account →]
  ```

  - "Change Account" → `router.push('/bank/accounts')`
  - If no selectedAccountId → show "No account selected — tap to choose" card, tapping goes to `/bank/accounts`
- **Purpose field:**
  ```
  Loan Purpose
  [________________________________]  ← multiline TextInput
  [Describe why you need this loan]     min 10 characters
  ```

  - Show character count: `{purpose.length}/500`
  - Show error below if submitted with < 10 chars
- **Submit button** (full width, green, loading state):
  ```typescript
  const handleSubmit = async () => {
    if (!selectedAccountId) {
      showError({ title: 'No Account', message: 'Please select a bank account first' });
      return;
    }
    if (purpose.trim().length < 10) {
      setPurposeError('Minimum 10 characters required');
      return;
    }
    try {
      const result = await applyLoan({
        amount: Number(amount),
        tenure: Number(tenure),
        purpose: purpose.trim(),
        bankAccountId: selectedAccountId,
      }).unwrap();
      router.replace({
        pathname: '/loans/thank-you',
        params: {
          customerName: result.data.customerName,
          loanNumber: result.data.loanNumber,
          amount: String(result.data.amount),
          emi: String(result.data.emi),
          nextSteps: JSON.stringify(result.data.nextSteps),
        },
      });
    } catch (error: any) {
      if (error?.status === 422 && error?.data?.errors) {
        // show inline field errors
      } else {
        showError({ title: 'Error', message: error?.data?.message || 'Application failed' });
      }
    }
  };
  ```

---

### Screen 5: Thank You (`app/loans/thank-you.tsx`)

**Figma**: `node-id=57-24035`
**No API calls — display only**

**Route params received from apply screen:**

```typescript
const { customerName, loanNumber, amount, emi, nextSteps } = useLocalSearchParams();
const parsedNextSteps: string[] = JSON.parse((nextSteps as string) ?? '[]');
```

**Layout:**

- Full white screen, no back button (use `router.replace` from apply so back stack is cleared)
- Large green checkmark or success illustration at top
- `Hi, {customerName}!` heading
- `Your application {loanNumber} has been submitted` subtext
- Summary row: Amount `৳{amount}` | EMI `৳{emi}/month`
- "What happens next?" section:
  - Render `parsedNextSteps` as numbered list items
  ```
  1. Our team will review your application within 24–48 hours.
  2. You will receive an email/SMS notification.
  3. ...
  ```
- Two buttons at bottom:
  ```
  [View My Loans]  ← router.push('/loans/my-loans')
  [Go to Home]     ← router.replace('/(tabs)/')
  ```

  - "View My Loans" → filled green button
  - "Go to Home" → outlined green button

---

### Screen 6: My Loans (`app/loans/my-loans.tsx`)

**Figma**: `node-id=144-6441`
**Hook**: `useGetMyLoansQuery()`

**Layout:**

- Green header, title "My Loans", back button
- Filter tabs row (horizontal scroll):

  ```
  [All] [Pending] [Active] [Approved] [Closed]
  ```

  - Active tab: filled green pill
  - Inactive tab: transparent with grey text
  - Filter locally: `loans.filter(l => activeFilter === 'All' || l.status === activeFilter)`

- Loan cards (FlatList):
  ```
  ┌───────────────────────────────────────┐
  │  LN-2026-00001              [PENDING] │
  │  ৳ 20,000.00                          │
  │  EMI: ৳1,743/month  · 12 months      │
  │  Applied: 19 May 2026                 │
  └───────────────────────────────────────┘
  ```

  - Tap → `router.push({ pathname: '/loans/loan-detail', params: { id: loan.id } })`

**Status badge colors:**

```typescript
const statusColor: Record<LoanStatus, string> = {
  PENDING: '#FF9800',
  UNDER_REVIEW: '#FF9800',
  APPROVED: '#00C897',
  DISBURSED: '#00C897',
  ACTIVE: '#00C897',
  REJECTED: '#FF4444',
  CANCELLED: '#FF4444',
  CLOSED: '#888888',
};
const statusBg: Record<LoanStatus, string> = {
  PENDING: '#FFF3E0',
  UNDER_REVIEW: '#FFF3E0',
  APPROVED: '#E8FFF5',
  DISBURSED: '#E8FFF5',
  ACTIVE: '#E8FFF5',
  REJECTED: '#FFEBEE',
  CANCELLED: '#FFEBEE',
  CLOSED: '#F5F5F5',
};
```

**Pull-to-refresh:** `refetch()`

**Empty state:**

```
No loans found.
[Apply for Your First Loan →]  ← router.push('/loans/check-eligibility')
```

---

### Screen 7: Loan Detail (`app/loans/loan-detail.tsx`)

**Figma**: `node-id=144-4560` + `node-id=144-6302`

**First: Add `useGetMyLoanDetailQuery` to `loanApi.ts`:**

```typescript
getMyLoanDetail: builder.query<ApiSuccessResponse<LoanDetail>, string>({
  query: (id) => ({ url: `/loans/my/${id}`, method: 'GET' }),
  providesTags: ['MyLoans'],
}),
// export: useGetMyLoanDetailQuery
```

**Route params:**

```typescript
const { id } = useLocalSearchParams<{ id: string }>();
const { data, isLoading, refetch } = useGetMyLoanDetailQuery(id);
const loan = data?.data;
```

**Layout (ScrollView):**

**Section 1 — Header card (green bg):**

```
← Back          Loan Detail

LN-2026-00001
৳ 20,000.00               [ACTIVE]
9% per annum · 12 months
EMI: ৳ 1,743 / month
Purpose: Home renovation
```

**Section 2 — Bank Account:**

```
Disbursement Account
[Bank icon]  Personal · 172*****6987
             Nano Bank
```

**Section 3 — Progress:**

```
Repayment Progress
[████████░░░░░░░░]  4 / 12 paid
৳ 6,972 paid of ৳ 20,907 total
```

- Progress bar: `(paidAmount / amount) * 100` width %

**Section 4 — Instalment Schedule (Figma 144-6302):**

```
Instalment Schedule

No.  Due Date        Amount    Status
1    01 Jan 2026    ৳1,743    ✅ PAID
2    01 Feb 2026    ৳1,743    ✅ PAID
3    01 Mar 2026    ৳1,743    🔴 OVERDUE
4    01 Apr 2026    ৳1,743    ⬜ PENDING
...
```

- PAID row: green text, `✅` icon, show `paidAt` date
- OVERDUE row: red badge
- PENDING row: grey badge

**Section 5 — Status Timeline:**

```
Status History
● PENDING      19 May 2026
● UNDER_REVIEW 20 May 2026
● APPROVED     21 May 2026
```

**Cancel Button (conditional):**

```typescript
{loan.status === 'PENDING' && (
  <TouchableOpacity
    onPress={handleCancel}
    className="mt-4 rounded-2xl border border-[#FF4444] py-4 items-center">
    <Text className="text-[#FF4444] font-semibold">Cancel Application</Text>
  </TouchableOpacity>
)}
```

**Cancel handler:**

```typescript
const handleCancel = () => {
  Alert.alert('Cancel Application', 'Are you sure you want to cancel this loan application?', [
    { text: 'No', style: 'cancel' },
    {
      text: 'Yes, Cancel',
      style: 'destructive',
      onPress: async () => {
        try {
          await cancelLoan(id).unwrap();
          showSuccess({ title: 'Cancelled', message: 'Loan application cancelled' });
          router.back();
        } catch (err: any) {
          showError({ title: 'Error', message: err?.data?.message || 'Failed to cancel' });
        }
      },
    },
  ]);
};
```

**Pull-to-refresh:** `refetch()`

---

## 🛠️ Shared Utilities — Define Once, Import Everywhere

Create `shared/utils/formatting.ts` (if not already exists):

```typescript
// Currency
export const formatTaka = (amount: number): string =>
  `৳${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Account number mask
export const maskAccountNumber = (num: string): string =>
  num.length >= 7 ? `${num.slice(0, 3)}*****${num.slice(-4)}` : num;

// Short date: "15 Jan 2026"
export const formatShortDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

// Ordinal date: "15th January 2026"
export const formatOrdinalDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  const day = d.getDate();
  const s = [, 'st', 'nd', 'rd'][((day % 100) >> 3) ^ 1 && day % 10] || 'th';
  return `${day}${s} ${d.toLocaleString('en-US', { month: 'long' })} ${d.getFullYear()}`;
};

// EMI formula
export const calculateEmi = (principal: number, annualRate: number, months: number): number => {
  const r = annualRate / 12 / 100;
  if (r === 0) return Math.round(principal / months);
  return Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
};
```

---

## 🔄 Standard Screen Template

```tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { useAppDispatch } from '@/shared/hooks/useAppSelector';
import { useToast } from '@/shared/hooks/useToast';
import { useSomeMutation } from '@/shared/libs/redux/features/loan/loanApi';
import { formatTaka, maskAccountNumber, formatShortDate } from '@/shared/utils/formatting';

export default function ScreenName() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const [doSomething, { isLoading }] = useSomeMutation();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    try {
      const result = await doSomething(payload).unwrap();
      showSuccess({ title: 'Success', message: result.message });
      router.push('/next-screen');
    } catch (error: any) {
      if (error?.status === 422 && error?.data?.errors) {
        // handle field errors
      } else {
        showError({ title: 'Error', message: error?.data?.message || 'Something went wrong' });
      }
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Green header */}
      <View className="bg-[#00C897] px-5 pb-6 pt-12">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          {/* Back arrow icon */}
        </TouchableOpacity>
        <Text className="text-[22px] font-bold text-white">Screen Title</Text>
      </View>

      {/* White body */}
      <View className="px-5 pb-10 pt-5">
        {/* content */}
        <TouchableOpacity
          className={`mt-6 items-center rounded-2xl py-4 ${isLoading ? 'opacity-60' : ''} bg-[#00C897]`}
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

## ❌ Hard Rules — Never Violate

1. **NEVER re-create** files that already exist from Task 04 (see table at top)
2. **NEVER hardcode** the API URL — use `apiUrl` from `shared/config/index.ts`
3. **NEVER use `fetch()` directly** — RTK Query hooks only
4. **NEVER attach `Authorization` headers manually** — apiSlice.ts does it
5. **NEVER use `StyleSheet.create`** — NativeWind `className` only
6. **NEVER skip loading states** — every mutation needs `isLoading` + disabled button + ActivityIndicator
7. **NEVER skip error handling** — every `.unwrap()` needs try/catch + showError toast
8. **NEVER skip TypeScript** — no implicit `any`
9. **NEVER use `router.push` for Thank You** — use `router.replace` so back button skips the form
10. **ALWAYS update `.context/`** after completing the task

---

## ✅ Definition of Done

All items must be true before calling this task complete:

- [ ] `app/bank/accounts.tsx` — full implementation, matches Figma 94-2678
- [ ] `app/bank/account-detail.tsx` — full implementation, matches Figma 33-2510
- [ ] `app/loans/check-eligibility.tsx` — full implementation, matches Figma 55-23921
- [ ] `app/loans/apply.tsx` — full implementation, matches Figma 135-1095
- [ ] `app/loans/thank-you.tsx` — full implementation, matches Figma 57-24035
- [ ] `app/loans/my-loans.tsx` — full implementation, matches Figma 144-6441
- [ ] `app/loans/loan-detail.tsx` — full implementation, matches Figma 144-4560 + 144-6302
- [ ] `useGetMyLoanDetailQuery` added to `loanApi.ts`
- [ ] `shared/utils/formatting.ts` created with formatTaka, maskAccountNumber, formatShortDate
- [ ] All status badge colors correct (PENDING=orange, ACTIVE=green, REJECTED=red, CLOSED=grey)
- [ ] Cancel loan shows Alert confirmation, works only for PENDING status
- [ ] Thank You screen uses `router.replace` (not push)
- [ ] Pull-to-refresh on accounts, account-detail, my-loans, loan-detail
- [ ] All screens have loading skeleton or ActivityIndicator while fetching
- [ ] `npx tsc --noEmit` passes with zero new errors
- [ ] `.context/TASK_COMPLETION_SUMMARY.md` updated with Task 05 entry
- [ ] `.context/screens-kyc.md` (or new `.context/screens-loans.md`) updated

---

## 📝 .context/ Updates Required After This Task

```
.context/TASK_COMPLETION_SUMMARY.md
  → Add Task 05 entry with all files created/modified

.context/screens-loans.md  (create new file)
  → Document each loan/bank screen:
     - Route, Figma node, API hooks used, navigation in/out

.context/api-contracts-task03.md
  → Add GET /v1/loans/my/:id contract (useGetMyLoanDetailQuery)

.context/project-overview.md
  → Add shared/utils/formatting.ts to folder structure
```

---

_Prompt version: May 2026 v2 — Updated after Task 04 completion. Screens-only task._
_Data layer (bankApi, loanApi, bankSlice, types) already implemented — do not re-create._
