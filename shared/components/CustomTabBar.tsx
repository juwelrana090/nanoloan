import { View, TouchableOpacity } from 'react-native';
import { useSafePadding } from '@/shared/hooks/useSafePadding';
import {
  AnalysisIcon,
  CategoryIcon,
  HomeIcon,
  ProfileIcon,
  TransactionsIcon,
} from '@/shared/constants/icons';

const TAB_ICONS = {
  index: { icon: HomeIcon },
  analysis: { icon: AnalysisIcon },
  transactions: { icon: TransactionsIcon },
  category: { icon: CategoryIcon },
  profile: { icon: ProfileIcon },
};

export const CustomTabBar = ({ state, navigation }: any) => {
  const { paddingBottom } = useSafePadding();

  return (
    // ✅ Outer wrapper — same color as screen background to hide corner gaps
    <View className="bg-[#F0FFF4]">
      {/* ✅ Inner bar — rounded top, own background color */}
      <View
        style={{
          paddingBottom,
          minHeight: 60
        }}
        className="flex-row items-center justify-around rounded-tl-[70px] rounded-tr-[70px] bg-[#DFF7E2] px-6 pt-4">
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const tabData = TAB_ICONS[route.name as keyof typeof TAB_ICONS];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              className={`h-[52px] w-[52px] items-center justify-center rounded-[22px] ${
                isFocused ? 'bg-[#00C897]' : 'bg-transparent'
              }`}>
              {tabData?.icon && <tabData.icon color={isFocused ? '#ffffff' : '#1A1A1A'} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
