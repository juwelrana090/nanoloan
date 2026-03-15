import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { router } from 'expo-router';

const ComingSoonIcon = () => (
  <Svg width={120} height={120} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} stroke="#00C897" strokeWidth={1.5} />
    <Path
      d="M6 21V18C6 16.3431 7.34315 15 9 15H15C16.6569 15 18 16.3431 18 18V21"
      stroke="#00C897"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M9 11C9.55228 11 10 10.5523 10 10C10 9.44772 9.55228 9 9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11ZM15 11C15.5523 11 16 10.5523 16 10C16 9.44772 15.5523 9 15 9C14.4477 9 14 9.44772 14 10C14 10.5523 14.4477 11 15 11Z"
      fill="#00C897"
    />
  </Svg>
);

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#00C897' }}>
      <View style={{ paddingTop: insets.top }} className="px-5 pb-4">
        <Text className="text-[22px] font-extrabold text-[#0D2B1E]">Profile</Text>
        <Text className="text-[13px] text-[#0D2B1E]/70">Manage your account</Text>
      </View>

      <View className="flex-1 rounded-tl-[40px] rounded-tr-[40px] bg-[#F0FFF4] px-5 pt-6">
        <ComingSoonIcon />
        <Text className="mt-6 text-center text-[18px] font-bold text-[#1A1A1A]">Profile</Text>
        <Text className="mt-2 text-center text-[14px] text-[#888]">
          We are working on something amazing{'\n'}for you. Stay tuned!
        </Text>

        {/* Quick actions */}
        <View className="mt-8 space-y-3">
          <TouchableOpacity
            onPress={() => router.push('/auth/basic-information')}
            activeOpacity={0.8}
            className="h-[52px] items-center justify-between rounded-2xl bg-white px-4">
            <Text className="text-[15px] font-semibold text-[#1A1A1A]">Basic Information</Text>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 5L7 8H5C3.89543 8 3 8.89543 3 10V11"
                stroke="#888"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            className="h-[52px] items-center justify-between rounded-2xl bg-white px-4">
            <Text className="text-[15px] font-semibold text-[#1A1A1A]">Security Settings</Text>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="#888"
                strokeWidth={2}
              />
              <Path d="M12 8V12" stroke="#888" strokeWidth={2} strokeLinecap="round" />
              <Path d="M12 16H12.01" stroke="#888" strokeWidth={2} strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            className="h-[52px] items-center justify-between rounded-2xl bg-white px-4">
            <Text className="text-[15px] font-semibold text-[#1A1A1A]">Notifications</Text>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8"
                stroke="#888"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M6 8C6 11.3137 8.68629 14 12 14"
                stroke="#888"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <Circle cx={18} cy={8} r={2} fill="#00C897" />
            </Svg>
          </TouchableOpacity>
        </View>

        <View className="h-10" />
      </View>
    </View>
  );
}
