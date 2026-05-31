import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export const MakeALoanCard: React.FC = () => {
  return (
    <View className="h-[111px] w-full rounded-[30px] bg-[#00D09E] px-[17px] py-[17px]">
      {/* Title - Arial Bold 18px, color #052224, line-height 24px */}
      <Text
        className="mb-[-1px] text-[18px] font-bold leading-[24px] text-[#052224]"
        style={{ fontFamily: 'Arial' }}>
        Make a loan
      </Text>

      {/* Description - Arial Regular 12px, color #052224, line-height 24px */}
      <Text
        className="mb-[4px] text-[12px] font-normal leading-[24px] text-[#052224]"
        style={{ fontFamily: 'Arial' }}>
        we are ready to help you for your awesome work. let&apos;s invest there.
      </Text>

      {/* Create Application Button - 159.77×25px, white bg, radius 30px */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/loans/check-eligibility' as any)}
        className="h-[25px] w-[159.77px] items-center justify-center rounded-[30px] bg-white">
        {/* Button Text - Arial Bold 12px, color #0E3E3E, line-height 24px, margin-top 1 */}
        <Text
          className="mt-[1px] text-[12px] font-bold leading-[24px] text-[#0E3E3E]"
          style={{ fontFamily: 'Arial' }}>
          Create Application
        </Text>
      </TouchableOpacity>
    </View>
  );
};
