import { apiSlice } from '@/shared/libs/redux/apiSlice';
import type {
  ChangePasswordRequest,
  CheckAvailabilityResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResendOtpRequest,
  ResetPasswordRequest,
  UpdateBasicInfoRequest,
  UpdateProfileRequest,
  UserProfile,
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
    verifyEmail: builder.mutation<void, VerifyEmailRequest>({
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
    getMe: builder.query<UserProfile, void>({
      query: () => ({
        url: '/users/me',
        method: 'GET',
      }),
      providesTags: ['user'],
    }),
    updateProfile: builder.mutation<UserProfile, UpdateProfileRequest>({
      query: (data) => ({
        url: '/users/me',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['user'],
    }),
    updateBasicInfo: builder.mutation<void, UpdateBasicInfoRequest>({
      query: (data) => ({
        url: '/users/me/basic-info',
        method: 'PUT',
        body: data,
      }),
    }),
    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (data) => ({
        url: '/users/me/change-password',
        method: 'PUT',
        body: data,
      }),
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
} = authApi;
