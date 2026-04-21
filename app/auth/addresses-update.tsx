import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAddAddressMutation, useLazyGetAddressesQuery } from '@/shared/libs/redux/features/auth/authApi';
import { useToast } from '@/shared/hooks/useToast';

const TYPE_OPTIONS = ['Home', 'Work', 'Other'];
const CITY_OPTIONS = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna'];
const STATE_OPTIONS = [
  'Dhaka Division',
  'Chittagong Division',
  'Sylhet Division',
  'Rajshahi Division',
  'Khulna Division',
];

// Address step: 1 = Permanent, 2 = Present
const ADDRESS_STEPS = [
  { step: 1, title: 'Add Permanent Address', subtitle: 'Your permanent residential address', type: 'PERMANENT' },
  { step: 2, title: 'Add Present Address', subtitle: 'Your current residential address', type: 'PRESENT' },
];

interface DropdownProps {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

const Dropdown = ({ label, placeholder, options, value, onChange, error }: DropdownProps) => {
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
      {error && <Text className="mt-1 text-[12px] text-red-500">{error}</Text>}
    </View>
  );
};

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  keyboardType?: any;
  error?: string;
}

const InputField = ({ label, placeholder, value, onChange, keyboardType, error }: InputFieldProps) => (
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
    {error && <Text className="mt-1 text-[12px] text-red-500">{error}</Text>}
  </View>
);

