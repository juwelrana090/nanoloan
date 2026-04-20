import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { KycHeader, KycCard } from '@/shared/components/kyc';
import Svg, { Path, Circle } from 'react-native-svg';
import { Image } from 'expo-image';
import { RoundedFacial } from '@/shared/constants/images';

const HoldPhoneIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 2H8C6.89543 2 6 2.89543 6 4V20C6 21.1046 6.89543 22 8 22H16C17.1046 22 18 21.1046 18 20V4C18 2.89543 17.1046 2 16 2Z"
      stroke="#8C8C8C"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 18H12.01"
      stroke="#8C8C8C"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const WellLitIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={5} stroke="#01BC8D" strokeWidth={2} />
    <Path
      d="M12 3V4M12 20V21M5.64 5.64L6.34 6.34M17.66 17.66L18.36 18.36M3 12H4M20 12H21M5.64 18.36L6.34 17.66M17.66 6.34L18.36 5.64"
      stroke="#8C8C8C"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const OccludedFaceIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke="#8C8C8C" strokeWidth={2} />
    <Path
      d="M8 10H8.01M16 10H16.01M9 15C9 15 10 16 12 16C14 16 15 15 15 15"
      stroke="#8C8C8C"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M7 8L17 16" stroke="#01BC8D" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const PersonOutlineIcon = () => (
  <Svg width={80} height={80} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21C20 18.2386 17.7614 16 15 16H9C6.23858 16 4 18.2386 4 21"
      stroke="#00C897"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={7} r={4} stroke="#00C897" strokeWidth={1.5} />
  </Svg>
);

export default function FacialRecognitionScreen() {
  return (
    <View className="flex-1 bg-[#00C897]">
      <KycHeader title="Facial recognition" showBar currentStep={5} totalSteps={5} />
      <KycCard>
        <View className="flex-1 justify-between px-6 pb-10 pt-8">
          <View className="items-center">
            {/* Face circle */}
            <View className="mb-6 h-[140px] w-[140px] items-center justify-center overflow-hidden rounded-full border-2 border-[#00C897] bg-[#E4F7EE]">
              <Image
                source={RoundedFacial}
                alt="Facial recognition"
                style={{ width: 140, height: 140 }}
              />
            </View>

            <Text className="mb-3 text-[20px] font-bold text-[#1A1A1A]">Facial recognition</Text>
            <Text className="mb-8 px-4 text-center text-[14px] leading-5 text-[#888]">
              In order to improve the success rate of face recognition, please follow these
              requirements below
            </Text>

            {/* Hints row */}
            <View className="w-full flex-row justify-around">
              <View className="w-[90px] items-center">
                <View className="mb-2 h-[52px] w-[52px] items-center justify-center rounded-full bg-[#E4F7EE]">
                  <HoldPhoneIcon />
                </View>
                <Text className="text-center text-[12px] leading-4 text-[#555]">
                  Hold phone{'\n'}upright
                </Text>
              </View>
              <View className="w-[90px] items-center">
                <View className="mb-2 h-[52px] w-[52px] items-center justify-center rounded-full bg-[#E4F7EE]">
                  <WellLitIcon />
                </View>
                <Text className="text-center text-[12px] leading-4 text-[#555]">Well-lit</Text>
              </View>
              <View className="w-[90px] items-center">
                <View className="mb-2 h-[52px] w-[52px] items-center justify-center rounded-full bg-[#E4F7EE]">
                  <OccludedFaceIcon />
                </View>
                <Text className="text-center text-[12px] leading-4 text-[#555]">
                  {`Don't \n occluded face`}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/kyc/verified')}
            activeOpacity={0.8}
            className="h-[54px] items-center justify-center rounded-full bg-[#00C897]">
            <Text className="text-[17px] font-bold text-white">Continue</Text>
          </TouchableOpacity>
        </View>
      </KycCard>
    </View>
  );
}
