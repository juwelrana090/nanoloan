import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { KycHeader, KycCard } from '@/shared/components/kyc';
import { PhotoId, ProofOfAddress, FacialRecognition } from '@/shared/constants/images';

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
            onPress={() => router.push('/kyc/select-id-type')}
            activeOpacity={0.8}
            className="h-[54px] items-center justify-center rounded-full bg-[#00C897]">
            <Text className="text-[17px] font-bold text-white">Agree And Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </KycCard>
    </View>
  );
}
