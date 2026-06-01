import { apiSlice } from '@/shared/libs/redux/apiSlice';
import type {
  AddAddressRequest,
  ApiSuccessResponse,
  BiometricFaceVerifyData,
  ChangePasswordRequest,
  CheckAvailabilityResponse,
  DeleteAccountRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterFingerprintRequest,
  RegisterRequest,
  RegisterResponse,
  ResendOtpRequest,
  ResetPasswordRequest,
  UpdateAddressRequest,
  UpdateBasicInfoRequest,
  UpdateProfileRequest,
  UserProfile,
  Address,
  VerifyEmailRequest,
  VerifyResetOtpRequest,
} from '@/shared/libs/types/auth.types';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (data) => ({
        url: '/auth/login',
        method: 'POST',
        body: data,
      }),
    }),
    verifyEmail: builder.mutation<LoginResponse, VerifyEmailRequest>({
      query: (data) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: data,
      }),
    }),
    resendOtp: builder.mutation<void, ResendOtpRequest>({
      query: (data) => ({
        url: '/auth/resend-otp',
        method: 'POST',
        body: data,
      }),
    }),
    forgotPassword: builder.mutation<void, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    verifyResetOtp: builder.mutation<void, VerifyResetOtpRequest>({
      query: (data) => ({
        url: '/auth/verify-reset-otp',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    checkEmail: builder.query<CheckAvailabilityResponse, string>({
      query: (email) => ({
        url: '/auth/check-email',
        method: 'GET',
        params: { email },
      }),
    }),
    checkUsername: builder.query<CheckAvailabilityResponse, string>({
      query: (username) => ({
        url: '/auth/check-username',
        method: 'GET',
        params: { username },
      }),
    }),
    getMe: builder.query<ApiSuccessResponse<UserProfile>, void>({
      query: () => ({
        url: '/users/me',
        method: 'GET',
      }),
      providesTags: ['user'],
    }),
    updateProfile: builder.mutation<ApiSuccessResponse<UserProfile>, UpdateProfileRequest>({
      query: (data) => ({
        url: '/users/me',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['user'],
    }),
    updateBasicInfo: builder.mutation<ApiSuccessResponse<UserProfile>, UpdateBasicInfoRequest>({
      query: (data) => ({
        url: '/users/me/basic-info',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['user'],
    }),
    changePassword: builder.mutation<ApiSuccessResponse<{ message: string }>, ChangePasswordRequest>({
      query: (data) => ({
        url: '/users/me/change-password',
        method: 'PUT',
        body: data,
      }),
    }),
    deleteAccount: builder.mutation<ApiSuccessResponse<{ message: string }>, DeleteAccountRequest>({
      query: (data) => ({
        url: '/users/me',
        method: 'DELETE',
        body: data,
      }),
    }),
    // ─── Address Management ────────────────────────────────────────────────────────
    getAddresses: builder.query<ApiSuccessResponse<{ addresses: Address[] }>, void>({
      query: () => ({
        url: '/users/me/addresses',
        method: 'GET',
      }),
      providesTags: ['user'],
    }),
    addAddress: builder.mutation<ApiSuccessResponse<Address>, AddAddressRequest>({
      query: (data) => ({
        url: '/users/me/addresses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['user'],
    }),
    updateAddress: builder.mutation<ApiSuccessResponse<Address>, { id: string; data: UpdateAddressRequest }>({
      query: ({ id, data }) => ({
        url: `/users/me/addresses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['user'],
    }),
    // ─── Fingerprint Management ───────────────────────────────────────────────────
    registerFingerprint: builder.mutation<ApiSuccessResponse<{ message: string }>, RegisterFingerprintRequest>({
      query: (data) => ({
        url: '/users/me/fingerprint',
        method: 'POST',
        body: data,
      }),
    }),
    deleteFingerprint: builder.mutation<ApiSuccessResponse<{ message: string }>, void>({
      query: () => ({
        url: '/users/me/fingerprint',
        method: 'DELETE',
      }),
    }),
    // ─── Biometric Status Check ───────────────────────────────────────────────────
    getBiometricStatus: builder.query<ApiSuccessResponse<{ idVerified: boolean; addressVerified: boolean; faceVerified: boolean; overallStatus: string }>, void>({
      query: () => ({
        url: '/biometric/status',
        method: 'GET',
      }),
      providesTags: ['user'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useVerifyEmailMutation,
  useResendOtpMutation,
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
  useCheckEmailQuery,
  useLazyCheckEmailQuery,
  useCheckUsernameQuery,
  useLazyCheckUsernameQuery,
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateProfileMutation,
  useUpdateBasicInfoMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useGetAddressesQuery,
  useLazyGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useRegisterFingerprintMutation,
  useDeleteFingerprintMutation,
  useGetBiometricStatusQuery,
  useLazyGetBiometricStatusQuery,
} = authApi;
