import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const OTP_LENGTH = 6

interface Props {
    email?: string
}

const EmailOTPVerificationScreen = ({ email = 'emil@gmail.com' }: Props) => {
    const insets = useSafeAreaInsets();
    const router = useRouter()
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
    const inputRefs = useRef<(TextInput | null)[]>([])

    const isFilled = otp.every((d) => d !== '')

    const handleChange = (text: string, index: number) => {
        const digit = text.replace(/[^0-9]/g, '').slice(-1)
        const newOtp = [...otp]
        newOtp[index] = digit
        setOtp(newOtp)
        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleVerify = () => {
        if (isFilled) {
            router.push('/auth/login')
        }
    }

    const handleResend = () => {
        setOtp(Array(OTP_LENGTH).fill(''))
        inputRefs.current[0]?.focus()
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, paddingTop: insets.top }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View className="flex-1 bg-[#00C897]">

                {/* Header */}
                <View className="pb-10 px-6">
                    <Text className="text-[28px] font-bold text-[#0D2B1E]">
                        Email OTP Verification
                    </Text>
                </View>

                {/* White card */}
                <View className="flex-1 bg-[#F0FFF4] rounded-tl-[40px] rounded-tr-[40px] px-6 pt-10 pb-10 justify-between">

                    <View>
                        {/* Description */}
                        <Text className="text-[15px] text-[#1A1A1A] leading-6 mb-10">
                            Enter the verification code we just sent to{'\n'}your email{' '}
                            <Text className="font-semibold text-[#1A1A1A]">{email}</Text>
                        </Text>

                        {/* OTP Boxes */}
                        <View className="flex-row justify-between mb-6">
                            {otp.map((digit, index) => (
                                <View
                                    key={index}
                                    className={`w-[52px] h-[52px] rounded-full items-center justify-center border-2 ${digit
                                        ? 'border-[#00C897] bg-white'
                                        : 'border-[#D0EDD8] bg-[#E8F5EC]'
                                        }`}
                                >
                                    <TextInput
                                        ref={(ref) => { inputRefs.current[index] = ref }}
                                        value={digit}
                                        onChangeText={(text) => handleChange(text, index)}
                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                        keyboardType="numeric"
                                        maxLength={1}
                                        className="w-full h-full text-center text-[18px] font-bold text-[#1A1A1A]"
                                        selectionColor="#00C897"
                                    />
                                </View>
                            ))}
                        </View>

                        {/* Resend */}
                        <View className="flex-row justify-center">
                            <Text className="text-[13px] text-[#888]">
                                {`Didn't receive code? `}
                            </Text>
                            <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                                <Text className="text-[13px] font-bold text-[#00C897] underline">
                                    Resend
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Verify Button */}
                    <TouchableOpacity
                        onPress={handleVerify}
                        activeOpacity={isFilled ? 0.8 : 1}
                        className={`h-[54px] rounded-full items-center justify-center ${isFilled ? 'bg-[#00C897]' : 'bg-[#C8DDD2]'
                            }`}
                    >
                        <Text
                            className={`text-[18px] font-bold ${isFilled ? 'text-white' : 'text-[#8AA898]'
                                }`}
                        >
                            Verify
                        </Text>
                    </TouchableOpacity>

                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

export default EmailOTPVerificationScreen