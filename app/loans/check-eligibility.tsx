import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafePadding } from '@/shared/hooks/useSafePadding';
import { useCheckEligibilityMutation } from '@/shared/libs/redux/features/loan/loanApi';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { useToast } from '@/shared/hooks/useToast';
import { ArrowLeftIcon } from '@/shared/components/UI/icons/svg-icons';
import type { EligibilityResult } from '@/modules/loan/types';

const formatTaka = (amount: number): string =>
  `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function CheckEligibilityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { paddingTop } = useSafePadding();
  const { showError } = useToast();

  // Get selected account from Redux
  const selectedAccountId = useAppSelector((state) => state.bank.selectedAccountId);

  const [amount, setAmount] = useState('');
  const [tenure, setTenure] = useState('');
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  const [checkEligibility, { isLoading }] = useCheckEligibilityMutation();

  const amountValue = parseInt(amount) || 0;
  const tenureValue = parseInt(tenure) || 0;

  const handleCheckEligibility = async () => {
    // Validation
    if (amountValue <= 0) {
      showError({ title: 'Invalid Amount', message: 'Please enter a valid loan amount' });
      return;
    }
    if (tenureValue < 1 || tenureValue > 60) {
      showError({ title: 'Invalid Tenure', message: 'Tenure must be between 1 and 60 months' });
      return;
    }

    try {
      const result = await checkEligibility({ amount: amountValue, tenure: tenureValue }).unwrap();
      setEligibilityResult(result.data);
      setHasChecked(true);
    } catch (err: unknown) {
      const error = err as { status?: number; data?: { message?: string; errors?: Record<string, string> } };
      if (error?.data?.errors) {
        const errorMessages = Object.values(error.data.errors).join(', ');
        showError({ title: 'Validation Error', message: errorMessages });
      } else {
        showError({ title: 'Error', message: error?.data?.message ?? 'Failed to check eligibility' });
      }
      setEligibilityResult(null);
      setHasChecked(true);
    }
  };

  const handleProceedToApply = () => {
    router.push(
      `/loans/apply?amount=${amountValue}&tenure=${tenureValue}&emi=${eligibilityResult?.estimatedEmi || 0}&interestRate=${eligibilityResult?.interestRate || 0}` as any
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#F0FFF4]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={{ paddingTop }} className="bg-white px-5 pb-4 shadow-sm">
          <View className="mt-4 mb-2 flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-[#F0FFF4]">
              <ArrowLeftIcon color="#00C897" size={18} />
            </TouchableOpacity>
            <Text className="flex-1 text-[18px] font-bold text-[#1A1A1A]">Check Eligibility</Text>
          </View>
        </View>

        {/* No account selected warning */}
        {!selectedAccountId && (
          <View className="m-5 rounded-2xl bg-[#FFF8E1] border border-[#FF9800] p-4">
            <Text className="mb-1 text-[14px] font-bold text-[#FF9800]}>⚠️ No Bank Account Selected</Text>
            <Text className="text-[13px] text-[#666]">
              Please select a bank account before applying for a loan.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/bank/accounts' as any)}
              className="mt-3 h-[36px] items-center justify-center rounded-xl bg-[#FF9800]">
              <Text className="text-[13px] font-semibold text-white">Select Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Form */}
        <View className="mx-5 mt-5">
          <Text className="mb-4 text-[20px] font-bold text-[#1A1A1A]">
            Check if you qualify for a loan
          </Text>

          {/* Amount Input */}
          <View className="mb-4">
            <Text className="mb-2 text-[14px] font-semibold text-[#1A1A1A]">Loan Amount (BDT)</Text>
            <View className="rounded-2xl bg-white border border-[#E0E0E0] px-4 py-3">
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter amount (e.g., 20000)"
                keyboardType="numeric"
                className="text-[16px] text-[#1A1A1A]"
                placeholderTextColor="#999"
              />
            </View>
            {amountValue > 0 && (
              <Text className="mt-2 text-[13px] text-[#888]">{formatTaka(amountValue)}</Text>
            )}
          </View>

          {/* Tenure Input */}
          <View className="mb-6">
            <Text className="mb-2 text-[14px] font-semibold text-[#1A1A1A]">Loan Tenure (Months)</Text>
            <View className="rounded-2xl bg-white border border-[#E0E0E0] px-4 py-3">
              <TextInput
                value={tenure}
                onChangeText={setTenure}
                placeholder="Enter tenure (1-60 months)"
                keyboardType="numeric"
                className="text-[16px] text-[#1A1A1A]"
                placeholderTextColor="#999"
              />
            </View>
            {tenureValue > 0 && (
              <Text className="mt-2 text-[13px] text-[#888]">{tenureValue} months</Text>
            )}
          </View>

          {/* Check Eligibility Button */}
          <TouchableOpacity
            onPress={handleCheckEligibility}
            activeOpacity={0.8}
            disabled={isLoading || !selectedAccountId}
            className={`h-[50px] items-center justify-center rounded-2xl ${
              isLoading || !selectedAccountId ? 'bg-[#00C897]/60' : 'bg-[#00C897]'
            }`}>
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-[16px] font-semibold text-white">Check Eligibility</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Result Card */}
        {hasChecked && eligibilityResult && (
          <View className="mx-5 mt-6">
            {eligibilityResult.eligible ? (
              // Eligible - Green card
              <View className="rounded-2xl bg-[#E4F7EE] border-2 border-[#00C897] p-5">
                <View className="mb-4 items-center">
                  <Text className="text-4xl">✅</Text>
                  <Text className="mt-2 text-[18px] font-bold text-[#00C897]">Congratulations!</Text>
                  <Text className="text-[14px] text-[#666]">You are eligible for this loan</Text>
                </View>

                <View className="mb-4 rounded-xl bg-white p-4">
                  <View className="mb-3 flex-row items-center justify-between">
                    <Text className="text-[14px] text-[#888]">Loan Amount</Text>
                    <Text className="text-[16px] font-bold text-[#1A1A1A]">{formatTaka(amountValue)}</Text>
                  </View>

                  {eligibilityResult.estimatedEmi && (
                    <View className="mb-3 flex-row items-center justify-between">
                      <Text className="text-[14px] text-[#888]">Estimated EMI</Text>
                      <Text className="text-[16px] font-bold text-[#00C897]">
                        {formatTaka(eligibilityResult.estimatedEmi)}/month
                      </Text>
                    </View>
                  )}

                  {eligibilityResult.interestRate && (
                    <View className="mb-3 flex-row items-center justify-between">
                      <Text className="text-[14px] text-[#888]">Interest Rate</Text>
                      <Text className="text-[16px] font-semibold text-[#1A1A1A]">
                        {eligibilityResult.interestRate}% p.a.
                      </Text>
                    </View>
                  )}

                  <View className="flex-row items-center justify-between">
                    <Text className="text-[14px] text-[#888]">Tenure</Text>
                    <Text className="text-[16px] font-semibold text-[#1A1A1A]">{tenureValue} months</Text>
                  </View>
                </View>

                {eligibilityResult.minAmount && eligibilityResult.maxAmount && (
                  <Text className="mb-4 text-center text-[12px] text-[#888]">
                    Eligible range: {formatTaka(eligibilityResult.minAmount)} -{' '}
                    {formatTaka(eligibilityResult.maxAmount)}
                  </Text>
                )}

                <TouchableOpacity
                  onPress={handleProceedToApply}
                  activeOpacity={0.8}
                  className="h-[48px] items-center justify-center rounded-xl bg-[#00C897]">
                  <Text className="text-[15px] font-semibold text-white">Proceed to Apply</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Not Eligible - Orange/Red card
              <View className="rounded-2xl bg-[#FFE0E0] border-2 border-[#FF4444] p-5">
                <View className="mb-4 items-center">
                  <Text className="text-4xl">❌</Text>
                  <Text className="mt-2 text-[18px] font-bold text-[#FF4444]">Not Eligible</Text>
                  <Text className="text-[14px] text-[#666]">
                    {eligibilityResult.reason || 'You do not meet the eligibility criteria'}
                  </Text>
                </View>

                {(eligibilityResult.minAmount || eligibilityResult.maxAmount) && (
                  <View className="mb-4 rounded-xl bg-white p-4">
                    <Text className="mb-2 text-[14px] font-semibold text-[#1A1A1A]">
                      Eligibility Information:
                    </Text>
                    {eligibilityResult.minAmount && (
                      <Text className="text-[13px] text-[#666]">
                        • Minimum amount: {formatTaka(eligibilityResult.minAmount)}
                      </Text>
                    )}
                    {eligibilityResult.maxAmount && (
                      <Text className="text-[13px] text-[#666]">
                        • Maximum amount: {formatTaka(eligibilityResult.maxAmount)}
                      </Text>
                    )}
                    {eligibilityResult.minTenure && (
                      <Text className="text-[13px] text-[#666]">
                        • Minimum tenure: {eligibilityResult.minTenure} months
                      </Text>
                    )}
                    {eligibilityResult.maxTenure && (
                      <Text className="text-[13px] text-[#666]">
                        • Maximum tenure: {eligibilityResult.maxTenure} months
                      </Text>
                    )}
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => setHasChecked(false)}
                  activeOpacity={0.8}
                  className="h-[48px] items-center justify-center rounded-xl bg-[#FF4444]">
                  <Text className="text-[15px] font-semibold text-white">Try Different Values</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
