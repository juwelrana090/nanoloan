import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useState, useEffect } from 'react';
import { Svg, Path } from 'react-native-svg';
import { router } from 'expo-router';
import { KycHeader, KycCard } from '@/shared/components/kyc';
import { IdCard, Passport, DriverLicense } from '@/shared/constants/images';
import { useDispatch } from 'react-redux';
import { resetKYC, setSelectedIdType } from '@/shared/libs/redux/features/kyc/kycSlice';

const CheckmarkIcon = () => (
  <View
    style={{
      width: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 2,
    }}>
    <Svg width={12} height={10} viewBox="0 0 12 10" fill="none">
      <Path
        d="M1 5L4.5 8.5L11 1"
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

const ID_TYPES = [
  { id: 'NID', label: 'NID card', image: IdCard },
  { id: 'PASSPORT', label: 'Passport', image: Passport },
  // { id: 'drivers_license', label: "Driver's license", image: DriverLicense },
];

export default function SelectIDTypeScreen() {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState('id_card');

  useEffect(() => {
    // Clear all old KYC data when starting fresh
    dispatch(resetKYC());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = () => {
    // Save selected ID type to Redux
    dispatch(setSelectedIdType(selected as 'NID' | 'PASSPORT'));
    router.push('/kyc/id-capture?side=front');
  };

  return (
    <View className="flex-1 bg-[#00C897]">
      <KycHeader title="Select ID Type" showBar currentStep={1} totalSteps={5} />
      <KycCard>
        <View className="flex-1 px-6 pt-8">
          <Text className="mb-6 text-[15px] text-[#1A1A1A]">
            What method would you prefer to use?
          </Text>

          {ID_TYPES.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setSelected(item.id)}
              activeOpacity={0.8}
              className="mb-3 h-[64px] flex-row items-center rounded-2xl border border-[#E4F7EE] bg-white px-4">
              <View className="mr-4 h-[48px] w-[48px] items-center justify-center rounded-full bg-[#E4F7EE]">
                <Image source={item.image} style={{ width: 24, height: 24 }} contentFit="contain" />
              </View>
              <Text className="flex-1 text-[16px] font-semibold text-[#1A1A1A]">{item.label}</Text>
              <View
                className={`h-6 w-6 items-center justify-center rounded-full ${
                  selected === item.id ? 'bg-[#1A1A1A]' : 'border-2 border-[#CCC] bg-transparent'
                }`}>
                {selected === item.id && <CheckmarkIcon />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View className="px-6 pb-10">
          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.8}
            className="h-[54px] items-center justify-center rounded-full bg-[#00C897]">
            <Text className="text-[17px] font-bold text-white">Continue</Text>
          </TouchableOpacity>
        </View>
      </KycCard>
    </View>
  );
}
