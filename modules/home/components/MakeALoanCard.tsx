import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export const MakeALoanCard: React.FC = () => {
  return (
    <View
      style={{
        height: 111,
        paddingHorizontal: 16.53,
        paddingTop: 17,
        paddingBottom: 17,
        backgroundColor: '#00D09E',
        borderRadius: 30,
      }}>
      {/* Title - Figma: x:16.53, y:17 (from padding), height:24px */}
      {/* Description starts at y:40, so margin-bottom = 40 - (17 + 24) = -1 */}
      <Text
        className="text-[18px] font-bold leading-[24px]"
        style={{
          fontFamily: 'Arial',
          color: '#052224',
          marginBottom: -1,
        }}>
        Make a loan
      </Text>

      {/* Description - Figma: x:16.53, y:40 (from padding), height:24px */}
      {/* Button starts at y:68, so margin-bottom = 68 - (40 + 24) = 4 */}
      <Text
        className="text-[10px] font-normal leading-[24px]"
        style={{
          fontFamily: 'Arial',
          color: '#052224',
          marginBottom: 4,
        }}>
        we are ready to help you for your awesome work. let&apos;s invest there.
      </Text>

      {/* Create Application Button - Figma: y:68, size:159.77×25px */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/loans/check-eligibility' as any)}
        style={{
          width: 159.77,
          height: 25,
          backgroundColor: '#FFFFFF',
          borderRadius: 30,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {/* Button Text - Figma: x:28.65 (from button left), y:1 (from button top) */}
        <Text
          className="text-[10px] font-bold leading-[24px]"
          style={{
            fontFamily: 'Arial',
            color: '#0E3E3E',
            marginTop: 1,
          }}>
          Create Application
        </Text>
      </TouchableOpacity>
    </View>
  );
};
