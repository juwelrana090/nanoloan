import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafePadding } from '@/shared/hooks/useSafePadding';
import { useApplyLoanMutation } from '@/shared/libs/redux/features/loan/loanApi';
import { useGetAccountQuery } from '@/shared/libs/redux/features/bank/bankApi';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { useToast } from '@/shared/hooks/useToast';
import { ArrowLeftIcon, ChevronRightIcon } from '@/shared/components/UI/icons/svg-icons';
import type { LoanApplicationResponse } from '@/modules/loan/types';

const formatTaka = (amount: number): string =>
  `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const maskAccountNumber = (num: string): string =>
  num.length >= 7 ? `${num.slice(0, 3)}*****${num.slice(-4)}` : num;

const calculateEmi = (principal: number, annualRate: number, tenureMonths: number): number => {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return Math.round(principal / tenureMonths);
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi);
};

export default function ApplyLoanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { paddingTop } = useSafePadding();
  const { showSuccess, showError } = useToast();

  // Get params from eligibility check
  const amount = parseInt(params.amount as string) || 0;
  const tenure = parseInt(params.tenure as string) || 0;
  const interestRate = parseFloat(params.interestRate as string) || 9;
  const estimatedEmi = parseInt(params.emi as string) || calculateEmi(amount, interestRate, tenure);

  const [purpose, setPurpose] = useState('');
  const [purposeError, setPurposeError] = useState('');

  // Get selected account from Redux
  const selectedAccountId = useAppSelector((state) => state.bank.selectedAccountId);

  const { data: accountData, isLoading: accountLoading } = useGetAccountQuery(selectedAccountId!, {
    skip: !selectedAccountId,
  });

  const account = accountData?.data;

  const [applyLoan, { isLoading }] = useApplyLoanMutation();

  // Validate purpose
  const validatePurpose = (): boolean => {
    if (!purpose || purpose.trim().length < 10) {
      setPurposeError('Please provide a purpose (at least 10 characters)');
      return false;
    }
    setPurposeError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!selectedAccountId || !account) {
      showError({ title: 'Error', message: 'Please select a bank account first' });
      return;
    }

    if (!validatePurpose()) {
      return;
    }

    try {
      const result = await applyLoan({
        amount,
        tenure,
        purpose: purpose.trim(),
        bankAccountId: selectedAccountId,
      }).unwrap();

      showSuccess({ title: 'Success', message: result.message || 'Loan application submitted' });

      // Navigate to thank you screen with application data
      router.push(
        `/loans/thank-you?data=${encodeURIComponent(JSON.stringify(result.data))}` as any
      );
    } catch (err: unknown) {
      const error = err as { status?: number; data?: { message?: string; errors?: Record<string, string> } };
      if (error?.status === 422 && error?.data?.errors) {
        const errorMessages = Object.values(error.data.errors).join(', ');
        showError({ title: 'Validation Error', message: errorMessages });
      } else {
        showError({ title: 'Error', message: error?.data?.message ?? 'Failed to submit application' });
      }
    }
  };

  const handleChangeAccount = () => {
    Alert.alert(
      'Change Account',
      'This will take you to the accounts screen. You will need to return and fill the form again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => router.push('/bank/accounts' as any) },
      ]
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
            <Text className="flex-1 text-[18px] font-bold text-[#1A1A1A]">Apply for Loan</Text>
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

        {/* Loan Summary Card */}
        {amount > 0 && tenure > 0 && (
          <View className="mx-5 mt-5 rounded-2xl bg-[#00C897] p-5">
            <Text className="mb-4 text-[16px] font-bold text-[#0D2B1E]">Loan Summary</Text>

            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[14px] text-[#0D2B1E]/80">Loan Amount</Text>
              <Text className="text-[18px] font-bold text-white">{formatTaka(amount)}</Text>
            </View>

            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[14px] text-[#0D2B1E]/80">Tenure</Text>
              <Text className="text-[16px] font-semibold text-white">{tenure} months</Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-[14px] text-[#0D2B1E]/80">Interest Rate</Text>
              <Text className="text-[16px] font-semibold text-white">{interestRate}% p.a.</Text>
            </View>

            <View className="mt-4 h-1 bg-white/20" />

            <View className="mt-4 flex-row items-center justify-between">
              <Text className="text-[14px] text-[#0D2B1E]/80">Estimated EMI</Text>
              <Text className="text-[20px] font-bold text-white">{formatTaka(estimatedEmi)}/mo</Text>
            </View>
          </View>
        )}

        {/* Selected Account Card */}
        {account && (
          <View className="mx-5 mt-5">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-[14px] font-semibold text-[#1A1A1A]">Disbursement Account</Text>
              <TouchableOpacity onPress={handleChangeAccount}>
                <Text className="text-[13px] font-semibold text-[#00C897]">Change</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              disabled
              className="rounded-2xl bg-white border border-[#00C897] p-4 opacity-80">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="mb-1 text-[15px] font-bold text-[#1A1A1A]">
                    {account.accountType.charAt(0) + account.accountType.slice(1).toLowerCase()}
                  </Text>
                  <Text className="text-[13px] text-[#888]">{maskAccountNumber(account.accountNumber)}</Text>
                  <Text className="text-[12px] font-semibold text-[#00C897]">
                    {formatTaka(account.balance)}
                  </Text>
                </View>
                <ChevronRightIcon color="#00C897" size={20} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Purpose Input */}
        {selectedAccountId && (
          <View className="mx-5 mt-5">
            <Text className="mb-2 text-[14px] font-semibold text-[#1A1A1A]">Loan Purpose *</Text>
            <Text className="mb-3 text-[13px] text-[#888]">
              Please describe why you need this loan (minimum 10 characters)
            </Text>

            <View
              className={`rounded-2xl bg-white border px-4 py-3 ${purposeError ? 'border-[#FF4444]' : 'border-[#E0E0E0]'}`}>
              <TextInput
                value={purpose}
                onChangeText={(text) => {
                  setPurpose(text);
                  setPurposeError('');
                }}
                placeholder="e.g., Home renovation, medical expenses, business investment..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                className="text-[16px] text-[#1A1A1A]"
                textAlignVertical="top"
                maxLength={500}
              />
            </View>

            {purposeError ? (
              <Text className="mt-2 text-[12px] text-[#FF4444]">{purposeError}</Text>
            ) : null}

            <Text className="mt-2 text-right text-[12px] text-[#999]">{purpose.length}/500</Text>
          </View>
        )}

        {/* Submit Button */}
        {selectedAccountId && (
          <View className="mx-5 mt-6">
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={isLoading}
              className={`h-[52px] items-center justify-center rounded-2xl ${isLoading ? 'bg-[#00C897]/60' : 'bg-[#00C897]'}`}>
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-[16px] font-semibold text-white">Submit Application</Text>
              )}
            </TouchableOpacity>

            <Text className="mt-3 text-center text-[12px] text-[#888]">
              By submitting, you agree to our terms and conditions
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
