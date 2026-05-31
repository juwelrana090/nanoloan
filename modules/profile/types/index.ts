export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  username: string;
  phoneNumber: string;
  dateOfBirth?: string;
  age?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  profile?: {
    maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
    educationLevel?: 'PRIMARY' | 'SECONDARY' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'PHD' | 'OTHER';
    nationalId?: string;
    tin?: string;
    passportNo?: string;
  };
  addresses?: Address[];
}

export interface Address {
  id: string;
  type: 'PRESENT' | 'PERMANENT';
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateProfileRequest {
  fullName?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
}

export interface UpdateBasicInfoRequest {
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  educationLevel?: 'PRIMARY' | 'SECONDARY' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'PHD' | 'OTHER';
  nationalId?: string;
  tin?: string;
  passportNo?: string;
}
