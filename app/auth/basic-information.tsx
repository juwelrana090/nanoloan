import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const MARITAL_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed'];
const EDUCATION_OPTIONS = ['Primary', 'Secondary', 'Diploma', 'Bachelor', 'Master', 'PhD'];

interface DropdownProps {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}

const Dropdown = ({ label, placeholder, options, value, onChange, required }: DropdownProps) => {
  const [open, setOpen] = useState(false);

  return (
    <View className="mb-5">
      <Text className="mb-2 text-[15px] font-semibold text-[#1A1A1A]">
        {label}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>
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
  required?: boolean;
  keyboardType?: any;
}

const InputField = ({
  label,
  placeholder,
  value,
  onChange,
  required,
  keyboardType,
}: InputFieldProps) => (
  <View className="mb-5">
    <Text className="mb-2 text-[15px] font-semibold text-[#1A1A1A]">
      {label}
      {required && <Text className="text-red-500"> *</Text>}
    </Text>
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

export default function BasicInformationScreen() {
  const insets = useSafeAreaInsets();
  const [gender, setGender] = useState('');
  const [marital, setMarital] = useState('');
  const [education, setEducation] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [tin, setTin] = useState('');
  const [passport, setPassport] = useState('');

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-[#00C897]">
      {/* Header */}
      <View className="px-6 pb-10 pt-6">
        <Text className="text-[28px] font-bold text-[#0D2B1E]">Basic Information</Text>
      </View>

      {/* White card */}
      <View className="flex-1 rounded-tl-[40px] rounded-tr-[40px] bg-[#F0FFF4]">
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Dropdown
            label="Gender"
            placeholder="Select the Gender"
            options={GENDER_OPTIONS}
            value={gender}
            onChange={setGender}
          />
          <Dropdown
            label="Marital Status"
            placeholder="Select the Status"
            options={MARITAL_OPTIONS}
            value={marital}
            onChange={setMarital}
          />
          <Dropdown
            label="Education Level"
            placeholder="Select the Level"
            options={EDUCATION_OPTIONS}
            value={education}
            onChange={setEducation}
          />
          <InputField
            label="National ID"
            placeholder="XXXXXXXXXXXXXX"
            value={nationalId}
            onChange={setNationalId}
            required
          />
          <InputField
            label="TIN"
            placeholder="XXXXXXXXXXXXXX"
            value={tin}
            onChange={setTin}
            required
          />
          <InputField
            label="Passport No."
            placeholder="XXXXXXXXXXXXXX"
            value={passport}
            onChange={setPassport}
          />

          {/* Next Button */}
          <TouchableOpacity
            onPress={() => router.push('/auth/addresses-update')}
            activeOpacity={0.8}
            className="mt-4 h-[54px] items-center justify-center rounded-full bg-[#00C897]">
            <Text className="text-[18px] font-bold text-white">Next</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}
