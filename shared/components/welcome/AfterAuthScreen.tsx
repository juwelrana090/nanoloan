import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { splashLogo } from '@/shared/constants/images';
import { useRouter } from 'expo-router';
import { useSafePadding } from '@/shared/hooks/useSafePadding';

const AfterAuthScreen = () => {
  const router = useRouter();
  const { paddingTop, paddingBottomForTabs } = useSafePadding();

  const handleStartLearning = () => {
    //@ts-ignore
    router.push('/auth/register');
  };

  const handleLogin = () => {
    //@ts-ignore
    router.push(`/auth/login`);
  };

  return (
    <View className="flex-1 bg-[#00C897]">
      {/* Header */}
      <View className="items-center pb-10 pt-16">
        <Text className="text-[26px] font-bold text-[#0D2B1E]">Welcome</Text>
      </View>

      {/* White card */}
      <View className="flex-1 items-center justify-between rounded-tl-[40px] rounded-tr-[40px] bg-[#F0FFF4] pb-10 pt-0">
        {/* Logo + App name — centered in card */}
        <View className="flex-1 items-center justify-center gap-6">
          {/* Logo */}
          <Image source={splashLogo} className="h-[100px] w-[160px]" resizeMode="contain" />
          {/* App name */}
          <Text className="text-[40px] font-extrabold text-[#00C897]">Nano Loan</Text>
        </View>

        {/* Bottom buttons */}
        <View className="w-full flex-row items-center justify-between gap-4 px-6">
          {/* Sign Up */}
          <TouchableOpacity
            onPress={handleStartLearning}
            activeOpacity={0.8}
            className="h-[54px] flex-1 items-center justify-center rounded-full bg-[#E4F7EE]">
            <Text className="text-[17px] font-semibold text-[#1A1A1A]">Sign Up</Text>
          </TouchableOpacity>

          {/* Log In */}
          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.8}
            className="h-[54px] flex-1 items-center justify-center rounded-full bg-[#00C897]">
            <Text className="text-[17px] font-semibold text-white">Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AfterAuthScreen;
