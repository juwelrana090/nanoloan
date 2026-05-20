import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRef, useState, useEffect } from 'react';
import { useSafePadding } from '@/shared/hooks/useSafePadding';
import { router } from 'expo-router';
import { useBiometricStatus } from '@/modules/home/hooks/useHome';
import {
  NotificationIcon,
  RoundBDTIcon,
  BankAccountIcon,
  TotalLoanIcon,
  TotalDueLoanIcon,
  NextLoanIcon,
  DateIcon,
  BDTSymbolIcon,
  SyncIcon,
  ChevronRightIcon,
} from '@/shared/components/UI/icons/svg-icons';
import {
  useGetAccountsQuery,
  useSetPrimaryAccountMutation,
} from '@/shared/libs/redux/features/bank/bankApi';
import { useGetMyLoansQuery } from '@/shared/libs/redux/features/loan/loanApi';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/useAppSelector';
import { setSelectedAccount } from '@/shared/libs/redux/features/bank/bankSlice';
import { useToast } from '@/shared/hooks/useToast';
import type { BankAccount } from '@/modules/bank/types';
import type { LoanSummary } from '@/modules/loan/types';

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
  const accounts: BankAccount[] = Array.isArray(accountsData?.data) ? accountsData.data : [];
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
    .sort((a, b) => new Date(a.nextInstalmentDate!).getTime() - new Date(b.nextInstalmentDate!).getTime())[0];
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

  // Check if verification is needed
  const needsVerification =
    !bioLoading &&
    biometricStatus &&
    (!biometricStatus.idVerified ||
      !biometricStatus.addressVerified ||
      !biometricStatus.faceVerified);

  // Get the next verification step
  const getNextVerificationRoute = () => {
    if (!biometricStatus) return null;

    // Check in order: ID → Address → Face
    // if (!biometricStatus.idVerified) {
    //   return '/kyc/select-id-type';
    // }
    // if (!biometricStatus.addressVerified) {
    //   return '/kyc/address-roles';
    // }
    // if (!biometricStatus.faceVerified) {
    //   return '/kyc/facial-recognition';
    // }
    return 'auth/basic-information';
  };

  const handleVerifyPress = () => {
    const route = getNextVerificationRoute();
    if (route) {
      router.push(route as any);
    }
  };

  const openSheet = () => {
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80) closeSheet();
        else Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  console.log('biometricStatus', biometricStatus);
  console.log('accountsData', accountsData);
  console.log('loansData', loansData);

  return (
    <View style={{ flex: 1, backgroundColor: '#00C897' }}>
      {/* ── VERIFICATION MODAL ─────────────────────────────────────── */}
      <Modal visible={needsVerification === true} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            {/* Icon */}
            <View className="mb-4 items-center">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-[#FFF8E1]">
                <Text className="text-3xl">🔒</Text>
              </View>
            </View>

            {/* Title */}
            <Text className="mb-2 text-center text-[22px] font-bold text-[#1A1A1A]">
              Verification Required
            </Text>

            {/* Message */}
            <Text className="mb-6 text-center text-[14px] leading-5 text-[#666]">
              {(!biometricStatus?.idVerified && 'Verify your ID to continue using the app') ||
                (!biometricStatus?.addressVerified &&
                  'Verify your address to continue using the app') ||
                (!biometricStatus?.faceVerified &&
                  'Complete facial recognition to continue using the app') ||
                'Complete verification to access all features'}
            </Text>

            {/* Verification Steps */}
            <View className="mb-6 flex flex-col gap-2">
              <View className="flex-row items-center gap-3">
                <View
                  className={`h-6 w-6 items-center justify-center rounded-full ${
                    biometricStatus?.idVerified ? 'bg-[#00C897]' : 'bg-[#E0E0E0]'
                  }`}>
                  {biometricStatus?.idVerified && (
                    <Text className="text-[10px] font-bold text-white">✓</Text>
                  )}
                </View>
                <Text
                  className={`flex-1 text-[13px] ${
                    biometricStatus?.idVerified ? 'text-[#999]' : 'text-[#1A1A1A]'
                  }`}>
                  ID Verification
                </Text>
              </View>

              <View className="flex-row items-center gap-3">
                <View
                  className={`h-6 w-6 items-center justify-center rounded-full ${
                    biometricStatus?.addressVerified ? 'bg-[#00C897]' : 'bg-[#E0E0E0]'
                  }`}>
                  {biometricStatus?.addressVerified && (
                    <Text className="text-[10px] font-bold text-white">✓</Text>
                  )}
                </View>
                <Text
                  className={`flex-1 text-[13px] ${
                    biometricStatus?.addressVerified ? 'text-[#999]' : 'text-[#1A1A1A]'
                  }`}>
                  Address Verification
                </Text>
              </View>

              <View className="flex-row items-center gap-3">
                <View
                  className={`h-6 w-6 items-center justify-center rounded-full ${
                    biometricStatus?.faceVerified ? 'bg-[#00C897]' : 'bg-[#E0E0E0]'
                  }`}>
                  {biometricStatus?.faceVerified && (
                    <Text className="text-[10px] font-bold text-white">✓</Text>
                  )}
                </View>
                <Text
                  className={`flex-1 text-[13px] ${
                    biometricStatus?.faceVerified ? 'text-[#999]' : 'text-[#1A1A1A]'
                  }`}>
                  Facial Recognition
                </Text>
              </View>
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              onPress={handleVerifyPress}
              activeOpacity={0.8}
              className="h-[52px] items-center justify-center rounded-2xl bg-[#00C897]">
              <Text className="text-[16px] font-bold text-white">
                {(!biometricStatus?.idVerified && 'Verify ID') ||
                  (!biometricStatus?.addressVerified && 'Verify Address') ||
                  (!biometricStatus?.faceVerified && 'Complete Facial Recognition') ||
                  'Complete Verification'}
              </Text>
            </TouchableOpacity>

            {/* Note */}
            <Text className="mt-4 text-center text-[12px] text-[#999]">
              You need to complete all verification steps to use the app
            </Text>
          </View>
        </View>
      </Modal>

      {/* ── GREEN HEADER ─────────────────────────────────────────── */}
      <View style={{ paddingTop }} className="px-5 pb-5">
        {/* Row 1 — Greeting + Bell */}
        <View className="mb-1 mt-3 flex-row items-start justify-between">
          <View>
            <Text className="text-[24px] font-extrabold leading-7 text-[#0D2B1E]">
              Hi, Welcome Back
            </Text>
            <Text className="mt-0.5 text-[13px] text-[#0D2B1E]/70">Good Morning</Text>
          </View>
          <TouchableOpacity
            className="h-[42px] w-[42px] items-center justify-center rounded-full bg-[#DFF7E2]"
            activeOpacity={0.8}>
            <NotificationIcon color="#093030" size={16} />
          </TouchableOpacity>
        </View>

        {/* Row 2 — Account + Switcher */}
        <View className="mb-4 mt-4 flex-row items-center justify-between">
          <View>
            <Text className="text-[12px] text-[#0D2B1E]/60">Account</Text>
            <Text className="text-[16px] font-bold text-[#0D2B1E]">
              {primaryAccount ? maskAccountNumber(primaryAccount.accountNumber) : '---'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={openSheet}
            activeOpacity={0.8}
            className="flex-row items-center gap-3">
            <View className="h-[38px] w-[38px] items-center justify-center">
              <RoundBDTIcon color="#FFFFFF" size={38} />
            </View>
            <View className="h-6 w-[1px] bg-white/40" />
            <TouchableOpacity onPress={() => router.push('/bank/accounts' as any)}>
              <View className="h-[38px] w-[38px] items-center justify-center">
                <BankAccountIcon color="#FFFFFF" size={38} />
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Row 3 — Total Loan | Total Due Loan */}
        <View className="mb-5 flex-row items-start">
          <View className="flex-1 pr-4">
            <View className="mb-1 flex-row items-center gap-1">
              <TotalLoanIcon color="#052224" size={12} />
              <Text className="text-[12px] text-[#0D2B1E]/70">Total Loan</Text>
            </View>
            <Text className="text-[26px] font-extrabold leading-8 text-[#0D2B1E]">
              {formatTaka(totalLoan)}
            </Text>
          </View>
          <View className="w-[1px] self-stretch bg-[#0D2B1E]/20" />
          <View className="flex-1 pl-4">
            <View className="mb-1 flex-row items-center gap-1">
              <TotalDueLoanIcon color="#052224" size={12} />
              <Text className="text-[12px] text-[#0D2B1E]/70">Total Due Loan</Text>
            </View>
            <Text className="text-[26px] font-extrabold leading-8 text-red-400">
              -{formatTaka(totalDueLoan)}
            </Text>
          </View>
        </View>

        {/* Row 4 — Progress bar */}
        <View className="flex-row items-center gap-2">
          <View className="h-[30px] flex-1 flex-row items-center rounded-full bg-[#0D2B1E] px-3">
            <Text className="mr-2 text-[12px] font-bold text-white">{loanGoalProgress}%</Text>
            <View className="h-[5px] flex-1 rounded-full bg-white/20">
              <View
                className="h-full rounded-full bg-white"
                style={{ width: `${loanGoalProgress}%` }}
              />
            </View>
          </View>
          <View className="h-[30px] items-center justify-center rounded-full border border-[#0D2B1E]/25 px-3">
            <Text className="text-[12px] font-semibold text-[#0D2B1E]">{formatTaka(totalLoan)}</Text>
          </View>
        </View>
      </View>

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
            <View className="mb-4 flex-row items-stretch rounded-[22px] bg-[#00C897] p-4">
              {/* Left — Circular gauge */}
              <View className="mr-4 items-center justify-center">
                <View className="h-[82px] w-[82px] items-center justify-center rounded-full border-4 border-white/20">
                  <View
                    className="h-[66px] w-[66px] items-center justify-center rounded-full"
                    style={{
                      borderWidth: 4,
                      borderTopColor: 'rgba(255,255,255,0.15)',
                      borderRightColor: 'rgba(255,255,255,0.15)',
                      borderBottomColor: '#5B8DEF',
                      borderLeftColor: '#5B8DEF',
                      transform: [{ rotate: '45deg' }],
                    }}>
                    <View style={{ transform: [{ rotate: '-45deg' }] }}>
                      <BDTSymbolIcon color="white" size={20} />
                    </View>
                  </View>
                </View>
                <Text className="mt-2 text-[12px] font-semibold text-white">Loan Goals</Text>
              </View>

              {/* Divider */}
              <View className="mx-2 w-[1px] self-stretch bg-white/25" />

              {/* Right — Next Payment */}
              <View className="flex-1 justify-center pl-2">
                <View className="mb-2 flex-row items-center gap-2">
                  <NextLoanIcon size={24} />
                  <Text className="text-[12px] text-white/80">Next Loan Payment</Text>
                </View>
                <Text className="mb-3 text-[22px] font-extrabold text-white">
                  {formatTaka(nextPaymentAmount)}
                </Text>
                <View className="mb-3 h-[1px] w-full bg-white/20" />
                <View className="flex-row items-center gap-2">
                  <DateIcon size={22} />
                  <Text className="text-[13px] font-semibold text-white">
                    {formatDate(nextPaymentDate)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Make a loan */}
          <View className="rounded-[22px] bg-[#00C897] p-5">
            <Text className="mb-1 text-[18px] font-extrabold text-[#0D2B1E]">Make a loan</Text>
            <Text className="mb-5 text-[13px] leading-5 text-[#0D2B1E]/70">
              {`we are ready to help you for your awesome work. let's invest there.`}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/loans/check-eligibility' as any)}
              className="h-[36px] items-center justify-center self-start rounded-full bg-white px-5">
              <Text className="text-[13px] font-semibold text-[#1A1A1A]">Create Application</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/loans/my-loans' as any)}
              className="mt-2 h-[36px] items-center justify-center self-start rounded-full border border-[#0D2B1E]/40 px-5">
              <Text className="text-[13px] font-semibold text-[#0D2B1E]">View My Loans</Text>
            </TouchableOpacity>
          </View>

          <View className="h-6" />
        </ScrollView>
      </View>

      {/* ── ACCOUNT SWITCH BOTTOM SHEET ──────────────────────────── */}
      <Modal visible={sheetVisible} transparent animationType="none">
        <TouchableOpacity className="flex-1 bg-black/40" activeOpacity={1} onPress={closeSheet} />
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: SHEET_HEIGHT,
            transform: [{ translateY }],
            backgroundColor: 'white',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingBottom: scrollPaddingBottom,
          }}>
          {/* Drag handle */}
          <View {...panResponder.panHandlers} className="items-center pb-4 pt-3">
            <View className="h-1 w-10 rounded-full bg-[#E0E0E0]" />
          </View>

          <View className="px-5">
            <Text className="mb-4 text-[18px] font-bold text-[#1A1A1A]">My Accounts</Text>

            {/* Sync row */}
            <TouchableOpacity
              onPress={() => refetchAccounts()}
              className="mb-4 h-[46px] flex-row items-center gap-2 rounded-xl bg-[#F5F5F5] px-4">
              <SyncIcon color="#00C897" size={17} />
              <Text className="flex-1 text-[13px] text-[#555]">
                Tap to see recent added accounts
              </Text>
              {accountsLoading ? (
                <ActivityIndicator size="small" color="#00C897" />
              ) : (
                <Text className="text-[13px] font-bold text-[#00C897]">Sync</Text>
              )}
            </TouchableOpacity>

            {/* Account list */}
            {accountsLoading ? (
              <>
                <View className="mb-3 h-[64px] rounded-2xl bg-[#F0F0F0]" />
                <View className="mb-3 h-[64px] rounded-2xl bg-[#F0F0F0]" />
              </>
            ) : (
              accounts.map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  onPress={() => handleSwitchAccount(acc.id)}
                  activeOpacity={0.8}
                  disabled={settingPrimary}
                  className={`mb-3 h-[64px] flex-row items-center justify-between rounded-2xl px-4 ${
                    acc.isPrimary ? 'border border-[#00C897] bg-[#E4F7EE]' : 'bg-[#F9F9F9]'
                  }`}>
                  <View>
                    <Text className="text-[15px] font-bold text-[#1A1A1A]">
                      {acc.accountType.charAt(0) + acc.accountType.slice(1).toLowerCase()}
                    </Text>
                    <Text className="text-[13px] text-[#888]">{maskAccountNumber(acc.accountNumber)}</Text>
                    <Text className="text-[12px] font-semibold text-[#00C897]">{formatTaka(acc.balance)}</Text>
                  </View>
                  <ChevronRightIcon color={acc.isPrimary ? '#00C897' : '#CCC'} size={18} />
                </TouchableOpacity>
              ))
            )}
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
}