export default function AddressesUpdateScreen() {
  const insets = useSafeAreaInsets();
  const [addAddress, { isLoading }] = useAddAddressMutation();
  const [getAddresses, { isLoading: isLoadingFetch }] = useLazyGetAddressesQuery();
  const { showSuccess, showError } = useToast();

  // Track which address step we're on (1 = Permanent, 2 = Present)
  const [currentStep, setCurrentStep] = useState(1);

  const [type, setType] = useState('');
  const [address, setAddress] = useState('');
  const [postCode, setPostCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country] = useState('Bangladesh');
  const [yearsAtAddress, setYearsAtAddress] = useState('');

  // Fetch existing addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await getAddresses().unwrap();
        const addresses = response.data || [];

        const permanent = addresses.find((addr: any) => addr.type === 'PERMANENT');
        const present = addresses.find((addr: any) => addr.type === 'PRESENT');

        // If both addresses exist, skip to next screen
        if (permanent && present) {
          router.push('/kyc/started');
          return;
        }

        // If permanent exists but present doesn't, start with present
        if (permanent && !present) {
          setCurrentStep(2);
          // Pre-fill present form with empty values
          clearForm();
          return;
        }

        // If neither exists, start with permanent (step 1)
        clearForm();
      } catch {
        // If no addresses found, start fresh
        console.log('No existing addresses found, starting with empty form');
        clearForm();
      }
    };

    fetchAddresses();
  }, [getAddresses]);

  // Field-level errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Clear error when user starts typing
  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const clearForm = () => {
    setType('');
    setAddress('');
    setPostCode('');
    setCity('');
    setState('');
    setYearsAtAddress('');
    setErrors({});
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setErrors({});

    // Determine the address type based on current step
    const addressType = currentStep === 1 ? 'PERMANENT' : 'PRESENT';

    // Validate required fields
    const validationErrors: Record<string, string> = {};
    if (!address.trim()) {
      validationErrors.address = 'Address is required';
    }
    if (!postCode.trim()) {
      validationErrors.postCode = 'Post code is required';
    }
    if (!city) {
      validationErrors.city = 'City is required';
    }
    if (!state) {
      validationErrors.state = 'State is required';
    }
    if (!yearsAtAddress || isNaN(Number(yearsAtAddress))) {
      validationErrors.yearsAtAddress = 'Valid years at address is required';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showError({
        title: 'Validation Failed',
        message: 'Please fix the errors below',
      });
      return;
    }

    try {
      const response = await addAddress({
        type: addressType,
        address: address.trim(),
        postCode: postCode.trim(),
        city,
        state,
        country,
        yearsAtAddress: Number(yearsAtAddress),
        isPrimary: currentStep === 2, // Present address is primary
      }).unwrap();

      showSuccess({
        title: 'Success',
        message: response.message || `${currentStep === 1 ? 'Permanent' : 'Present'} address added successfully`,
      });

      if (currentStep === 1) {
        // First address added - move to second address
        clearForm();
        setCurrentStep(2);
      } else {
        // Second address added - navigate to next screen
        router.push('/kyc/started');
      }
    } catch (error: any) {
      console.error('Add address error:', error);

      // Handle validation errors (422)
      if (error?.status === 422) {
        const apiErrors = error.data?.errors || {};
        const fieldErrors: Record<string, string> = {};

        // Convert API errors to field-level errors
        Object.keys(apiErrors).forEach((field) => {
          const messages = apiErrors[field];
          if (Array.isArray(messages)) {
            fieldErrors[field] = messages[0];
          } else if (typeof messages === 'string') {
            fieldErrors[field] = messages;
          }
        });

        setErrors(fieldErrors);
        showError({
          title: 'Validation Failed',
          message: 'Please fix the errors below',
        });
      } else {
        // Handle other errors
        const errorMsg = error?.data?.message || 'Failed to add address';
        showError({ title: 'Error', message: errorMsg });
      }
    }
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-[#00C897]">
      {/* Header */}
      <View className="px-6 pb-10 pt-6">
        <Text className="text-[28px] font-bold text-[#0D2B1E]">
          {ADDRESS_STEPS[currentStep - 1].title}
        </Text>
        <Text className="text-[14px] text-[#0D2B1E] mt-1">
          {ADDRESS_STEPS[currentStep - 1].subtitle}
        </Text>
        {/* Step indicator */}
        <View className="mt-4 flex-row items-center">
          <View
            className={`h-2 flex-1 rounded-full ${
              currentStep >= 1 ? 'bg-white' : 'bg-white/30'
            }`}
          />
          <View
            className={`h-2 flex-1 rounded-full ${
              currentStep >= 2 ? 'bg-white' : 'bg-white/30'
            }`}
          />
        </View>
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
            onChange={(val) => {
              setType(val);
              clearError('type');
            }}
            error={errors.type}
          />
          <InputField
            label="Address"
            placeholder="XXXXXXXXXXXXXX"
            value={address}
            onChange={(val) => {
              setAddress(val);
              clearError('address');
            }}
            error={errors.address}
          />
          <InputField
            label="Post Code"
            placeholder="XXXX"
            value={postCode}
            onChange={(val) => {
              setPostCode(val);
              clearError('postcode');
            }}
            keyboardType="numeric"
            error={errors.postCode}
          />
          <Dropdown
            label="City"
            placeholder="Select the City"
            options={CITY_OPTIONS}
            value={city}
            onChange={(val) => {
              setCity(val);
              clearError('city');
            }}
            error={errors.city}
          />
          <Dropdown
            label="State"
            placeholder="Select the State"
            options={STATE_OPTIONS}
            value={state}
            onChange={(val) => {
              setState(val);
              clearError('state');
            }}
            error={errors.state}
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
            onChange={(val) => {
              setYearsAtAddress(val);
              clearError('yearsataddress');
            }}
            keyboardType="numeric"
            error={errors.yearsAtAddress}
          />

          {/* Next/Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading || isLoadingFetch}
            activeOpacity={0.8}
            className={`mt-4 h-[54px] items-center justify-center rounded-full ${
              isLoading || isLoadingFetch ? 'bg-[#CCC]' : 'bg-[#00C897]'
            }`}>
            {isLoading || isLoadingFetch ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-[18px] font-bold text-white">
                {currentStep === 1 ? 'Continue to Present Address' : 'Complete & Continue'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}
