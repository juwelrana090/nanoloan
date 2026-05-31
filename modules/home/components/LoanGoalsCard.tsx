import React from 'react';
import { View , Text } from 'react-native';
import { BDTSymbolIcon, NextLoanIcon, DateIcon } from '@/shared/components/UI/icons/svg-icons';

interface LoanGoalsCardProps {
  nextPaymentAmount: number;
  nextPaymentDate: string;
  formatTaka: (amount: number) => string;
  formatDate: (dateStr: string) => string;
}

export const LoanGoalsCard: React.FC<LoanGoalsCardProps> = ({
  nextPaymentAmount,
  nextPaymentDate,
  formatTaka,
  formatDate,
}) => {
  return (
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
          <Text className="text-[13px] font-semibold text-white">{formatDate(nextPaymentDate)}</Text>
        </View>
      </View>
    </View>
  );
};
