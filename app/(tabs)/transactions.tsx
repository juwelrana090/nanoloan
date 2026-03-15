import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const ComingSoonIcon = () => (
  <Svg width={120} height={120} viewBox="0 0 24 24" fill="none">
    <Path d="M4 6H20M4 12H20M4 18H20" stroke="#00C897" strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#00C897' }}>
      <View style={{ paddingTop: insets.top }} className="px-5 pb-4">
        <Text className="text-[22px] font-extrabold text-[#0D2B1E]">Transactions</Text>
        <Text className="text-[13px] text-[#0D2B1E]/70">Coming Soon</Text>
      </View>

      <View className="flex-1 items-center justify-center rounded-tl-[40px] rounded-tr-[40px] bg-[#F0FFF4] px-5">
        <ComingSoonIcon />
        <Text className="mt-6 text-[18px] font-bold text-[#1A1A1A]">Transactions</Text>
        <Text className="mt-2 text-center text-[14px] text-[#888]">
          We are working on something amazing{'\n'}for you. Stay tuned!
        </Text>
      </View>
    </View>
  );
}
