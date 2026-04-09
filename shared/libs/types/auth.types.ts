// All auth API request/response types derived from Swagger contracts.
// Field names are case-sensitive and match the server DTOs exactly.

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
  // TODO: Verify exact shape against live API — accessToken + user is standard NestJS JWT pattern
  accessToken: string;
  user: UserProfile;
}

// ─── Verify Email ─────────────────────────────────────────────────────────────

export interface VerifyEmailRequest {
  userId: string;
  otp: string; // exactly 6 chars
}

// ─── Resend OTP ───────────────────────────────────────────────────────────────

export interface ResendOtpRequest {
  userId: string;
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

export interface ForgotPasswordRequest {
  email: string;
}

// ─── Verify Reset OTP ────────────────────────────────────────────────────────

export interface VerifyResetOtpRequest {
  userId: string;
  otp: string; // exactly 6 chars
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export interface ResetPasswordRequest {
  userId: string;
  otp: string; // exactly 6 chars
  newPassword: string; // min 8
}

// ─── Availability Checks ──────────────────────────────────────────────────────

export interface CheckAvailabilityResponse {
  // TODO: Verify exact shape against live API
  available: boolean;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  username: string;
  phoneNumber: string;
  dateOfBirth: string;
  isEmailVerified: boolean;
  role: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  educationLevel?: 'PRIMARY' | 'SECONDARY' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'PHD' | 'OTHER';
  nationalId?: string;
  tin?: string;
  passportNo?: string;
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

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string; // min 8
}
