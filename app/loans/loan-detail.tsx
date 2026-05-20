import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafePadding } from '@/shared/hooks/useSafePadding';
import { useGetMyLoanDetailQuery, useCancelLoanMutation } from '@/shared/libs/redux/features/loan/loanApi';
import { useToast } from '@/shared/hooks/useToast';
import { ArrowLeftIcon, ChevronRightIcon } from '@/shared/components/UI/icons/svg-icons';
import type { LoanStatus } from '@/modules/loan/types';

const formatTaka = (amount: number): string =>
  `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' });
};

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

const getInstalmentStatusColor = (status: string): string => {
  switch (status) {
    case 'PAID':
      return '#00C897';
    case 'PENDING':
      return '#888888';
    case 'OVERDUE':
      return '#FF4444';
    default:
      return '#888888';
  }
};

export default function LoanDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { paddingTop, scrollPaddingBottom } = useSafePadding();
  const { showSuccess, showError } = useToast();

  const loanId = params.id as string;

  const { data, isLoading, refetch, isFetching } = useGetMyLoanDetailQuery(loanId, {
    skip: !loanId,
  });

  const [cancelLoan, { isLoading: cancelling }] = useCancelLoanMutation();

  const loan = data?.data;

  const handleCancelLoan = () => {
    if (!loan) return;

    Alert.alert(
      'Cancel Loan Application',
      'Are you sure you want to cancel this loan application? This action cannot be undone.',
      [
        { text: 'No, Keep It', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelLoan(loanId).unwrap();
              showSuccess({ title: 'Success', message: 'Loan application cancelled' });
              router.back();
            } catch (err: unknown) {
              const error = err as { status?: number; data?: { message?: string } };
              showError({ title: 'Error', message: error?.data?.message ?? 'Failed to cancel loan' });
            }
          },
        },
      ]
    );
  };

  if (!loanId) {
    return (
      <View className="flex-1 bg-[#F0FFF4] items-center justify-center px-5">
        <Text className="mb-4 text-4xl">⚠️</Text>
        <Text className="mb-2 text-[18px] font-bold text-[#1A1A1A]">Invalid Loan</Text>
        <Text className="mb-6 text-[14px] text-[#888] text-center">No loan ID provided</Text>
        <TouchableOpacity onPress={() => router.back()} className="rounded-2xl bg-[#00C897] px-6 py-3">
          <Text className="text-[14px] font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading && !loan) {
    return (
      <View className="flex-1 bg-[#F0FFF4] items-center justify-center">
        <ActivityIndicator size="large" color="#00C897" />
      </View>
    );
  }

  if (!loan) {
    return (
      <View className="flex-1 bg-[#F0FFF4] items-center justify-center px-5">
        <Text className="mb-4 text-4xl">📋</Text>
        <Text className="mb-2 text-[18px] font-bold text-[#1A1A1A]">Loan Not Found</Text>
        <Text className="mb-6 text-[14px] text-[#888] text-center">The requested loan could not be found</Text>
        <TouchableOpacity onPress={() => router.back()} className="rounded-2xl bg-[#00C897] px-6 py-3">
          <Text className="text-[14px] font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate progress
  const totalPaid = loan.instalments.filter((i) => i.status === 'PAID').reduce((sum, i) => sum + (i.paidAmount || i.amount), 0);
  const progress = loan.amount > 0 ? Math.round((totalPaid / loan.amount) * 100) : 0;

  return (
    <View className="flex-1 bg-[#F0FFF4]">
      {/* Header */}
      <View style={{ paddingTop }} className="bg-white px-5 pb-4 shadow-sm">
        <View className="mt-4 mb-2 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-[#F0FFF4]">
            <ArrowLeftIcon color="#00C897" size={18} />
          </TouchableOpacity>
          <Text className="flex-1 text-[18px] font-bold text-[#1A1A1A]">Loan Details</Text>
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
        {/* Loan Summary Card */}
        <View className="m-5 rounded-2xl bg-white p-5 shadow-sm">
          {/* Loan number + Status */}
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-[13px] text-[#888]">Loan Number</Text>
              <Text className="text-[16px] font-bold text-[#1A1A1A]">{loan.loanNumber}</Text>
            </View>
            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: `${getStatusColor(loan.status)}20` }}>
              <Text className="text-[12px] font-semibold" style={{ color: getStatusColor(loan.status) }}>
                {getStatusLabel(loan.status)}
              </Text>
            </View>
          </View>

          <View className="h-1 bg-[#F0F0F0]" />

          {/* Amount */}
          <View className="mt-4 mb-3 flex-row items-center justify-between">
            <Text className="text-[14px] text-[#888]">Loan Amount</Text>
            <Text className="text-[20px] font-bold text-[#00C897]">{formatTaka(loan.amount)}</Text>
          </View>

          {/* EMI */}
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-[14px] text-[#888]">EMI</Text>
            <Text className="text-[16px] font-semibold text-[#1A1A1A]">{formatTaka(loan.emi)}/month</Text>
          </View>

          {/* Interest Rate */}
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-[14px] text-[#888]">Interest Rate</Text>
            <Text className="text-[16px] font-semibold text-[#1A1A1A]">{loan.interestRate}% p.a.</Text>
          </View>

          {/* Tenure */}
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-[14px] text-[#888]">Tenure</Text>
            <Text className="text-[16px] text-[#1A1A1A]">{loan.tenure} months</Text>
          </View>

          {/* Purpose */}
          <View className="flex-row items-start justify-between">
            <Text className="text-[14px] text-[#888]">Purpose</Text>
            <Text className="flex-1 ml-4 text-right text-[14px] text-[#1A1A1A]" numberOfLines={2}>
              {loan.purpose || 'N/A'}
            </Text>
          </View>

          {/* Progress bar (for active/disbursed/closed loans) */}
          {(loan.status === 'ACTIVE' || loan.status === 'DISBURSED' || loan.status === 'CLOSED') && (
            <>
              <View className="mt-4 h-1 bg-[#F0F0F0]" />
              <View className="mt-4 mb-2 flex-row items-center justify-between">
                <Text className="text-[13px] text-[#888]">Repayment Progress</Text>
                <Text className="text-[13px] font-bold text-[#00C897]">{progress}%</Text>
              </View>
              <View className="h-2 rounded-full bg-[#F0F0F0]">
                <View
                  className="h-full rounded-full bg-[#00C897]"
                  style={{ width: `${progress}%` }}
                />
              </View>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="text-[12px] text-[#888]">Paid: {formatTaka(totalPaid)}</Text>
                <Text className="text-[12px] text-[#888]">Total: {formatTaka(loan.amount)}</Text>
              </View>
            </>
          )}
        </View>

        {/* Bank Account */}
        {loan.bankAccount && (
          <View className="mx-5 mb-5 rounded-2xl bg-white p-4 shadow-sm">
            <Text className="mb-3 text-[14px] font-semibold text-[#1A1A1A]">Disbursement Account</Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-[#1A1A1A]">{loan.bankAccount.accountName}</Text>
                <Text className="text-[13px] text-[#888]">{loan.bankAccount.accountNumber}</Text>
              </View>
              <ChevronRightIcon color="#CCC" size={18} />
            </View>
          </View>
        )}

        {/* Instalment Schedule */}
        <View className="mx-5 mb-5">
          <Text className="mb-3 text-[16px] font-bold text-[#1A1A1A]">Instalment Schedule</Text>

          {loan.instalments.length === 0 ? (
            <View className="rounded-2xl bg-white p-8">
              <Text className="text-center text-[14px] text-[#888]">No instalments available yet</Text>
            </View>
          ) : (
            <View className="rounded-2xl bg-white p-4 shadow-sm">
              {loan.instalments.map((instalment, index) => (
                <View key={instalment.id}>
                  <View className="flex-row items-center">
                    {/* Instalment number */}
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F0F0F0]">
                      <Text className="text-[12px] font-bold text-[#666]">{instalment.instalmentNumber}</Text>
                    </View>

                    {/* Details */}
                    <View className="ml-3 flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-[14px] font-semibold text-[#1A1A1A]">
                          Instalment #{instalment.instalmentNumber}
                        </Text>
                        <Text className="text-[15px] font-bold text-[#1A1A1A]">{formatTaka(instalment.amount)}</Text>
                      </View>
                      <Text className="text-[12px] text-[#888]">{formatDate(instalment.dueDate)}</Text>
                    </View>

                    {/* Status */}
                    <View
                      className="ml-3 rounded-full px-2 py-1"
                      style={{ backgroundColor: `${getInstalmentStatusColor(instalment.status)}20` }}>
                      <Text
                        className="text-[11px] font-semibold"
                        style={{ color: getInstalmentStatusColor(instalment.status) }}>
                        {instalment.status === 'PAID' ? 'Paid' : instalment.status === 'OVERDUE' ? 'Overdue' : 'Pending'}
                      </Text>
                    </View>
                  </View>

                  {/* Breakdown */}
                  <View className="ml-13 mt-2 rounded-xl bg-[#F0FFF4] p-2">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[11px] text-[#666]">Principal: {formatTaka(instalment.principalAmount)}</Text>
                      <Text className="text-[11px] text-[#666]">Interest: {formatTaka(instalment.interestAmount)}</Text>
                    </View>
                    {instalment.paidAt && (
                      <Text className="mt-1 text-[11px] text-[#00C897]">Paid on {formatDate(instalment.paidAt)}</Text>
                    )}
                  </View>

                  {index < loan.instalments.length - 1 && <View className="ml-13 my-3 h-1 bg-[#F0F0F0]" />}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Status Log */}
        {loan.statusLogs.length > 0 && (
          <View className="mx-5 mb-5">
            <Text className="mb-3 text-[16px] font-bold text-[#1A1A1A]">Status History</Text>

            <View className="rounded-2xl bg-white p-4 shadow-sm">
              {loan.statusLogs.map((log, index) => (
                <View key={log.id} className="flex-row">
                  {/* Timeline */}
                  <View className="mr-3 items-center">
                    <View
                      className={`h-3 w-3 rounded-full border-2 ${
                        index === 0 ? 'border-[#00C897] bg-[#00C897]' : 'border-[#00C897] bg-white'
                      }`}
                    />
                    {index < loan.statusLogs.length - 1 && (
                      <View className="ml-[5px] h-full w-0.5 bg-[#E0E0E0]" style={{ minHeight: 40 }} />
                    )}
                  </View>

                  {/* Content */}
                  <View className="flex-1 pb-4">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[14px] font-semibold text-[#1A1A1A]">{getStatusLabel(log.status)}</Text>
                      <Text className="text-[12px] text-[#888]">{formatDate(log.createdAt)}</Text>
                    </View>
                    {log.note && <Text className="mt-1 text-[13px] text-[#666]">{log.note}</Text>}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Cancel Loan Button (only for PENDING loans) */}
        {loan.status === 'PENDING' && (
          <View className="mx-5 mb-5">
            <TouchableOpacity
              onPress={handleCancelLoan}
              activeOpacity={0.8}
              disabled={cancelling}
              className={`h-[52px] items-center justify-center rounded-2xl ${cancelling ? 'bg-[#FF4444]/60' : 'bg-[#FF4444]'}`}>
              {cancelling ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-[16px] font-semibold text-white">Cancel Loan Application</Text>
              )}
            </TouchableOpacity>
            <Text className="mt-2 text-center text-[12px] text-[#888]">
              You can cancel your loan application while it's still pending
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
