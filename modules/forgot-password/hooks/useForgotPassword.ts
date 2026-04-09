import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
} from '@/shared/libs/redux/features/auth/authApi';

export const useForgotPassword = () => {
  const [forgotMutation, { isLoading: isSendingEmail }] = useForgotPasswordMutation();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const sendResetEmail = async (email: string) => {
    setError(null);
    try {
      // TODO: Verify if forgot-password response returns userId
      const res = await forgotMutation({ email }).unwrap();
      // @ts-ignore — shape TBD
      if (res?.userId) {
        router.push(`/auth/forgot-password-otp?userId=${res.userId}` as any);
      } else {
        router.push('/auth/forgot-password-otp' as any);
      }
    } catch (err: any) {
      const msg = err?.data?.message ?? 'Failed to send reset email. Please try again.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  return { sendResetEmail, isSendingEmail, error };
};

export const useVerifyResetOtp = (userId: string) => {
  const [verifyMutation, { isLoading }] = useVerifyResetOtpMutation();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const verifyOtp = async (otp: string) => {
    setError(null);
    try {
      await verifyMutation({ userId, otp }).unwrap();
      router.push(`/auth/reset-password?userId=${userId}&otp=${otp}` as any);
    } catch (err: any) {
      const msg = err?.data?.message ?? 'OTP verification failed. Please try again.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  return { verifyOtp, isLoading, error };
};

export const useResetPassword = () => {
  const [resetMutation, { isLoading }] = useResetPasswordMutation();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const resetPassword = async (userId: string, otp: string, newPassword: string) => {
    setError(null);
    try {
      await resetMutation({ userId, otp, newPassword }).unwrap();
      router.replace('/auth/login');
    } catch (err: any) {
      const msg = err?.data?.message ?? 'Password reset failed. Please try again.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  return { resetPassword, isLoading, error };
};
