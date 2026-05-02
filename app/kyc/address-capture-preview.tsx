import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { KycHeader, KycCard } from '@/shared/components/kyc';
import Svg, { Path } from 'react-native-svg';
import { Image } from 'expo-image';
import { useState, useEffect } from 'react';
import { useSafePadding } from '@/shared/hooks/useSafePadding';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/shared/libs/redux/store';
import {
  setAddressImage,
  clearAddressImage,
  setLoading,
} from '@/shared/libs/redux/features/kyc/kycSlice';
import { useVerifyAddressMutation } from '@/shared/libs/redux/features/biometric/biometricApi';
import { useToast } from '@/shared/hooks/useToast';

const CheckIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 12 10" fill="none">
    <Path
      d="M1 5L4.5 8.5L11 1"
      stroke="#00C897"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function AddressCapturePreviewScreen() {
  const { scrollPaddingBottom } = useSafePadding();
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const dispatch = useDispatch();
  const [verifyAddress, { isLoading: isVerifying }] = useVerifyAddressMutation();
  const { showSuccess, showError } = useToast();

  const addressUri = useSelector((state: RootState) => state.kyc.addressImageUri);
  const isLoading = useSelector((state: RootState) => state.kyc.isLoading);
  const error = useSelector((state: RootState) => state.kyc.error);

  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (uri) {
      setImageUri(uri as string);
      dispatch(setAddressImage(uri as string));
    } else if (addressUri) {
      setImageUri(addressUri);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri, addressUri]);

  const handleRetake = () => {
    dispatch(clearAddressImage());
    router.push('/kyc/address-capture');
  };

  const handleConfirm = async () => {
    if (!imageUri) {
      showError({ title: 'Error', message: 'No address document captured' });
      return;
    }

    try {
      dispatch(setLoading(true));

      // Build FormData
      const formData = new FormData();
      formData.append('addressImage', {
        uri: imageUri,
        name: 'address-document.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await verifyAddress(formData).unwrap();

      showSuccess({
        title: 'Address Verified',
        message: response.message || 'Address document verified successfully',
      });

      dispatch(setLoading(false));
      router.push('/kyc/facial-recognition');
    } catch (error: any) {
      console.error('Address verification error:', error);
      dispatch(setLoading(false));

      const errorMsg = error?.data?.message || 'Failed to verify address document';
      showError({
        title: 'Verification Failed',
        message: errorMsg,
      });
    }
  };

  return (
    <View className="flex-1 bg-[#00C897]">
      <KycHeader title="Proof of Address" showBar currentStep={4} totalSteps={5} />
      <KycCard>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: scrollPaddingBottom }}
          showsVerticalScrollIndicator={false}>
          {/* Address preview */}
          <View className="mb-6">
            <Text className="mb-3 text-[16px] font-bold text-[#1A1A1A]">Captured Document</Text>
            <TouchableOpacity
              onPress={handleRetake}
              activeOpacity={0.8}
              className="h-[220px] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#E8E8E8]">
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : (
                <View className="items-center">
                  <Text className="mb-2 text-[13px] text-[#AAA]">No document captured</Text>
                  <Text className="text-[14px] font-semibold text-[#00C897]">Tap to Capture</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Loading */}
          {(isLoading || isVerifying) && (
            <View className="mb-4 items-center py-4">
              <ActivityIndicator size="small" color="#00C897" />
              <Text className="mt-2 text-[14px] text-[#555]">Processing document…</Text>
            </View>
          )}

          {/* Error banner */}
          {error && (
            <View className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3">
              <Text className="text-[14px] text-red-600">{error}</Text>
            </View>
          )}

          {/* Photo Quality Guidelines */}
          <Text className="mb-3 mt-5 text-[16px] font-bold text-[#1A1A1A]">Photo Quality Guidelines</Text>
          {[
            'Readable, clear and not blurry',
            'Well-lit, not reflective, not too dark',
            'Document occupies most of the image',
          ].map((tip, i) => (
            <View key={i} className="mb-2 flex-row items-center">
              <CheckIcon />
              <Text className="ml-2 text-[14px] text-[#555]">{tip}</Text>
            </View>
          ))}

          {/* Please confirm that */}
          <Text className="mb-3 mt-5 text-[16px] font-bold text-[#1A1A1A]">Please confirm that</Text>
          {[
            'Document is within 3 months',
            'Document includes your name and address',
          ].map((tip, i) => (
            <View key={i} className="mb-2 flex-row items-start">
              <View className="mr-3 mt-1.5 h-1.5 w-1.5 rounded-full bg-[#888]" />
              <Text className="flex-1 text-[14px] text-[#555]">{tip}</Text>
            </View>
          ))}

          {/* Confirm button */}
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.8}
            disabled={!imageUri || isLoading || isVerifying}
            className={`mt-8 h-[54px] items-center justify-center rounded-full ${
              !imageUri || isLoading || isVerifying ? 'bg-[#CCC]' : 'bg-[#00C897]'
            }`}>
            <Text className="text-[17px] font-bold text-white">
              {isLoading || isVerifying ? 'Processing…' : 'Confirm'}
            </Text>
          </TouchableOpacity>

          {/* Retake button */}
          <TouchableOpacity
            onPress={handleRetake}
            activeOpacity={0.8}
            className="mt-3 h-[54px] items-center justify-center rounded-full bg-[#E4F7EE]"
            disabled={isLoading || isVerifying}>
            <Text className="text-[17px] font-semibold text-[#888]">Retake</Text>
          </TouchableOpacity>
        </ScrollView>
      </KycCard>
    </View>
  );
}