import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafePadding } from '@/shared/hooks/useSafePadding';
import {
  useGetAccountsQuery,
  useSetPrimaryAccountMutation,
} from '@/shared/libs/redux/features/bank/bankApi';
import { useToast } from '@/shared/hooks/useToast';
import type { BankAccount } from '@/modules/bank/types';
import { ChevronRightIcon, SyncIcon } from '@/shared/components/UI/icons/svg-icons';

const formatTaka = (amount: number): string =>
  `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const maskAccountNumber = (num: string): string =>
  num.length >= 7 ? `${num.slice(0, 3)}*****${num.slice(-4)}` : num;

export default function AccountsScreen() {
  const router = useRouter();
  const { paddingTop, scrollPaddingBottom } = useSafePadding();
  const { showSuccess, showError } = useToast();

  const {
    data: accountsData,
    isLoading,
    refetch,
    isFetching,
  } = useGetAccountsQuery();

  const [setPrimary, { isLoading: settingPrimary }] = useSetPrimaryAccountMutation();

  const accounts: BankAccount[] = Array.isArray(accountsData?.data) ? accountsData.data : [];

  const handleSetPrimary = async (accountId: string) => {
    try {
      await setPrimary(accountId).unwrap();
      showSuccess({ title: 'Success', message: 'Primary account updated' });
      refetch();
    } catch (err: unknown) {
      const error = err as { status?: number; data?: { message?: string } };
      showError({ title: 'Error', message: error?.data?.message ?? 'Failed to set primary account' });
    }
  };

  const handleAccountPress = (accountId: string) => {
    router.push(`/bank/account-detail?id=${accountId}` as any);
  };

  return (
    <View className="flex-1 bg-[#F0FFF4]">
      {/* Header */}
      <View style={{ paddingTop }} className="bg-white px-5 pb-4 shadow-sm">
        <View className="mt-4 flex-row items-center justify-between">
          <Text className="text-[22px] font-bold text-[#1A1A1A]">My Accounts</Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="h-9 w-9 items-center justify-center rounded-full bg-[#F0FFF4]"
            disabled={isFetching}>
            {isFetching ? (
              <ActivityIndicator size="small" color="#00C897" />
            ) : (
              <SyncIcon color="#00C897" size={18} />
            )}
          </TouchableOpacity>
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
        <View className="p-5">
          {isLoading ? (
            // Loading skeletons
            <>
              {[1, 2, 3].map((i) => (
                <View key={i} className="mb-4 h-[120px] rounded-2xl bg-[#E0E0E0]" />
              ))}
            </>
          ) : accounts.length === 0 ? (
            // Empty state
            <View className="items-center py-16">
              <Text className="mb-2 text-4xl">🏦</Text>
              <Text className="mb-1 text-[18px] font-bold text-[#1A1A1A]">No Accounts Found</Text>
              <Text className="text-[14px] text-[#888] text-center">
                You don't have any bank accounts yet. They should be created automatically when you log in.
              </Text>
              <TouchableOpacity
                onPress={() => refetch()}
                className="mt-6 rounded-2xl bg-[#00C897] px-6 py-3">
                <Text className="text-[14px] font-semibold text-white">Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Account list
            accounts.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                onPress={() => handleAccountPress(acc.id)}
                activeOpacity={0.8}
                className={`mb-4 rounded-2xl p-5 shadow-sm ${
                  acc.isPrimary ? 'bg-[#E4F7EE] border border-[#00C897]' : 'bg-white'
                }`}>
                {/* Top row: Account type + badges */}
                <View className="mb-3 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[16px] font-bold text-[#1A1A1A]">
                      {acc.accountType.charAt(0) + acc.accountType.slice(1).toLowerCase()}
                    </Text>
                    {acc.isPrimary && (
                      <View className="rounded-full bg-[#00C897] px-2 py-0.5">
                        <Text className="text-[11px] font-semibold text-white">Primary</Text>
                      </View>
                    )}
                    {acc.status === 'ACTIVE' ? (
                      <View className="rounded-full bg-[#E4F7EE] px-2 py-0.5">
                        <Text className="text-[11px] font-semibold text-[#00C897]">Active</Text>
                      </View>
                    ) : (
                      <View className="rounded-full bg-[#FFE0E0] px-2 py-0.5">
                        <Text className="text-[11px] font-semibold text-[#FF4444]">
                          {acc.status === 'INACTIVE' ? 'Inactive' : 'Frozen'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <ChevronRightIcon color={acc.isPrimary ? '#00C897' : '#CCC'} size={20} />
                </View>

                {/* Account number */}
                <Text className="mb-1 text-[14px] text-[#888]">{maskAccountNumber(acc.accountNumber)}</Text>

                {/* Account name */}
                <Text className="mb-3 text-[14px] font-semibold text-[#1A1A1A]">{acc.accountName}</Text>

                {/* Bank name + Balance row */}
                <View className="flex-row items-center justify-between">
                  <Text className="text-[13px] text-[#888]">{acc.bankName}</Text>
                  <Text className="text-[18px] font-bold text-[#00C897]">{formatTaka(acc.balance)}</Text>
                </View>

                {/* Set as Primary button (only for non-primary accounts) */}
                {!acc.isPrimary && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleSetPrimary(acc.id);
                    }}
                    activeOpacity={0.8}
                    disabled={settingPrimary}
                    className="mt-4 h-[36px] items-center justify-center rounded-xl bg-[#00C897]">
                    {settingPrimary ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-[13px] font-semibold text-white">Set as Primary</Text>
                    )}
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
