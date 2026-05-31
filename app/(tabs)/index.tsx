import {
  View,
  ScrollView,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useRef, useState, useEffect } from 'react';
import { useSafePadding } from '@/shared/hooks/useSafePadding';
import { useBiometricStatus } from '@/modules/home/hooks/useHome';
import {
  useGetAccountsQuery,
  useSetPrimaryAccountMutation,
} from '@/shared/libs/redux/features/bank/bankApi';
import { useGetMyLoansQuery } from '@/shared/libs/redux/features/loan/loanApi';
import { useAppDispatch } from '@/shared/hooks/useAppSelector';
import { setSelectedAccount } from '@/shared/libs/redux/features/bank/bankSlice';
import { useToast } from '@/shared/hooks/useToast';
import type { BankAccount } from '@/modules/bank/types';
import type { LoanSummary } from '@/modules/loan/types';
import {
  VerificationModal,
  GreenHeader,
  LoanGoalsCard,
  MakeALoanCard,
  AccountSwitchSheet,
} from '@/modules/home/components';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.44;

// ── HomeScreen ───────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { paddingTop, scrollPaddingBottom } = useSafePadding();
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useToast();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const { biometricStatus, isLoading: bioLoading, fetchStatus } = useBiometricStatus();

  // Bank accounts data
  const {
    data: accountsData,
    isLoading: accountsLoading,
    refetch: refetchAccounts,
  } = useGetAccountsQuery();

  const [setPrimary, { isLoading: settingPrimary }] = useSetPrimaryAccountMutation();

  // Loans data
  const { data: loansData, isLoading: loansLoading, refetch: refetchLoans } = useGetMyLoansQuery();

  // Derived data
  const accounts: BankAccount[] = Array.isArray(accountsData?.data?.accounts) ? accountsData.data.accounts : [];
  const primaryAccount = accounts.find((a) => a.isPrimary) ?? accounts[0] ?? null;

  const loans: LoanSummary[] = Array.isArray(loansData?.data?.loans) ? loansData.data.loans : [];
  const activeLoans = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'DISBURSED');

  // Row 3 — totals
  const totalLoan = activeLoans.reduce((sum, l) => sum + l.amount, 0);
  const totalDueLoan = activeLoans.reduce((sum, l) => sum + (l.remainingAmount ?? 0), 0);

  // Row 4 — progress
  const totalPaid = activeLoans.reduce((sum, l) => sum + (l.paidAmount ?? 0), 0);
  const loanGoalProgress = totalLoan > 0 ? Math.round((totalPaid / totalLoan) * 100) : 0;

  // Next payment (find earliest instalment)
  const nextPaymentLoan = activeLoans
    .filter((l) => l.nextInstalmentDate)
    .sort(
      (a, b) =>
        new Date(a.nextInstalmentDate!).getTime() - new Date(b.nextInstalmentDate!).getTime()
    )[0];
  const nextPaymentAmount = nextPaymentLoan?.nextInstalmentAmount ?? nextPaymentLoan?.emi ?? 0;
  const nextPaymentDate = nextPaymentLoan?.nextInstalmentDate ?? null;

  // Helpers
  const maskAccountNumber = (num: string): string =>
    num.length >= 7 ? `${num.slice(0, 3)}*****${num.slice(-4)}` : num;

  const formatTaka = (amount: number): string =>
    `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const suffix =
      day === 1 || day === 21 || day === 31
        ? 'st'
        : day === 2 || day === 22
          ? 'nd'
          : day === 3 || day === 23
            ? 'rd'
            : 'th';
    return `${day}${suffix} ${d.toLocaleString('en-US', { month: 'long' })} ${d.getFullYear()}`;
  };

  // Fetch biometric status on mount
  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStatus(), refetchAccounts(), refetchLoans()]);
    setRefreshing(false);
  };

  // Handle account switch
  const handleSwitchAccount = async (accountId: string) => {
    try {
      await setPrimary(accountId).unwrap();
      dispatch(setSelectedAccount(accountId));
      showSuccess({ title: 'Account Switched', message: 'Primary account updated' });
      closeSheet();
      refetchAccounts();
    } catch (err: unknown) {
      const error = err as { status?: number; data?: { message?: string } };
      showError({ title: 'Error', message: error?.data?.message ?? 'Failed to switch account' });
    }
  };


  const openAccountModal = () => {
    setSheetVisible(true);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: SHEET_HEIGHT,
      duration: 260,
      useNativeDriver: true,
    }).start(() => setSheetVisible(false));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#00C897' }}>
      {/* ── VERIFICATION MODAL ─────────────────────────────────────── */}
      <VerificationModal biometricStatus={biometricStatus} isLoading={bioLoading} />

      {/* ── GREEN HEADER ─────────────────────────────────────────── */}
      <GreenHeader
        paddingTop={paddingTop}
        accountNumber={primaryAccount ? maskAccountNumber(primaryAccount.accountNumber) : '---'}
        totalLoan={totalLoan}
        totalDueLoan={totalDueLoan}
        loanGoalProgress={loanGoalProgress}
        totalLoanAmount={totalLoan}
        hasActiveLoans={activeLoans.length > 0}
        onOpenAccountModal={openAccountModal}
        formatTaka={formatTaka}
      />

      {/* ── WHITE CARD ───────────────────────────────────────────── */}
      <View className="flex-1 rounded-tl-[40px] rounded-tr-[40px] bg-[#F0FFF4] px-4 pt-6">
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00C897"
              colors={['#00C897']}
            />
          }>
          {/* Loan Goals + Next Payment */}
          {nextPaymentDate !== null && (
            <LoanGoalsCard
              nextPaymentAmount={nextPaymentAmount}
              nextPaymentDate={nextPaymentDate}
              formatTaka={formatTaka}
              formatDate={formatDate}
            />
          )}

          {/* Make a loan */}
          <MakeALoanCard />

          <View className="h-6" />
        </ScrollView>
      </View>

      {/* ── ACCOUNT SWITCH BOTTOM SHEET ──────────────────────────── */}
      <AccountSwitchSheet
        sheetVisible={sheetVisible}
        translateY={translateY}
        sheetHeight={SHEET_HEIGHT}
        scrollPaddingBottom={scrollPaddingBottom}
        accounts={accounts}
        accountsLoading={accountsLoading}
        settingPrimary={settingPrimary}
        onCloseSheet={closeSheet}
        onSwitchAccount={handleSwitchAccount}
        onRefetchAccounts={refetchAccounts}
        maskAccountNumber={maskAccountNumber}
        formatTaka={formatTaka}
      />
    </View>
  );
}
