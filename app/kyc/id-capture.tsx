import { View, Text, TouchableOpacity, Dimensions, ActivityIndicator, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path, Circle, Line } from 'react-native-svg'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useRef, useState } from 'react'

const { width } = Dimensions.get('window')

const FRAME_WIDTH = 343
const FRAME_HEIGHT = 240
const FRAME_TOP = 274
const FRAME_LEFT = (width - FRAME_WIDTH) / 2

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
  const [permission, requestPermission] = useCameraPermissions()
  const [capturing, setCapturing] = useState(false)
  const [facing, setFacing] = useState<'back' | 'front'>('back')
  const cameraRef = useRef<CameraView>(null)

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return
    setCapturing(true)
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 })
      if (photo?.uri) {
        router.push({ pathname: '/kyc/id-capture-preview', params: { uri: photo.uri } })
      }
    } finally {
      setCapturing(false)
    }
  }

  const toggleFacing = () => setFacing(f => f === 'back' ? 'front' : 'back')

  if (!permission) return <View className="flex-1 bg-black" />

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <Text className="text-white text-center text-[16px] mb-6">
          Camera access is required to capture your ID.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          activeOpacity={0.8}
          className="h-[50px] px-8 bg-[#25d17f] rounded-full items-center justify-center"
        >
          <Text className="text-white font-bold text-[16px]">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-black">
      {/* Full-screen live camera */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing={facing}
      />

      {/* Dark vignette outside the frame */}
      {/* Top */}
      <View style={[styles.vignette, { top: 0, left: 0, right: 0, height: FRAME_TOP }]} />
      {/* Bottom */}
      <View style={[styles.vignette, { top: FRAME_TOP + FRAME_HEIGHT, left: 0, right: 0, bottom: 0 }]} />
      {/* Left */}
      <View style={[styles.vignette, { top: FRAME_TOP, left: 0, width: FRAME_LEFT, height: FRAME_HEIGHT }]} />
      {/* Right */}
      <View style={[styles.vignette, { top: FRAME_TOP, right: 0, left: FRAME_LEFT + FRAME_WIDTH, height: FRAME_HEIGHT }]} />

      {/* Top bar - simplified with minimal elements */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="absolute top-0 left-0 right-0 flex-row justify-between px-6 z-10"
      >
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <View className="w-8 h-8 rounded-full bg-black/30 items-center justify-center">
            <Text className="text-white text-[20px] font-bold">←</Text>
          </View>
        </TouchableOpacity>
        <View className="flex-row gap-4">
          <TouchableOpacity activeOpacity={0.7} className="w-8 h-8 rounded-full bg-black/30 items-center justify-center">
            <FlashOffIcon />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFacing} activeOpacity={0.7} className="w-8 h-8 rounded-full bg-black/30 items-center justify-center">
            <CameraReverseIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* Instruction */}
      <View className="absolute left-6 right-6 z-10" style={{ top: FRAME_TOP - 80 }}>
        <Text className="text-white text-[24px] leading-[31px] text-left">
          Place the{' '}
          <Text className="text-[#25d17f] font-semibold text-[24px]">Information Page of Passport</Text>
          {' in the frame'}
        </Text>
      </View>

      {/* Frame border + corners */}
      <View
        className="absolute z-10 border-2 border-white/40 rounded-xl overflow-hidden"
        style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT, left: FRAME_LEFT, top: FRAME_TOP }}
      >
        {/* Corner accents */}
        <View className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-[#25d17f] rounded-tl-xl" />
        <View className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-[#25d17f] rounded-tr-xl" />
        <View className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-[#25d17f] rounded-bl-xl" />
        <View className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-[#25d17f] rounded-br-xl" />

        {/* MRZ lines at bottom - as shown in Figma design */}
        <View className="absolute bottom-3 left-3 right-3">
          <Text className="text-white/60 text-[16px] tracking-widest leading-[21px]">
            {'<'.repeat(44)}
          </Text>
          <Text className="text-white/60 text-[16px] tracking-widest leading-[21px]">
            {'<'.repeat(44)}
          </Text>
        </View>
      </View>

      {/* Shutter button */}
      <View className="absolute bottom-20 left-0 right-0 items-center z-10">
        <TouchableOpacity
          onPress={handleCapture}
          disabled={capturing}
          activeOpacity={0.8}
          className="w-[68px] h-[68px] rounded-full border-3 border-white items-center justify-center bg-white/10 backdrop-blur-sm"
        >
          {capturing
            ? <ActivityIndicator color="white" size="small" />
            : <View className="w-[56px] h-[56px] rounded-full bg-white shadow-lg" />
          }
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  vignette: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 5,
  },
})
