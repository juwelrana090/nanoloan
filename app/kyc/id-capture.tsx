import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafePadding } from '@/shared/hooks/useSafePadding';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { FlashOffIcon, FlashOnIcon, CameraReverseIcon } from '@/shared/components/UI/icons/svg-icons';
import { cropImageToFrame, getPhotoDimensions } from '@/utils/cropToFrame';

const { width } = Dimensions.get('window');

const FRAME_WIDTH = 343;
const FRAME_HEIGHT = 240;
const FRAME_TOP = 274;
const FRAME_LEFT = (width - FRAME_WIDTH) / 2;

export default function IDCaptureScreen() {
  const { paddingTop } = useSafePadding();
  const { side = 'front' } = useLocalSearchParams<{ side: 'front' | 'back' }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const cameraRef = useRef<CameraView>(null);

  // Log frame configuration on mount
  console.log('🎯 Frame Configuration:', {
    FRAME_WIDTH,
    FRAME_HEIGHT,
    FRAME_TOP,
    FRAME_LEFT,
    screenWidth: width,
    safeAreaTop: paddingTop,
  });

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (photo?.uri) {
        console.log('📸 Photo captured:', {
          uri: photo.uri,
          width: photo.width,
          height: photo.height,
        });

        // Turn off flash after capture
        if (flash === 'on') {
          setFlash('off');
        }

        // Crop to frame area only
        const dimensions = getPhotoDimensions(photo);
        console.log('📏 Photo dimensions:', dimensions);

        const cropResult = await cropImageToFrame(
          photo.uri,
          {
            frameWidth: FRAME_WIDTH,
            frameHeight: FRAME_HEIGHT,
            frameLeft: FRAME_LEFT,
            frameTop: FRAME_TOP,
          },
          dimensions.width,
          dimensions.height
        );

        console.log('✂️ Crop result:', cropResult);

        if (cropResult.success && cropResult.uri) {
          // Navigate with cropped image
          console.log('✅ Using cropped image:', cropResult.uri);
          router.push({
            pathname: '/kyc/id-capture-preview',
            params: { uri: cropResult.uri, side },
          });
        } else {
          // Fall back to original photo if crop fails
          console.warn('⚠️ Crop failed, using original photo:', cropResult.error);
          router.push({
            pathname: '/kyc/id-capture-preview',
            params: { uri: photo.uri, side },
          });
        }
      }
    } finally {
      setCapturing(false);
    }
  };

  const getInstructionText = () => {
    if (side === 'front') {
      return (
        <>
          Place the{' '}
          <Text className="text-[24px] font-semibold text-[#25d17f]">Front Side of NID</Text>
          {' in the frame'}
        </>
      );
    } else {
      return (
        <>
          Place the{' '}
          <Text className="text-[24px] font-semibold text-[#25d17f]">Back Side of NID</Text>
          {' in the frame'}
        </>
      );
    }
  };

  const toggleFacing = () => setFacing((f) => (f === 'back' ? 'front' : 'back'));

  const toggleFlash = () => setFlash((f) => (f === 'off' ? 'on' : 'off'));

  if (!permission) return <View className="flex-1 bg-black" />;

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-8">
        <Text className="mb-6 text-center text-[16px] text-white">
          Camera access is required to capture your ID.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          activeOpacity={0.8}
          className="h-[50px] items-center justify-center rounded-full bg-[#25d17f] px-8">
          <Text className="text-[16px] font-bold text-white">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Full-screen live camera */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        enableTorch={flash === 'on'}
        flash={flash === 'on' ? 'on' : 'off'}
      />

      {/* Dark vignette outside the frame */}
      {/* Top */}
      <View style={[styles.vignette, { top: 0, left: 0, right: 0, height: FRAME_TOP }]} />
      {/* Bottom */}
      <View
        style={[styles.vignette, { top: FRAME_TOP + FRAME_HEIGHT, left: 0, right: 0, bottom: 0 }]}
      />
      {/* Left */}
      <View
        style={[
          styles.vignette,
          { top: FRAME_TOP, left: 0, width: FRAME_LEFT, height: FRAME_HEIGHT },
        ]}
      />
      {/* Right */}
      <View
        style={[
          styles.vignette,
          { top: FRAME_TOP, right: 0, left: FRAME_LEFT + FRAME_WIDTH, height: FRAME_HEIGHT },
        ]}
      />

      {/* Top bar - simplified with minimal elements */}
      <View
        style={{ paddingTop: paddingTop + 8 }}
        className="absolute left-0 right-0 top-0 z-10 flex-row justify-between px-6">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <View className="h-8 w-8 items-center justify-center">
            <Text className="text-[20px] font-bold text-white">←</Text>
          </View>
        </TouchableOpacity>
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={toggleFlash}
            activeOpacity={0.7}
            className="h-8 w-8 items-center justify-center">
            {flash === 'on' ? <FlashOnIcon /> : <FlashOffIcon />}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleFacing}
            activeOpacity={0.7}
            className="h-8 w-8 items-center justify-center">
            <CameraReverseIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* Instruction */}
      <View className="absolute left-6 right-6 z-10" style={{ top: FRAME_TOP - 80 }}>
        <Text className="text-left text-[24px] leading-[31px] text-white">
          {getInstructionText()}
        </Text>
      </View>

      {/* Frame border + corners */}
      <View
        className="absolute z-10 overflow-hidden rounded-xl border-2 border-white/40"
        style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT, left: FRAME_LEFT, top: FRAME_TOP }}>
        {/* Corner accents */}
        <View className="absolute left-0 top-0 h-7 w-7 rounded-tl-xl border-l-4 border-t-4 border-[#25d17f]" />
        <View className="absolute right-0 top-0 h-7 w-7 rounded-tr-xl border-r-4 border-t-4 border-[#25d17f]" />
        <View className="absolute bottom-0 left-0 h-7 w-7 rounded-bl-xl border-b-4 border-l-4 border-[#25d17f]" />
        <View className="absolute bottom-0 right-0 h-7 w-7 rounded-br-xl border-b-4 border-r-4 border-[#25d17f]" />

        {/* MRZ lines at bottom - as shown in Figma design */}
        <View className="absolute bottom-3 left-3 right-3">
          <Text className="text-[16px] leading-[21px] tracking-widest text-white/60">
            {'<'.repeat(44)}
          </Text>
          <Text className="text-[16px] leading-[21px] tracking-widest text-white/60">
            {'<'.repeat(44)}
          </Text>
        </View>
      </View>

      {/* Shutter button */}
      <View className="absolute bottom-20 left-0 right-0 z-10 items-center">
        <TouchableOpacity
          onPress={handleCapture}
          disabled={capturing}
          activeOpacity={0.8}
          className="border-3 h-[68px] w-[68px] items-center justify-center rounded-full border-white bg-white/10 backdrop-blur-sm">
          {capturing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <View className="h-[56px] w-[56px] rounded-full bg-white shadow-lg" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  vignette: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 5,
  },
});
