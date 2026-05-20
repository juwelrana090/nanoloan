# Bank Module
> Last updated: 2026-05-20 by /r-memory scan

## Purpose
Manages bank accounts, account selection for loans, and transaction history.

## Files
- `modules/bank/types/index.ts` - BankAccount, AccountWithTransactions interfaces
- `shared/libs/redux/features/bank/bankSlice.ts` - Redux state for bank
- `shared/libs/redux/features/bank/bankApi.ts` - RTK Query endpoints
- `app/bank/accounts.tsx` - Bank accounts list screen
- `app/bank/account-detail.tsx` - Account detail screen

## State Shape
```typescript
interface BankState {
  selectedAccountId: string | null;  // For loan applications
}
```

## Type Definitions
```typescript
interface BankAccount {
  id: string;
  accountNumber: string;
  accountType: 'PERSONAL' | 'BUSINESS' | 'SAVINGS';
  balance: number;
  isPrimary: boolean;
  bankName: string;
  // ... other fields
}

interface AccountWithTransactions extends BankAccount {
  transactions: unknown[];
  total: number;
  page: number;
}
```

## Key Endpoints
- `GET /v1/bank/accounts` - List all accounts
- `GET /v1/bank/accounts/:id` - Get account with transactions
- `POST /v1/bank/accounts/:id/primary` - Set primary account
- `GET /v1/bank/accounts/:id/transactions` - Get transactions

## Dependencies
- Depends on: `shared/libs/redux/apiSlice`, `shared/libs/types/auth.types.ts`
- Used by: HomeScreen, loan application flow
- Selected account persisted to AsyncStorage

## Integration with Loans
- User selects bank account for loan disbursement
- `selectedAccountId` stored in Redux bankSlice
- Used when submitting loan application

## Screens Status
- `app/bank/accounts.tsx` - ⏳ Created, API integration pending
- `app/bank/account-detail.tsx` - ⏳ Created, API integration pending

## Notes
- Account numbers masked for security (e.g., "123*****4567")
- Primary account shown on home screen
- Bottom sheet for account switching on home screen
