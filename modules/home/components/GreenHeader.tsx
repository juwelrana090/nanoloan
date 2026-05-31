import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  NotificationIcon,
  RoundBDTIcon,
  BankAccountIcon,
  TotalLoanIcon,
  TotalDueLoanIcon,
} from '@/shared/components/UI/icons/svg-icons';

interface GreenHeaderProps {
  paddingTop: number;
  accountNumber: string;
  totalLoan: number;
  totalDueLoan: number;
  loanGoalProgress: number;
  totalLoanAmount: number;
  hasActiveLoans: boolean;
  onOpenAccountModal: () => void;
  formatTaka: (amount: number) => string;
}

export const GreenHeader: React.FC<GreenHeaderProps> = ({
  paddingTop,
  accountNumber,
  totalLoan,
  totalDueLoan,
  loanGoalProgress,
  totalLoanAmount,
  hasActiveLoans,
  onOpenAccountModal,
  formatTaka,
}) => {
  return (
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
          <Text className="text-[16px] font-bold text-[#0D2B1E]">{accountNumber}</Text>
        </View>
        <TouchableOpacity
          onPress={onOpenAccountModal}
          activeOpacity={0.8}
          className="flex-row items-center gap-3">
          <View className="h-[38px] w-[38px] items-center justify-center">
            <RoundBDTIcon color="#FFFFFF" size={38} />
          </View>
          <View className="h-6 w-[1px] bg-white/40" />
          <View className="h-[38px] w-[38px] items-center justify-center">
            <BankAccountIcon color="#FFFFFF" size={38} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Row 3 — Total Loan | Total Due Loan - Only show when hasActiveLoans */}
      {hasActiveLoans && (
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
      )}

      {/* Row 4 — Progress bar - Only show when hasActiveLoans */}
      {hasActiveLoans && (
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
            <Text className="text-[12px] font-semibold text-[#0D2B1E]">
              {formatTaka(totalLoanAmount)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};
