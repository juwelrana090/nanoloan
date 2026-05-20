import React, { useState } from 'react';
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
import { useGetMyLoansQuery } from '@/shared/libs/redux/features/loan/loanApi';
import { ChevronRightIcon } from '@/shared/components/UI/icons/svg-icons';
import type { LoanStatus } from '@/modules/loan/types';

const formatTaka = (amount: number): string =>
  `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' });
};

type FilterTab = 'all' | 'pending' | 'active' | 'closed';

const getStatusColor = (status: LoanStatus): string => {
  switch (status) {
    case 'PENDING':
    case 'UNDER_REVIEW':
      return '#FF9800';
    case 'APPROVED':
    case 'DISBURSED':
    case 'ACTIVE':
      return '#00C897';
    case 'REJECTED':
    case 'CANCELLED':
      return '#FF4444';
    case 'CLOSED':
      return '#888888';
    default:
      return '#888888';
  }
};

const getStatusLabel = (status: LoanStatus): string => {
  const labels: Record<LoanStatus, string> = {
    PENDING: 'Pending',
    UNDER_REVIEW: 'Under Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    DISBURSED: 'Disbursed',
    ACTIVE: 'Active',
    CLOSED: 'Closed',
    CANCELLED: 'Cancelled',
  };
  return labels[status] || status;
};

const filterLoans = (loans: any[], tab: FilterTab): any[] => {
  if (tab === 'all') return loans;
  if (tab === 'pending') return loans.filter((l) => l.status === 'PENDING' || l.status === 'UNDER_REVIEW');
  if (tab === 'active') return loans.filter((l) => l.status === 'ACTIVE' || l.status === 'DISBURSED');
  if (tab === 'closed') return loans.filter((l) => l.status === 'CLOSED' || l.status === 'REJECTED' || l.status === 'CANCELLED');
  return loans;
};

export default function MyLoansScreen() {
  const router = useRouter();
  const { paddingTop, scrollPaddingBottom } = useSafePadding();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const {
    data: loansData,
    isLoading,
    refetch,
    isFetching,
  } = useGetMyLoansQuery();

  const loans = loansData?.data?.loans || [];

  const filteredLoans = filterLoans(loans, activeTab);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'active', label: 'Active' },
    { key: 'closed', label: 'Closed' },
  ];

  const handleLoanPress = (loanId: string) => {
    router.push(`/loans/loan-detail?id=${loanId}` as any);
  };

  return (
    <View className="flex-1 bg-[#F0FFF4]">
      {/* Header */}
      <View style={{ paddingTop }} className="bg-white px-5 pb-4 shadow-sm">
        <View className="mt-4 mb-3">
          <Text className="text-[22px] font-bold text-[#1A1A1A]">My Loans</Text>
        </View>

        {/* Filter Tabs */}
        <View className="flex-row gap-2">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`h-[36px] flex-1 items-center justify-center rounded-xl ${
                activeTab === tab.key ? 'bg-[#00C897]' : 'bg-[#F0FFF4]'
              }`}>
              <Text
                className={`text-[13px] font-semibold ${
                  activeTab === tab.key ? 'text-white' : 'text-[#666]'
                }`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
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
                <View key={i} className="mb-4 h-[140px] rounded-2xl bg-[#E0E0E0]" />
              ))}
            </>
          ) : filteredLoans.length === 0 ? (
            // Empty state
            <View className="py-16">
              <Text className="mb-2 text-center text-4xl">📋</Text>
              <Text className="mb-1 text-center text-[18px] font-bold text-[#1A1A1A]">
                {loans.length === 0 ? 'No Loans Yet' : `No ${activeTab} Loans`}
              </Text>
              <Text className="mb-6 text-center text-[14px] text-[#888]">
                {loans.length === 0
                  ? 'You haven\'t applied for any loans yet'
                  : `You don't have any ${activeTab} loans`}
              </Text>
              {loans.length === 0 && (
                <TouchableOpacity
                  onPress={() => router.push('/loans/check-eligibility' as any)}
                  className="mx-auto h-[44px] items-center justify-center rounded-2xl bg-[#00C897] px-6">
                  <Text className="text-[14px] font-semibold text-white">Apply for Your First Loan</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            // Loan list
            filteredLoans.map((loan) => (
              <TouchableOpacity
                key={loan.id}
                onPress={() => handleLoanPress(loan.id)}
                activeOpacity={0.8}
                className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
                {/* Top row: Loan number + Status badge */}
                <View className="mb-3 flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-[13px] text-[#888]">Loan Number</Text>
                    <Text className="text-[15px] font-bold text-[#1A1A1A]">{loan.loanNumber}</Text>
                  </View>
                  <View
                    className="rounded-full px-3 py-1"
                    style={{ backgroundColor: `${getStatusColor(loan.status)}20` }}>
                    <Text
                      className="text-[12px] font-semibold"
                      style={{ color: getStatusColor(loan.status) }}>
                      {getStatusLabel(loan.status)}
                    </Text>
                  </View>
                </View>

                {/* Amount row */}
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="text-[14px] text-[#888]">Loan Amount</Text>
                  <Text className="text-[18px] font-bold text-[#00C897]">{formatTaka(loan.amount)}</Text>
                </View>

                {/* EMI row */}
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="text-[14px] text-[#888]">EMI</Text>
                  <Text className="text-[15px] font-semibold text-[#1A1A1A]">{formatTaka(loan.emi)}/mo</Text>
                </View>

                {/* Tenure row */}
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="text-[14px] text-[#888]">Tenure</Text>
                  <Text className="text-[15px] text-[#1A1A1A]">{loan.tenure} months</Text>
                </View>

                {/* Progress indicator for active loans */}
                {(loan.status === 'ACTIVE' || loan.status === 'DISBURSED') && (
                  <>
                    <View className="mb-3 h-1 bg-[#F0F0F0]" />
                    <View className="mb-3 flex-row items-center justify-between">
                      <Text className="text-[13px] text-[#888]">Progress</Text>
                      <Text className="text-[13px] font-semibold text-[#00C897]">
                        {loan.paidAmount && loan.remainingAmount
                          ? `${Math.round((loan.paidAmount / loan.amount) * 100)}%`
                          : '0%'}
                      </Text>
                    </View>
                    {loan.paidAmount && loan.remainingAmount && (
                      <View className="h-2 rounded-full bg-[#F0F0F0]">
                        <View
                          className="h-full rounded-full bg-[#00C897]"
                          style={{ width: `${(loan.paidAmount / loan.amount) * 100}%` }}
                        />
                      </View>
                    )}
                  </>
                )}

                {/* Next instalment for active loans */}
                {loan.nextInstalmentDate && (loan.status === 'ACTIVE' || loan.status === 'DISBURSED') && (
                  <View className="mt-3 rounded-xl bg-[#F0FFF4] p-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[13px] text-[#666]">Next Instalment</Text>
                      <Text className="text-[13px] font-semibold text-[#1A1A1A]">
                        {formatDate(loan.nextInstalmentDate)}
                      </Text>
                    </View>
                    <View className="mt-1 flex-row items-center justify-between">
                      <Text className="text-[12px] text-[#888]">Amount</Text>
                      <Text className="text-[13px] font-bold text-[#00C897]">
                        {formatTaka(loan.nextInstalmentAmount || loan.emi)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Chevron right */}
                <ChevronRightIcon color="#CCC" size={18} style={{ position: 'absolute', right: 16, top: '50%', marginTop: -9 }} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
