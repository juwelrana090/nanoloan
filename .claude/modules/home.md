# Home Module
> Last updated: 2026-05-20 by /r-memory scan

## Purpose
Home screen logic, including biometric status checking, account switching, and loan summary display.

## Files
- `modules/home/actions/homeActions.ts` - Home-specific actions
- `modules/home/services/homeService.ts` - Home API service (minimal, most via RTK Query)
- `modules/home/hooks/useHome.ts` - Custom hook for biometric status
- `modules/home/hooks/useAddress.ts` - Address-related hooks
- `modules/home/types/index.ts` - Home-specific types
- `app/(tabs)/index.tsx` - Main home screen
- `app/(tabs)/analysis.tsx` - Analysis screen
- `app/(tabs)/category.tsx` - Category screen
- `app/(tabs)/profile.tsx` - Profile screen
- `app/(tabs)/transactions.tsx` - Transactions screen

## Biometric Status Hook
```typescript
const { biometricStatus, isLoading, fetchStatus } = useBiometricStatus();

interface BiometricStatus {
  idVerified: boolean;
  addressVerified: boolean;
  faceVerified: boolean;
  overallStatus: string;
}
```

## Home Screen Features
1. **Verification Modal** - Shows when KYC incomplete
2. **Account Switcher** - Bottom sheet for switching primary account
3. **Loan Summary** - Total loan, total due, progress bar
4. **Next Payment** - Shows upcoming payment amount and date
5. **Quick Actions** - Check eligibility, view my loans buttons

## Account Switching Flow
```typescript
const handleSwitchAccount = async (accountId: string) => {
  await setPrimary(accountId).unwrap();  // API call
  dispatch(setSelectedAccount(accountId));  // Update Redux
  showSuccess({ title: 'Account Switched' });
  refetchAccounts();  // Refresh data
};
```

## Data Fetching
- Bank accounts: `useGetAccountsQuery()`
- Loans: `useGetMyLoansQuery()`
- Biometric status: `useGetBiometricStatusQuery()`
- Pull-to-refresh: Refetches all data

## Derived Calculations
```typescript
// Total loan from active loans
const totalLoan = activeLoans.reduce((sum, l) => sum + l.amount, 0);

// Total due loan
const totalDueLoan = activeLoans.reduce((sum, l) => sum + (l.remainingAmount ?? 0), 0);

// Loan goal progress percentage
const loanGoalProgress = totalLoan > 0 ? Math.round((totalPaid / totalLoan) * 100) : 0;

// Next payment (earliest instalment date)
const nextPaymentLoan = activeLoans
  .filter((l) => l.nextInstalmentDate)
  .sort((a, b) => new Date(a.nextInstalmentDate!).getTime() - new Date(b.nextInstalmentDate!).getTime())[0];
```

## Helper Functions
```typescript
// Mask account number for security
const maskAccountNumber = (num: string): string =>
  num.length >= 7 ? `${num.slice(0, 3)}*****${num.slice(-4)}` : num;

// Format currency (Bangladeshi Taka)
const formatTaka = (amount: number): string =>
  `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Format date with ordinal suffix
const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  const day = d.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? 'st'
    : day === 2 || day === 22 ? 'nd'
    : day === 3 || day === 23 ? 'rd'
    : 'th';
  return `${day}${suffix} ${d.toLocaleString('en-US', { month: 'long' })} ${d.getFullYear()}`;
};
```

## Dependencies
- Depends on: `bank` module, `loan` module, `auth` module
- Uses: PanResponder for bottom sheet gestures
- Uses: Animated API for bottom sheet animations

## Notes
- Home screen is the main dashboard after login
- Green header with white card design
- RefreshControl for pull-to-refresh
- Bottom sheet with PanResponder for swipe-to-close
