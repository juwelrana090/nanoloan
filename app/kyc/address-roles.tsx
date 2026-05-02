import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { KycHeader, KycCard } from '@/shared/components/kyc'
import Svg, { Path, Circle } from 'react-native-svg'
import { useSafePadding } from '@/shared/hooks/useSafePadding'

const LocationIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10C21 17 15 22 12 22C9 22 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx={12} cy={10} r={3} fill="white" />
  </Svg>
)

export default function AddressRolesScreen() {
  const { scrollPaddingBottom } = useSafePadding()
  return (
    <View className="flex-1 bg-[#00C897]">
      <KycHeader title="Address Verify" showBar currentStep={4} totalSteps={5} />
      <KycCard>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: scrollPaddingBottom }}
          showsVerticalScrollIndicator={false}
        >
          {/* Address card illustration */}
          <View className="items-center mb-6">
            <View className="relative w-full h-[160px] items-center justify-center">
              {/* Back card */}
              <View className="absolute w-[220px] h-[130px] bg-[#E0F0E6] rounded-xl left-8 top-4" />
              {/* Front card */}
              <View className="absolute w-[220px] h-[130px] bg-white rounded-xl right-6 top-0 shadow-sm border border-[#E4F7EE] px-4 pt-3">
                <View className="w-[36px] h-[36px] bg-[#00C897] rounded-lg items-center justify-center mb-2">
                  <LocationIcon />
                </View>
                <Text className="text-[14px] font-bold text-[#1A1A1A]">David Smith</Text>
                <Text className="text-[12px] text-[#888] mt-1">Address</Text>
                <Text className="text-[12px] text-[#888]">06-08-2023</Text>
              </View>
            </View>
          </View>

          <Text className="text-[18px] font-bold text-[#1A1A1A] mb-2">Proof of address</Text>
          <Text className="text-[14px] text-[#888] mb-5">
            We need proof of address to confirm that you live in Hong Kong
          </Text>

          {[
            'You can use any of the following documents as proof of address documentation: Utility bills / Bank statement / Communication billing',
            'The document must contain your name, address in Hong Kong, date within the last 3 months',
            'Please provide supporting documents in English',
          ].map((tip, i) => (
            <View key={i} className="flex-row items-start mb-4">
              <View className="w-5 h-5 rounded-full bg-[#E4F7EE] items-center justify-center mt-0.5 mr-3">
                <View className="w-1.5 h-1.5 rounded-full bg-[#00C897]" />
              </View>
              <Text className="flex-1 text-[13px] text-[#555] leading-5">{tip}</Text>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => router.push('/kyc/address-capture')}
            activeOpacity={0.8}
            className="h-[54px] bg-[#00C897] rounded-full items-center justify-center mt-6"
          >
            <Text className="text-[17px] font-bold text-white">Take Photo</Text>
          </TouchableOpacity>
        </ScrollView>
      </KycCard>
    </View>
  )
}
