import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const TYPE_OPTIONS = ['Home', 'Work', 'Other'];
const CITY_OPTIONS = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna'];
const STATE_OPTIONS = [
  'Dhaka Division',
  'Chittagong Division',
  'Sylhet Division',
  'Rajshahi Division',
  'Khulna Division',
];

interface DropdownProps {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

const Dropdown = ({ label, placeholder, options, value, onChange }: DropdownProps) => {
  const [open, setOpen] = useState(false);

  return (
    <View className="mb-5">
      <Text className="mb-2 text-[15px] font-semibold text-[#1A1A1A]">{label}</Text>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
        className="h-[52px] flex-row items-center justify-between rounded-full bg-[#E4F7EE] px-5">
        <Text className={`text-[15px] ${value ? 'text-[#1A1A1A]' : 'text-[#A0C4B0]'}`}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#00C897" />
      </TouchableOpacity>
      {open && (
        <View className="z-10 mt-1 overflow-hidden rounded-2xl border border-[#D0EDD8] bg-white">
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="border-b border-[#E4F7EE] px-5 py-3"
              activeOpacity={0.7}>
              <Text className="text-[15px] text-[#1A1A1A]">{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  keyboardType?: any;
}

const InputField = ({ label, placeholder, value, onChange, keyboardType }: InputFieldProps) => (
  <View className="mb-5">
    <Text className="mb-2 text-[15px] font-semibold text-[#1A1A1A]">{label}</Text>
    <View className="h-[52px] justify-center rounded-full bg-[#E4F7EE] px-5">
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#A0C4B0"
        keyboardType={keyboardType || 'default'}
        className="text-[15px] text-[#1A1A1A]"
      />
    </View>
  </View>
);

export default function AddressesUpdateScreen() {
  const insets = useSafeAreaInsets();
  const [type, setType] = useState('');
  const [address, setAddress] = useState('');
  const [postCode, setPostCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country] = useState('Bangladesh');
  const [yearsAtAddress, setYearsAtAddress] = useState('');

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-[#00C897]">
      {/* Header */}
      <View className="px-6 pb-10 pt-6">
        <Text className="text-[28px] font-bold text-[#0D2B1E]">Addresses Update</Text>
      </View>

      {/* White card */}
      <View className="flex-1 rounded-tl-[40px] rounded-tr-[40px] bg-[#F0FFF4]">
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Dropdown
            label="Type"
            placeholder="Select the  Type"
            options={TYPE_OPTIONS}
            value={type}
            onChange={setType}
          />
          <InputField
            label="Address"
            placeholder="XXXXXXXXXXXXXX"
            value={address}
            onChange={setAddress}
          />
          <InputField
            label="Post Code"
            placeholder="XXXX"
            value={postCode}
            onChange={setPostCode}
            keyboardType="numeric"
          />
          <Dropdown
            label="City"
            placeholder="Select the City"
            options={CITY_OPTIONS}
            value={city}
            onChange={setCity}
          />
          <Dropdown
            label="State"
            placeholder="Select the State"
            options={STATE_OPTIONS}
            value={state}
            onChange={setState}
          />
          <InputField
            label="Country"
            placeholder="Bangladesh"
            value={country}
            onChange={() => {}}
          />
          <InputField
            label="Years At Address"
            placeholder="8"
            value={yearsAtAddress}
            onChange={setYearsAtAddress}
            keyboardType="numeric"
          />

          {/* Next Button */}
          <TouchableOpacity
            onPress={() => router.push('/kyc/started')}
            activeOpacity={0.8}
            className="mt-4 h-[54px] items-center justify-center rounded-full bg-[#00C897]">
            <Text className="text-[18px] font-bold text-white">Next</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}
