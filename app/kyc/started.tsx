import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { KycHeader, KycCard } from '@/shared/components/kyc';
import { PhotoId, ProofOfAddress, FacialRecognition } from '@/shared/constants/images';
import { useStartVerificationMutation } from '@/shared/libs/redux/features/biometric/biometricApi';
import { useAppDispatch } from '@/shared/hooks/useAppSelector';
import { setBiometricSessionId } from '@/shared/libs/redux/features/kyc/kycSlice';
import { useToast } from '@/shared/hooks/useToast';

const steps = [
  {
    image: PhotoId,
    title: 'Photo ID',
    desc: 'ID card, passport, driver license supported',
  },
  {
    image: ProofOfAddress,
    title: 'Proof of address',
    desc: 'Documents that can prove the address, such as utility bills, etc',
  },
  {
    image: FacialRecognition,
    title: 'Facial recognition',
    desc: 'Confirm that the portrait matches the picture on the identification document.',
  },
];

export default function StartedVerificationScreen() {
  const [startVerification, { isLoading }] = useStartVerificationMutation();
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useToast();

  const handleStartVerification = async () => {
    try {
      const response = await startVerification({}).unwrap();

      // Save session ID to Redux store
      if (response.data?.sessionId) {
        dispatch(setBiometricSessionId(response.data.sessionId));
      }

      showSuccess({
        title: 'Verification Started',
        message: response.message || 'Please follow the instructions',
      });

      // Navigate to ID type selection
      router.push('/kyc/select-id-type');
    } catch (error: any) {
      console.error('Start verification error:', error);

      // Handle errors
      const errorMsg = error?.data?.message || 'Failed to start verification';
      showError({
        title: 'Error',
        message: errorMsg,
      });
    }
  };
  return (
    <View className="flex-1 bg-[#00C897]">
      <KycHeader title="Let's Get Started" />
      <KycCard>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}>
          <Text className="mb-8 text-[14px] leading-5 text-[#888]">
            To ensure the security of your account and protect against fraud, we require you to
            complete our identity verification process
          </Text>

          {steps.map((s, i) => (
            <View key={i} className="mb-7 flex-row items-start">
              <View className="mr-4 h-[52px] w-[40px] items-center justify-center">
                <Image source={s.image} style={{ width: 40, height: 28 }} contentFit="contain" />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-[16px] font-bold text-[#1A1A1A]">{s.title}</Text>
                <Text className="text-[13px] leading-5 text-[#888]">{s.desc}</Text>
              </View>
            </View>
          ))}

          <View className="mb-24 mt-24">
            <Text className="text-[12px] leading-5 text-[#888]">
              Clicking the continue button means that I have read and agreed to the{' '}
              <Text className="font-semibold text-[#00C897] underline">
                user identity authentication information statement
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleStartVerification}
            disabled={isLoading}
            activeOpacity={0.8}
            className={`h-[54px] items-center justify-center rounded-full ${
              isLoading ? 'bg-[#CCC]' : 'bg-[#00C897]'
            }`}>
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-[17px] font-bold text-white">Agree And Continue</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KycCard>
    </View>
  );
}
