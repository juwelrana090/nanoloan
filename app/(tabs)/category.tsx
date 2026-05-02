import { View, Text } from 'react-native';
import { useSafePadding } from '@/shared/hooks/useSafePadding';
import Svg, { Path, Rect } from 'react-native-svg';

const ComingSoonIcon = () => (
  <Svg width={120} height={120} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={3} width={7} height={7} stroke="#00C897" strokeWidth={1.5} rx={1} />
    <Rect x={14} y={3} width={7} height={7} stroke="#00C897" strokeWidth={1.5} rx={1} opacity={0.5} />
    <Rect x={14} y={14} width={7} height={7} stroke="#00C897" strokeWidth={1.5} rx={1} opacity={0.5} />
    <Rect x={3} y={14} width={7} height={7} stroke="#00C897" strokeWidth={1.5} rx={1} opacity={0.5} />
  </Svg>
);

export default function CategoryScreen() {
  const { paddingTop } = useSafePadding();

  return (
    <View style={{ flex: 1, backgroundColor: '#00C897' }}>
      <View style={{ paddingTop }} className="px-5 pb-4">
        <Text className="text-[22px] font-extrabold text-[#0D2B1E]">Category</Text>
        <Text className="text-[13px] text-[#0D2B1E]/70">Coming Soon</Text>
      </View>

      <View className="flex-1 rounded-tl-[40px] rounded-tr-[40px] bg-[#F0FFF4] items-center justify-center px-5">
        <ComingSoonIcon />
        <Text className="mt-6 text-[18px] font-bold text-[#1A1A1A]">Category</Text>
        <Text className="mt-2 text-[14px] text-[#888] text-center">
          We are working on something amazing{'\n'}for you. Stay tuned!
        </Text>
      </View>
    </View>
  );
}
