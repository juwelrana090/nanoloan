import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path, Circle, Line } from 'react-native-svg'

const { width, height } = Dimensions.get('window')

const FlashOffIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="2" y1="2" x2="22" y2="22" stroke="white" strokeWidth={2} strokeLinecap="round" />
  </Svg>
)

const CameraReverseIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Path d="M20 10C20 10 19.58 10 19 10" stroke="white" strokeWidth={2} strokeLinecap="round" />
    <Path d="M16.2 7.8C16.7 7.3 17.5 7 18.4 7C19.3 7 20 7.5 20.5 8" stroke="white" strokeWidth={2} strokeLinecap="round" />
    <Path d="M20 14C20 14 19.58 14 19 14" stroke="white" strokeWidth={2} strokeLinecap="round" />
    <Path d="M20 12C20 12 19.58 12 19 12" stroke="white" strokeWidth={2} strokeLinecap="round" />
    <Path d="M23 12C23 16 21 19 18 21M16.2 16.2C16.7 16.7 17.5 17 18.4 17C19.3 17 20 16.5 20.5 16" stroke="white" strokeWidth={2} strokeLinecap="round" />
    <Circle cx={10} cy={10} r={6} stroke="white" strokeWidth={2} />
    <Circle cx={10} cy={10} r={2} fill="white" />
    <Path d="M18 10L20 8" stroke="white" strokeWidth={2} strokeLinecap="round" />
    <Path d="M20 14L18 12" stroke="white" strokeWidth={2} strokeLinecap="round" />
  </Svg>
)

export default function IDCaptureScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View className="flex-1 bg-black">
      {/* Simulated camera bg */}
      <View className="absolute inset-0 bg-[#2A2A2A] opacity-80" />

      {/* Top bar */}
      <View
        style={{ paddingTop: insets.top + 12 }}
        className="absolute top-0 left-0 right-0 flex-row justify-between px-6 z-10"
      >
        <View className="w-8" />
        <View className="w-8 h-1 bg-white/50 rounded-full self-center" />
        <View className="flex-row gap-5">
          <FlashOffIcon />
          <CameraReverseIcon />
        </View>
      </View>

      {/* Instruction */}
      <View className="absolute top-[120px] left-6 right-6 z-10">
        <Text className="text-white text-[20px] font-bold leading-7">
          Place the{' '}
          <Text className="text-[#00C897]">Information Page of{'\n'}Passport</Text>
          {' '}in the frame
        </Text>
      </View>

      {/* Frame overlay */}
      <View
        className="absolute z-10 border-2 border-white rounded-lg"
        style={{
          width: width - 48,
          height: height * 0.32,
          left: 24,
          top: height * 0.28,
        }}
      >
        {/* MRZ lines at bottom */}
        <View className="absolute bottom-3 left-3 right-3">
          <Text className="text-white/60 text-[7px] tracking-widest">
            {'<'.repeat(44)}
          </Text>
          <Text className="text-white/60 text-[7px] tracking-widest mt-1">
            {'<'.repeat(44)}
          </Text>
        </View>
      </View>

      {/* Shutter button */}
      <View className="absolute bottom-16 left-0 right-0 items-center z-10">
        <TouchableOpacity
          onPress={() => router.push('/kyc/id-capture-preview')}
          activeOpacity={0.8}
          className="w-[72px] h-[72px] rounded-full border-4 border-white items-center justify-center"
        >
          <View className="w-[54px] h-[54px] rounded-full bg-white" />
        </TouchableOpacity>
      </View>
    </View>
  )
}
