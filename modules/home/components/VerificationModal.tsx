import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { router } from 'expo-router';

interface BiometricStatus {
  idVerified?: boolean;
  addressVerified?: boolean;
  faceVerified?: boolean;
}

interface VerificationModalProps {
  biometricStatus: BiometricStatus | null;
  isLoading: boolean;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  biometricStatus,
  isLoading,
}) => {
  const needsVerification =
    !isLoading &&
    biometricStatus &&
    (!biometricStatus.idVerified ||
      !biometricStatus.addressVerified ||
      !biometricStatus.faceVerified);

  const getNextVerificationRoute = () => {
    if (!biometricStatus) return null;

    // Check in order: ID → Address → Face
    // if (!biometricStatus.idVerified) {
    //   return '/kyc/select-id-type';
    // }
    // if (!biometricStatus.addressVerified) {
    //   return '/kyc/address-roles';
    // }
    // if (!biometricStatus.faceVerified) {
    //   return '/kyc/facial-recognition';
    // }
    return 'auth/basic-information';
  };

  const handleVerifyPress = () => {
    const route = getNextVerificationRoute();
    if (route) {
      router.push(route as any);
    }
  };

  if (!needsVerification) return null;

  return (
    <Modal visible={needsVerification} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
          {/* Icon */}
          <View className="mb-4 items-center">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#FFF8E1]">
              <Text className="text-3xl">🔒</Text>
            </View>
          </View>

          {/* Title */}
          <Text className="mb-2 text-center text-[22px] font-bold text-[#1A1A1A]">
            Verification Required
          </Text>

          {/* Message */}
          <Text className="mb-6 text-center text-[14px] leading-5 text-[#666]">
            {(!biometricStatus?.idVerified && 'Verify your ID to continue using the app') ||
              (!biometricStatus?.addressVerified &&
                'Verify your address to continue using the app') ||
              (!biometricStatus?.faceVerified &&
                'Complete facial recognition to continue using the app') ||
              'Complete verification to access all features'}
          </Text>

          {/* Verification Steps */}
          <View className="mb-6 flex flex-col gap-2">
            <View className="flex-row items-center gap-3">
              <View
                className={`h-6 w-6 items-center justify-center rounded-full ${
                  biometricStatus?.idVerified ? 'bg-[#00C897]' : 'bg-[#E0E0E0]'
                }`}>
                {biometricStatus?.idVerified && (
                  <Text className="text-[10px] font-bold text-white">✓</Text>
                )}
              </View>
              <Text
                className={`flex-1 text-[13px] ${
                  biometricStatus?.idVerified ? 'text-[#999]' : 'text-[#1A1A1A]'
                }`}>
                ID Verification
              </Text>
            </View>

            <View className="flex-row items-center gap-3">
              <View
                className={`h-6 w-6 items-center justify-center rounded-full ${
                  biometricStatus?.addressVerified ? 'bg-[#00C897]' : 'bg-[#E0E0E0]'
                }`}>
                {biometricStatus?.addressVerified && (
                  <Text className="text-[10px] font-bold text-white">✓</Text>
                )}
              </View>
              <Text
                className={`flex-1 text-[13px] ${
                  biometricStatus?.addressVerified ? 'text-[#999]' : 'text-[#1A1A1A]'
                }`}>
                Address Verification
              </Text>
            </View>

            <View className="flex-row items-center gap-3">
              <View
                className={`h-6 w-6 items-center justify-center rounded-full ${
                  biometricStatus?.faceVerified ? 'bg-[#00C897]' : 'bg-[#E0E0E0]'
                }`}>
                {biometricStatus?.faceVerified && (
                  <Text className="text-[10px] font-bold text-white">✓</Text>
                )}
              </View>
              <Text
                className={`flex-1 text-[13px] ${
                  biometricStatus?.faceVerified ? 'text-[#999]' : 'text-[#1A1A1A]'
                }`}>
                Facial Recognition
              </Text>
            </View>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            onPress={handleVerifyPress}
            activeOpacity={0.8}
            className="h-[52px] items-center justify-center rounded-2xl bg-[#00C897]">
            <Text className="text-[16px] font-bold text-white">
              {(!biometricStatus?.idVerified && 'Verify ID') ||
                (!biometricStatus?.addressVerified && 'Verify Address') ||
                (!biometricStatus?.faceVerified && 'Complete Facial Recognition') ||
                'Complete Verification'}
            </Text>
          </TouchableOpacity>

          {/* Note */}
          <Text className="mt-4 text-center text-[12px] text-[#999]">
            You need to complete all verification steps to use the app
          </Text>
        </View>
      </View>
    </Modal>
  );
};
