import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { KycHeader, KycCard } from '@/shared/components/kyc'
import Svg, { Path } from 'react-native-svg'

const CheckIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 12 10" fill="none">
    <Path d="M1 5L4.5 8.5L11 1" stroke="#00C897" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
)

export default function AddressCapturePreviewScreen() {
  return (
    <View className="flex-1 bg-[#00C897]">
      <KycHeader title="Take photo" showBar currentStep={4} totalSteps={5} />
      <KycCard>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Bill preview */}
          <View className="w-full h-[220px] bg-[#F5F5F5] rounded-2xl overflow-hidden mb-6 items-center justify-center border border-[#E0E0E0]">
            <Text className="text-[#AAA] text-[13px]">Captured Document Photo</Text>
          </View>

          <Text className="text-[16px] font-bold text-[#1A1A1A] mb-3">After detected, you photo</Text>
          {[
            'Readable, clear and not blurry',
            'Well-lit, not reflective, not too dark',
            'ID occupies most of the image',
          ].map((tip, i) => (
            <View key={i} className="flex-row items-center mb-2">
              <CheckIcon />
              <Text className="text-[14px] text-[#555] ml-2">{tip}</Text>
            </View>
          ))}

          <Text className="text-[16px] font-bold text-[#1A1A1A] mt-5 mb-3">Please confirm that</Text>
          {[
            'Document is within 3 months',
            'Document include your name and Hong Kong address',
          ].map((tip, i) => (
            <View key={i} className="flex-row items-start mb-2">
              <View className="w-1.5 h-1.5 rounded-full bg-[#888] mr-3 mt-1.5" />
              <Text className="flex-1 text-[14px] text-[#555]">{tip}</Text>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => router.push('/kyc/facial-recognition')}
            activeOpacity={0.8}
            className="h-[54px] bg-[#00C897] rounded-full items-center justify-center mt-8"
          >
            <Text className="text-[17px] font-bold text-white">Confirm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className="h-[54px] bg-[#E4F7EE] rounded-full items-center justify-center mt-3"
          >
            <Text className="text-[17px] font-semibold text-[#888]">Retake</Text>
          </TouchableOpacity>
        </ScrollView>
      </KycCard>
    </View>
  )
}
