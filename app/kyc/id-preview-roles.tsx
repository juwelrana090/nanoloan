import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { KycHeader, KycCard } from '@/shared/components/kyc';
import { SelectId } from '@/shared/constants/images';

export default function IDPreviewRolesScreen() {
  return (
    <View className="flex-1 bg-[#00C897]">
      <KycHeader title="Select ID Type" showBar />
      <KycCard>
        <View className="flex-1 justify-between px-6 pb-10 pt-8">
          {/* ID Card Illustration */}
          <View>
            <View className="mb-8 h-[180px] w-full items-center justify-start overflow-hidden rounded-2xl bg-[#f7f6f6]/75">
              <Image source={SelectId} style={{ width: 168, height: 151 }} />
            </View>

            <Text className="mb-4 text-[18px] font-bold text-[#1A1A1A]">
              Before taking your passport photo, please make sure that
            </Text>

            {["Your ID isn't expired", 'Take a clear photo', 'Capture you entire ID'].map(
              (tip, i) => (
                <View key={i} className="mb-2 flex-row items-center">
                  <View className="mr-3 h-1.5 w-1.5 rounded-full bg-[#888]" />
                  <Text className="text-[14px] text-[#555]">{tip}</Text>
                </View>
              )
            )}
          </View>

          <TouchableOpacity
            onPress={() => router.push('/kyc/id-capture')}
            activeOpacity={0.8}
            className="h-[54px] items-center justify-center rounded-full bg-[#00C897]">
            <Text className="text-[17px] font-bold text-white">Take Photo</Text>
          </TouchableOpacity>
        </View>
      </KycCard>
    </View>
  );
}
