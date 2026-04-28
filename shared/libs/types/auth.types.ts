// All auth API request/response types derived from Swagger contracts.
// Field names are case-sensitive and match the server DTOs exactly.

// ─── API Response Wrappers ─────────────────────────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

// ─── Register ────────────────────────────────────────────────────────────────

export interface RegisterRequest {
  fullName: string;
  email: string;
  username: string;
  password: string; // min 8
  phoneNumber: string;
  dateOfBirth: string;
}

export interface RegisterResponse {
  // TODO: Verify exact shape against live API — userId is assumed required for verify-email step
  userId: string;
  message?: string;
}

// ─── Login ───────────────────────────────────────────────────────────────────

export interface LoginRequest {
  identifier: string; // email or username
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: UserProfile;
  };
}

// ─── Verify Email ─────────────────────────────────────────────────────────────

export interface VerifyEmailRequest {
  email: string;
  otp: string; // exactly 6 chars
}

// ─── Resend OTP ───────────────────────────────────────────────────────────────

export interface ResendOtpRequest {
  email: string;
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

export interface ForgotPasswordRequest {
  email: string;
}

// ─── Verify Reset OTP ────────────────────────────────────────────────────────

export interface VerifyResetOtpRequest {
  email: string;
  otp: string; // exactly 6 chars
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export interface ResetPasswordRequest {
  email: string;
  otp: string; // exactly 6 chars
  newPassword: string; // min 8
}

// ─── Availability Checks ──────────────────────────────────────────────────────

export interface CheckAvailabilityResponse {
  exists: boolean;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  username: string;
  phoneNumber: string;
  dateOfBirth: string;
  age?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  profile?: UserProfileBasicInfo | null;
  addresses?: Address[];
}

export interface UserProfileBasicInfo {
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  educationLevel?: 'PRIMARY' | 'SECONDARY' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'PHD' | 'OTHER';
  nationalId?: string;
  tin?: string;
  passportNo?: string;
}

export interface Address {
  id: string;
  type: 'PRESENT' | 'PERMANENT';
  address: string;
  postCode: string;
  city: string;
  state: string;
  country: string;
  yearsAtAddress: number;
  isPrimary: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Update Profile ───────────────────────────────────────────────────────────

export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface UpdateBasicInfoRequest {
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  educationLevel?: 'PRIMARY' | 'SECONDARY' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'PHD' | 'OTHER';
  nationalId?: string;
  tin?: string;
  passportNo?: string;
}

// ─── Address Management ────────────────────────────────────────────────────────

export interface AddAddressRequest {
  type: 'PRESENT' | 'PERMANENT';
  address: string;
  postCode: string;
  city: string;
  state: string;
  country: string;
  yearsAtAddress: number;
  isPrimary?: boolean;
}

export interface UpdateAddressRequest {
  type?: 'PRESENT' | 'PERMANENT';
  address?: string;
  postCode?: string;
  city?: string;
  state?: string;
  country?: string;
  yearsAtAddress?: number;
  isPrimary?: boolean;
}

// ─── Fingerprint Management ────────────────────────────────────────────────────

export interface RegisterFingerprintRequest {
  fingerprintData: string; // base64-encoded fingerprint template
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string; // min 8
}

export interface DeleteAccountRequest {
  password: string; // Current account password for confirmation
}

// ─── Biometric Management ────────────────────────────────────────────────────────

export interface BiometricStartRequest {
  // Empty body
}

export interface BiometricStartResponse {
  sessionId: string;
  [key: string]: any;
}

// FormData for biometric uploads - use 'any' for React Native file objects
export interface BiometricIdVerifyRequest {
  idType: 'NID' | 'PASSPORT';
  idCardImage: any; // React Native file object: { uri, name, type }
  idCardImageBack?: any; // Optional back image: { uri, name, type }
}

export interface BiometricIdVerifyResponse {
  id: string;
  status: string;
  ocrData?: {
    name?: string;
    idNumber?: string;
    dateOfBirth?: string;
  };
}

export interface BiometricAddressVerifyRequest {
  addressImage: any; // React Native file object: { uri, name, type }
}

export interface BiometricAddressVerifyResponse {
  id: string;
  status: string;
}

export interface BiometricFaceVerifyRequest {
  faceImage: any; // React Native file object: { uri, name, type }
}

export interface BiometricFaceVerifyData {
  confidence: number; // 0-1 confidence score
  passed: boolean; // true if confidence >= 0.8
  id?: string;
  status?: string;
}

export interface BiometricFaceVerifyResponse {
  confidence: number; // 0-1 confidence score
  passed: boolean; // true if confidence >= 0.8
  id?: string;
  status?: string;
}

export interface BiometricStatusResponse {
  id: string;
  userId: string;
  idType: string;
  idCardImage: string;
  idCardImageId: string;
  idVerified: boolean;
  addressImage: string;
  addressImageId: string;
  addressVerified: boolean;
  faceImage: string;
  faceImageId: string;
  faceVerified: boolean;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  rawOcrText?: string;
  extractedData?: {
    name?: string;
    address?: string;
    idNumber?: string;
    dateOfBirth?: string;
  };
  documentType?: string;
  confidenceScore?: number;
  createdAt: string;
  updatedAt: string;
  logs?: Array<{
    id: string;
    userId: string;
    verificationType: 'ID' | 'ADDRESS' | 'FACE';
    attempt: number;
    result: boolean;
    confidence?: number;
    notes: string;
    createdAt: string;
  }>;
}
