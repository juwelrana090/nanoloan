import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useAppDispatch } from '@/shared/hooks/useAppSelector';
import { setIsAuthenticated } from '@/shared/libs/redux/features/auth/authSlice';

const CheckmarkIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17L4 12"
      stroke="white"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function VerifiedDoneScreen() {
  const insets = useSafeAreaInsets();

  const dispatch = useAppDispatch();

  const handleDone = () => {
    dispatch(setIsAuthenticated(true));
    router.replace('/(tabs)');
  };

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}
      className="flex-1 items-center justify-between bg-[#F0FFF4] px-8">
      <View className="flex-1 items-center justify-center">
        {/* Verified badge illustration */}
        <View className="relative mb-8 h-[140px] w-[140px] items-center justify-center">
          {/* Orbit ring */}
          <View className="absolute h-[130px] w-[130px] rounded-full border-2 border-[#C8E6C9] opacity-60" />
          <View className="absolute h-[100px] w-[100px] rounded-full border border-[#A5D6A7] opacity-40" />
          {/* Shield */}
          <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-[#00C897] shadow-lg">
            <CheckmarkIcon />
          </View>
          {/* Decorative dots */}
          <View className="absolute right-4 top-2 h-2 w-2 rounded-full bg-[#00C897] opacity-60" />
          <View className="absolute bottom-3 left-3 h-1.5 w-1.5 rounded-full bg-[#A5D6A7]" />
          <View className="absolute left-2 top-6 h-1 w-1 rounded-full bg-[#C8E6C9]" />
        </View>

        <Text className="mb-3 text-[28px] font-bold text-[#1A1A1A]">Verified</Text>
        <Text className="text-center text-[14px] leading-5 text-[#888]">
          {`You currently have access to all of VAEX's\nfeatures and high limits`}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleDone}
        activeOpacity={0.8}
        className="h-[54px] w-full items-center justify-center rounded-full bg-[#00C897]">
        <Text className="text-[17px] font-bold text-white">Done</Text>
      </TouchableOpacity>
    </View>
  );
}
