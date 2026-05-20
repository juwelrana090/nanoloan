import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafePadding } from '@/shared/hooks/useSafePadding';
import type { LoanApplicationResponse } from '@/modules/loan/types';

const formatTaka = (amount: number): string =>
  `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function ThankYouScreen() {
  const router = useRouter();
  const { paddingTop } = useSafePadding();
  const params = useLocalSearchParams();

  // Parse application data from params
  let applicationData: LoanApplicationResponse | null = null;
  try {
    const dataParam = params.data as string;
    if (dataParam) {
      applicationData = JSON.parse(decodeURIComponent(dataParam));
    }
  } catch (e) {
    console.error('Failed to parse application data:', e);
  }

  // If no data passed, show generic message
  const customerName = applicationData?.customerName || 'Customer';
  const loanNumber = applicationData?.loanNumber || 'N/A';
  const amount = applicationData?.amount || 0;
  const emi = applicationData?.emi || 0;
  const nextSteps = applicationData?.nextSteps || [
    'Your application is being reviewed',
    'You will receive an update via email and SMS',
    'You can track your application status in My Loans',
  ];

  const handleViewMyLoans = () => {
    router.replace('/loans/my-loans' as any);
  };

  const handleGoHome = () => {
    router.replace('/(tabs)/' as any);
  };

  return (
    <ScrollView className="flex-1 bg-[#F0FFF4]" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={{ paddingTop }} className="bg-white px-5 pb-4 shadow-sm">
        <View className="mt-4 mb-2">
          <Text className="text-[18px] font-bold text-[#1A1A1A]">Application Submitted</Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-5">
        {/* Success Icon */}
        <View className="mb-6 items-center">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-[#E4F7EE]">
            <Text className="text-5xl">🎉</Text>
          </View>
        </View>

        {/* Thank You Message */}
        <Text className="mb-2 text-center text-[24px] font-bold text-[#1A1A1A]">
          Thank You, {customerName}!
        </Text>
        <Text className="mb-8 text-center text-[14px] text-[#888]">
          Your loan application has been submitted successfully
        </Text>

        {/* Application Summary */}
        <View className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <Text className="mb-4 text-[16px] font-bold text-[#1A1A1A]">Application Summary</Text>

          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-[14px] text-[#888]">Loan Number</Text>
            <Text className="text-[15px] font-bold text-[#00C897]">{loanNumber}</Text>
          </View>

          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-[14px] text-[#888]">Loan Amount</Text>
            <Text className="text-[16px] font-bold text-[#1A1A1A]">{formatTaka(amount)}</Text>
          </View>

          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-[14px] text-[#888]">Monthly EMI</Text>
            <Text className="text-[16px] font-semibold text-[#1A1A1A]">{formatTaka(emi)}</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-[14px] text-[#888]">Status</Text>
            <View className="rounded-full bg-[#FFF8E1] px-3 py-1">
              <Text className="text-[12px] font-semibold text-[#FF9800]">Pending</Text>
            </View>
          </View>
        </View>

        {/* Next Steps */}
        <View className="mb-8">
          <Text className="mb-3 text-[16px] font-bold text-[#1A1A1A]">What Happens Next?</Text>

          <View className="rounded-2xl bg-white p-5 shadow-sm">
            {nextSteps.map((step, index) => (
              <View key={index} className="flex-row">
                <View className="mr-3">
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-[#00C897]">
                    <Text className="text-[12px] font-bold text-white">{index + 1}</Text>
                  </View>
                  {index < nextSteps.length - 1 && (
                    <View className="ml-3 h-full w-0.5 bg-[#E0E0E0]" style={{ minHeight: 30 }} />
                  )}
                </View>
                <View className="flex-1 pb-5">
                  <Text className="text-[14px] text-[#333] leading-5">{step}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mb-4">
          <TouchableOpacity
            onPress={handleViewMyLoans}
            activeOpacity={0.8}
            className="mb-3 h-[52px] items-center justify-center rounded-2xl bg-[#00C897]">
            <Text className="text-[16px] font-semibold text-white">View My Loans</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGoHome}
            activeOpacity={0.8}
            className="h-[52px] items-center justify-center rounded-2xl border-2 border-[#00C897]">
            <Text className="text-[16px] font-semibold text-[#00C897]">Go to Home</Text>
          </TouchableOpacity>
        </View>

        {/* Note */}
        <Text className="mb-8 text-center text-[12px] text-[#888]">
          You can always check your loan status in the My Loans section
        </Text>
      </View>
    </ScrollView>
  );
}
