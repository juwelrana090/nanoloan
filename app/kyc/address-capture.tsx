import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { FlashOffIcon, FlashOnIcon, CameraReverseIcon } from '@/shared/components/UI/icons/svg-icons';

export default function AddressCaptureScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const cameraRef = useRef<CameraView>(null);

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

        // Navigate to crop screen
        router.push({
          pathname: '/kyc/address-capture-crop',
          params: { uri: photo.uri },
        });
      }
    } finally {
      setCapturing(false);
    }
  };

  const toggleFacing = () => setFacing((f) => (f === 'back' ? 'front' : 'back'));

  const toggleFlash = () => setFlash((f) => (f === 'off' ? 'on' : 'off'));

  if (!permission) return <View className="flex-1 bg-black" />;

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-8">
        <Text className="mb-6 text-center text-[16px] text-white">
          Camera access is required to capture your proof of address document.
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

      {/* Top bar - simplified with minimal elements */}
      <View
        style={{ paddingTop: insets.top + 8 }}
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
      <View className="absolute left-6 right-6 z-10" style={{ top: 120 }}>
        <Text className="text-left text-[24px] leading-[31px] text-white">
          Place the{' '}
          <Text className="text-[24px] font-semibold text-[#25d17f]">Proof of Address Document</Text>
          {' in the frame'}
        </Text>
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
