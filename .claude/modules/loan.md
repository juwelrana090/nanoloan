# Loan Module
> Last updated: 2026-05-20 by /r-memory scan

## Purpose
Handles loan eligibility checking, loan applications, and loan management.

## Files
- `modules/loan/types/index.ts` - LoanSummary, LoanDetail, eligibility types
- `shared/libs/redux/features/loan/loanApi.ts` - RTK Query endpoints
- `app/loans/check-eligibility.tsx` - Check loan eligibility screen
- `app/loans/apply.tsx` - Apply for loan screen
- `app/loans/my-loans.tsx` - List user's loans
- `app/loans/loan-detail.tsx` - Loan detail screen
- `app/loans/thank-you.tsx` - Thank you screen after application

## Type Definitions
```typescript
interface LoanSummary {
  id: string;
  loanNumber: string;
  amount: number;
  status: LoanStatus;
  paidAmount?: number;
  remainingAmount?: number;
  nextInstalmentDate?: string;
  nextInstalmentAmount?: number;
  emi?: number;
  // ... other fields
}

interface LoanDetail extends LoanSummary {
  disbursementDate?: string;
  tenure: number;
  interestRate: number;
  purpose: string;
  instalments: Instalment[];
}

type LoanStatus = 'PENDING' | 'APPROVED' | 'DISBURSED' | 'ACTIVE' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
```

## Key Endpoints
- `GET /v1/loans/my` - Get customer's loans (with pagination)
- `GET /v1/loans/my/:id` - Get loan detail
- `POST /v1/loans/check-eligibility` - Check loan eligibility
- `POST /v1/loans/apply` - Apply for loan
- `POST /v1/loans/my/:id/cancel` - Cancel loan

## Eligibility Flow
```typescript
interface CheckEligibilityRequest {
  amount: number;
  tenure: number;
  purpose: string;
}

interface EligibilityResult {
  eligible: boolean;
  maxEligibleAmount: number;
  suggestedTenure: number;
  interestRate: number;
  emi: number;
  rejectionReason?: string;
}
```

## Loan Application Flow
1. User checks eligibility on `/loans/check-eligibility`
2. If eligible, proceed to `/loans/apply`
3. Select bank account (from bank module)
4. Submit application with amount, tenure, purpose, bankAccountId
5. Show thank you screen on `/loans/thank-you`
6. View loan status on `/loans/my-loans`

## Dependencies
- Depends on: `bank` module (for bankAccountId), `auth` module (for user profile)
- Used by: HomeScreen (shows loan summary)
- RTK Query tags: `MyLoans` for cache invalidation

## Screens Status
- `app/loans/check-eligibility.tsx` - ⏳ Created, API integration pending
- `app/loans/apply.tsx` - ⏳ Created, API integration pending
- `app/loans/my-loans.tsx` - ⏳ Created, API integration pending
- `app/loans/loan-detail.tsx` - ⏳ Created, API integration pending
- `app/loans/thank-you.tsx` - ⏳ Created, static content

## Notes
- Home screen shows total loan, total due, and next payment
- Loan goals progress shown as percentage
- Active loans filter: `status === 'ACTIVE' || status === 'DISBURSED'`
- Date formatting uses ordinal suffixes (1st, 2nd, 3rd, 4th...)
