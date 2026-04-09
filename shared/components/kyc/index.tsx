import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const KycHeader = ({ title, showBar = false }: { title: string; showBar?: boolean }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top }} className="items-center bg-[#00C897] px-6 pb-8">
      <Text className="mt-6 text-center text-[24px] font-bold text-[#0D2B1E]">{title}</Text>
      {showBar && <View className="mt-3 h-1 w-8 rounded-full bg-[#0D2B1E]" />}
    </View>
  );
};

export const KycCard = ({ children }: { children: React.ReactNode }) => (
  <View className="flex-1 rounded-tl-[40px] rounded-tr-[40px] bg-[#F0FFF4]">{children}</View>
);
