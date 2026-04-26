import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useRef, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVerifyEmail } from '@/modules/verify-email/hooks/useVerifyEmail';

const OTP_LENGTH = 6;

const EmailOTPVerificationScreen = () => {
  const insets = useSafeAreaInsets();
  const { userId, email } = useLocalSearchParams<{ userId: string; email: string }>();
  const { verify, resend, isVerifying, isResending, error, resendSuccess } = useVerifyEmail(
    email ?? ''
  );
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));

  const isFilled = otp.every((d) => d !== '');
  const isDisabled = isVerifying || isResending;

  const handleChange = useCallback((text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [otp]);

  const handleKeyPress = useCallback((e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handleVerify = useCallback(() => {
    if (isFilled && !isDisabled) {
      verify(email ?? '', otp.join(''));
    }
  }, [isFilled, isDisabled, verify, email, otp]);

  const handleResend = useCallback(() => {
    if (!isDisabled) {
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      resend();
    }
  }, [isDisabled, resend]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, paddingTop: insets.top }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="flex-1 bg-[#00C897]">
        {/* Header */}
        <View className="px-6 pb-10">
          <Text className="text-[28px] font-bold text-[#0D2B1E]">Email OTP Verification</Text>
        </View>

        {/* White card */}
        <View className="flex-1 justify-between rounded-tl-[40px] rounded-tr-[40px] bg-[#F0FFF4] px-6 pb-10 pt-10">
          <View>
            {/* Description */}
            <Text className="mb-6 text-[15px] leading-6 text-[#1A1A1A]">
              Enter the verification code we sent to{'\n'}
              <Text className="font-semibold text-[#1A1A1A]">{email || 'your email address'}</Text>
            </Text>

            {/* Error / success messages */}
            {error ? (
              <View className="mb-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                <Text className="text-[13px] text-red-600">{error}</Text>
              </View>
            ) : null}
            {resendSuccess ? (
              <View className="mb-4 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                <Text className="text-[13px] text-green-700">OTP resent successfully.</Text>
              </View>
            ) : null}

            {/* OTP Boxes */}
            <View className="mb-6 flex-row justify-between">
              {otp.map((digit, index) => (
                <View
                  key={index}
                  className={`h-[52px] w-[52px] items-center justify-center rounded-full border-2 ${
                    digit ? 'border-[#00C897] bg-white' : 'border-[#D0EDD8] bg-[#E8F5EC]'
                  }`}>
                  <TextInput
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    value={digit}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    editable={!isDisabled}
                    className="h-full w-full text-center text-[18px] font-bold text-[#1A1A1A]"
                    selectionColor="#00C897"
                  />
                </View>
              ))}
            </View>

            {/* Resend */}
            <View className="flex-row justify-center">
              <Text className="text-[13px] text-[#888]">{`Didn't receive code? `}</Text>
              <TouchableOpacity onPress={handleResend} activeOpacity={0.7} disabled={isDisabled}>
                {isResending ? (
                  <ActivityIndicator size="small" color="#00C897" />
                ) : (
                  <Text className="text-[13px] font-bold text-[#00C897] underline">Resend</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            onPress={handleVerify}
            disabled={!isFilled || isDisabled}
            activeOpacity={isFilled ? 0.8 : 1}
            className={`h-[54px] items-center justify-center rounded-full ${
              isFilled && !isDisabled ? 'bg-[#00C897]' : 'bg-[#C8DDD2]'
            }`}>
            {isVerifying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                className={`text-[18px] font-bold ${isFilled && !isDisabled ? 'text-white' : 'text-[#8AA898]'}`}>
                Verify
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default EmailOTPVerificationScreen;
