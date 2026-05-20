import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafePadding } from '@/shared/hooks/useSafePadding';
import { useGetAccountQuery } from '@/shared/libs/redux/features/bank/bankApi';
import { useAppDispatch } from '@/shared/hooks/useAppSelector';
import { setSelectedAccount } from '@/shared/libs/redux/features/bank/bankSlice';
import type { BankTransaction } from '@/modules/bank/types';
import { ArrowLeftIcon } from '@/shared/components/UI/icons/svg-icons';

const formatTaka = (amount: number): string =>
  `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const maskAccountNumber = (num: string): string =>
  num.length >= 7 ? `${num.slice(0, 3)}*****${num.slice(-4)}` : num;

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getTransactionLabel = (type: string): string => {
  const labels: Record<string, string> = {
    LOAN_DISBURSEMENT: 'Loan Disbursement',
    LOAN_REPAYMENT: 'Loan Repayment',
    TRANSFER: 'Transfer',
    DEPOSIT: 'Deposit',
    WITHDRAWAL: 'Withdrawal',
  };
  return labels[type] || type;
};

export default function AccountDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { paddingTop, scrollPaddingBottom } = useSafePadding();
  const dispatch = useAppDispatch();

  const accountId = params.id as string;

  const { data, isLoading, refetch, isFetching } = useGetAccountQuery(accountId, {
    skip: !accountId,
  });

  const account = data?.data?.account;
  const transactions: BankTransaction[] = Array.isArray(data?.data?.transactions)
    ? data.data.transactions
    : [];

  const handleApplyLoan = () => {
    if (account) {
      dispatch(setSelectedAccount(account.id));
      router.push('/loans/check-eligibility' as any);
    }
  };

  if (!accountId) {
    return (
      <View className="flex-1 bg-[#F0FFF4] items-center justify-center px-5">
        <Text className="mb-4 text-4xl">⚠️</Text>
        <Text className="mb-2 text-[18px] font-bold text-[#1A1A1A]">Invalid Account</Text>
        <Text className="mb-6 text-[14px] text-[#888] text-center">No account ID provided</Text>
        <TouchableOpacity onPress={() => router.back()} className="rounded-2xl bg-[#00C897] px-6 py-3">
          <Text className="text-[14px] font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading && !account) {
    return (
      <View className="flex-1 bg-[#F0FFF4] items-center justify-center">
        <ActivityIndicator size="large" color="#00C897" />
      </View>
    );
  }

  if (!account) {
    return (
      <View className="flex-1 bg-[#F0FFF4] items-center justify-center px-5">
        <Text className="mb-4 text-4xl">🏦</Text>
        <Text className="mb-2 text-[18px] font-bold text-[#1A1A1A]">Account Not Found</Text>
        <Text className="mb-6 text-[14px] text-[#888] text-center">
          The requested account could not be found
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="rounded-2xl bg-[#00C897] px-6 py-3">
          <Text className="text-[14px] font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F0FFF4]">
      {/* Header */}
      <View style={{ paddingTop }} className="bg-white px-5 pb-4 shadow-sm">
        <View className="mt-4 mb-2 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-[#F0FFF4]">
            <ArrowLeftIcon color="#00C897" size={18} />
          </TouchableOpacity>
          <Text className="flex-1 text-[18px] font-bold text-[#1A1A1A]">Account Details</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: scrollPaddingBottom + 20 }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor="#00C897"
            colors={['#00C897']}
          />
        }>
        {/* Account Summary Card */}
        <View className="m-5 rounded-2xl bg-white p-5 shadow-sm">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-[14px] text-[#888]">Account Number</Text>
            <Text className="text-[16px] font-bold text-[#1A1A1A]">
              {maskAccountNumber(account.accountNumber)}
            </Text>
          </View>

          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-[14px] text-[#888]">Account Type</Text>
            <Text className="text-[16px] font-semibold text-[#1A1A1A]">
              {account.accountType.charAt(0) + account.accountType.slice(1).toLowerCase()}
            </Text>
          </View>

          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-[14px] text-[#888]">Balance</Text>
            <Text className="text-[20px] font-bold text-[#00C897]">{formatTaka(account.balance)}</Text>
          </View>

          <View className="h-1 bg-[#F0F0F0]" />

          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-[14px] text-[#888]">Bank</Text>
            <Text className="text-[14px] font-semibold text-[#1A1A1A]">{account.bankName}</Text>
          </View>

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-[14px] text-[#888]">Branch</Text>
            <Text className="text-[14px] text-[#1A1A1A]">{account.branchName}</Text>
          </View>

          {account.isPrimary && (
            <View className="mt-4 rounded-xl bg-[#E4F7EE] px-3 py-2">
              <Text className="text-center text-[13px] font-semibold text-[#00C897]">
                ✓ Primary Account
              </Text>
            </View>
          )}
        </View>

        {/* Apply for Loan CTA */}
        <View className="mx-5 mb-5 rounded-2xl bg-[#00C897] p-5">
          <Text className="mb-2 text-[18px] font-bold text-[#0D2B1E]">Apply for a Loan</Text>
          <Text className="mb-4 text-[13px] leading-5 text-[#0D2B1E]/80">
            Get quick access to funds with your Nano Bank account
          </Text>
          <TouchableOpacity
            onPress={handleApplyLoan}
            activeOpacity={0.8}
            className="h-[40px] items-center justify-center rounded-xl bg-white">
            <Text className="text-[14px] font-semibold text-[#1A1A1A]">Check Eligibility</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions Section */}
        <View className="mx-5">
          <Text className="mb-3 text-[16px] font-bold text-[#1A1A1A]">Recent Transactions</Text>

          {transactions.length === 0 ? (
            <View className="rounded-2xl bg-white p-8">
              <Text className="mb-2 text-center text-3xl">📝</Text>
              <Text className="text-center text-[14px] text-[#888]">No transactions yet</Text>
            </View>
          ) : (
            transactions.map((txn, index) => (
              <View
                key={txn.id}
                className={`rounded-2xl bg-white p-4 ${index > 0 ? 'mt-3' : ''}`}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="mb-1 text-[15px] font-semibold text-[#1A1A1A]">
                      {getTransactionLabel(txn.transactionType)}
                    </Text>
                    {txn.description && (
                      <Text className="mb-2 text-[13px] text-[#888]">{txn.description}</Text>
                    )}
                    <Text className="text-[12px] text-[#999]">{formatDate(txn.createdAt)}</Text>
                  </View>

                  <View className="items-end">
                    <Text
                      className={`text-[16px] font-bold ${
                        txn.type === 'CREDIT' ? 'text-[#00C897]' : 'text-[#FF4444]'
                      }`}>
                      {txn.type === 'CREDIT' ? '+' : '-'}
                      {formatTaka(txn.amount)}
                    </Text>
                    <View
                      className={`mt-1 rounded-full px-2 py-0.5 ${
                        txn.status === 'COMPLETED'
                          ? 'bg-[#E4F7EE]'
                          : txn.status === 'PENDING'
                            ? 'bg-[#FFF8E1]'
                            : 'bg-[#FFE0E0]'
                      }`}>
                      <Text
                        className={`text-[11px] font-semibold ${
                          txn.status === 'COMPLETED'
                            ? 'text-[#00C897]'
                            : txn.status === 'PENDING'
                              ? 'text-[#FF9800]'
                              : 'text-[#FF4444]'
                        }`}>
                        {txn.status === 'COMPLETED' ? 'Completed' : txn.status === 'PENDING' ? 'Pending' : 'Failed'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Balance after */}
                <View className="mt-3 h-1 bg-[#F0F0F0]" />
                <View className="mt-2 flex-row items-center justify-between">
                  <Text className="text-[12px] text-[#888]">Balance after</Text>
                  <Text className="text-[13px] font-semibold text-[#1A1A1A]">
                    {formatTaka(txn.balanceAfter)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
