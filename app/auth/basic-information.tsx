import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  useUpdateBasicInfoMutation,
  useUpdateProfileMutation,
  useLazyGetMeQuery,
} from '@/shared/libs/redux/features/auth/authApi';
import { useToast } from '@/shared/hooks/useToast';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/useAppSelector';
import { setLogout } from '@/shared/libs/redux/features/auth/authSlice';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const MARITAL_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed'];
const EDUCATION_OPTIONS = ['Primary', 'Secondary', 'Diploma', 'Bachelor', 'Master', 'PhD'];

// Reverse mapping for API values to UI values
const genderMapReverse: Record<string, 'Male' | 'Female' | 'Other'> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
};

const maritalMapReverse: Record<string, 'Single' | 'Married' | 'Divorced' | 'Widowed'> = {
  SINGLE: 'Single',
  MARRIED: 'Married',
  DIVORCED: 'Divorced',
  WIDOWED: 'Widowed',
};

const educationMapReverse: Record<
  string,
  'Primary' | 'Secondary' | 'Diploma' | 'Bachelor' | 'Master' | 'PhD'
> = {
  PRIMARY: 'Primary',
  SECONDARY: 'Secondary',
  DIPLOMA: 'Diploma',
  BACHELOR: 'Bachelor',
  MASTER: 'Master',
  PHD: 'PhD',
  OTHER: 'Primary',
};

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
  error?: string;
}

const InputField = ({
  label,
  placeholder,
  value,
  onChange,
  required,
  keyboardType,
  error,
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
    {error && <Text className="mt-1 text-[12px] text-red-500">{error}</Text>}
  </View>
);

export default function BasicInformationScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [updateBasicInfo, { isLoading: isLoadingBasic }] = useUpdateBasicInfoMutation();
  const [updateProfile, { isLoading: isLoadingProfile }] = useUpdateProfileMutation();
  const [getMe, { isLoading: isLoadingFetch }] = useLazyGetMeQuery();
  const { showSuccess, showError } = useToast();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  const [gender, setGender] = useState('');
  const [marital, setMarital] = useState('');
  const [education, setEducation] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [tin, setTin] = useState('');
  const [passport, setPassport] = useState('');

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      // Check if user is authenticated before fetching
      if (!isAuthenticated || !token) {
        console.log('❌ User not authenticated, skipping fetch');
        dispatch(setLogout());
        router.replace('/(auth)/login' as any);
        return;
      }

      try {
        const response = await getMe().unwrap();
        const data = response.data;

        // Pre-fill fields if data exists
        if (data.gender) {
          setGender(genderMapReverse[data.gender] || '');
        }
        if (data.profile?.maritalStatus) {
          setMarital(maritalMapReverse[data.profile.maritalStatus] || '');
        }
        if (data.profile?.educationLevel) {
          setEducation(educationMapReverse[data.profile.educationLevel] || '');
        }
        if (data.profile?.nationalId) {
          setNationalId(data.profile.nationalId);
        }
        if (data.profile?.tin) {
          setTin(data.profile.tin);
        }
        if (data.profile?.passportNo) {
          setPassport(data.profile.passportNo);
        }
      } catch (error: any) {
        console.error('❌ Error fetching user data:', error);

        // Handle 404 - User not found (auto logout)
        if (error?.status === 404) {
          console.log('❌ User not found (404) - auto-logging out...');
          showError({
            title: 'Session Expired',
            message: 'Your account was not found. Please log in again.',
          });
          // Auto logout and redirect to login
          dispatch(setLogout());
          setTimeout(() => {
            router.replace('/(auth)/login' as any);
          }, 1500);
          return;
        }

        // Handle 401 - Unauthorized (already handled by API interceptor, but log here too)
        if (error?.status === 401) {
          console.log('❌ Unauthorized access (401)');
          return;
        }

        // Handle other errors - start with empty form
        console.log('⚠️ Other error, starting with empty form');
        if (error?.status !== 401) { // Don't show error for 401 as it's handled by API interceptor
          showError({
            title: 'Notice',
            message: 'Could not load your existing data. Please fill out the form.',
          });
        }
      }
    };

    fetchUserData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token, dispatch, showError]);

  // Clear error when user starts typing
  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setErrors({});

    // Validate required fields
    const validationErrors: Record<string, string> = {};
    if (!nationalId.trim()) {
      validationErrors.nationalId = 'National ID is required';
    }
    if (!tin.trim()) {
      validationErrors.tin = 'TIN is required';
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
      // Map form values to API enum values
      const genderMap: Record<string, 'MALE' | 'FEMALE' | 'OTHER'> = {
        Male: 'MALE',
        Female: 'FEMALE',
        Other: 'OTHER',
      };

      const maritalMap: Record<string, 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED'> = {
        Single: 'SINGLE',
        Married: 'MARRIED',
        Divorced: 'DIVORCED',
        Widowed: 'WIDOWED',
      };

      const educationMap: Record<
        string,
        'PRIMARY' | 'SECONDARY' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'PHD' | 'OTHER'
      > = {
        Primary: 'PRIMARY',
        Secondary: 'SECONDARY',
        Diploma: 'DIPLOMA',
        Bachelor: 'BACHELOR',
        Master: 'MASTER',
        PhD: 'PHD',
      };

      // Call both APIs in parallel
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [profileResponse, basicInfoResponse] = await Promise.all([
        // Update gender (separate endpoint)
        gender
          ? updateProfile({
              gender: genderMap[gender],
            }).unwrap()
          : Promise.resolve(null),
        // Update other fields
        updateBasicInfo({
          maritalStatus: marital ? maritalMap[marital] : undefined,
          educationLevel: education ? educationMap[education] : undefined,
          nationalId: nationalId.trim() || undefined,
          tin: tin.trim() || undefined,
          passportNo: passport.trim() || undefined,
        }).unwrap(),
      ]);

      showSuccess({
        title: 'Success',
        message: basicInfoResponse.message || 'Basic information updated successfully',
      });

      // Navigate to next screen
      router.push('/auth/addresses-update');
    } catch (error: any) {
      console.error('Update basic info error:', error);

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
        const errorMsg = error?.data?.message || 'Failed to update basic information';
        showError({ title: 'Error', message: errorMsg });
      }
    }
  };

  // Field-level errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isLoading = isLoadingFetch || isLoadingBasic || isLoadingProfile;

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
            onChange={(val) => {
              setNationalId(val);
              clearError('nationalId');
            }}
            required
            error={errors.nationalId}
          />
          <InputField
            label="TIN"
            placeholder="XXXXXXXXXXXXXX"
            value={tin}
            onChange={(val) => {
              setTin(val);
              clearError('tin');
            }}
            required
            error={errors.tin}
          />
          <InputField
            label="Passport No."
            placeholder="XXXXXXXXXXXXXX"
            value={passport}
            onChange={(val) => {
              setPassport(val);
              clearError('passportNo');
            }}
            error={errors.passportNo}
          />

          {/* Next Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
            className={`mt-4 h-[54px] items-center justify-center rounded-full ${
              isLoading ? 'bg-[#CCC]' : 'bg-[#00C897]'
            }`}>
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-[18px] font-bold text-white">Next</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}
