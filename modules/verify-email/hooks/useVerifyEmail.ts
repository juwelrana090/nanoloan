import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  useVerifyEmailMutation,
  useResendOtpMutation,
} from '@/shared/libs/redux/features/auth/authApi';

export const useVerifyEmail = (userId: string) => {
  const [verifyMutation, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendMutation, { isLoading: isResending }] = useResendOtpMutation();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  const verify = async (otp: string) => {
    setError(null);
    try {
      await verifyMutation({ userId, otp }).unwrap();
      router.replace('/auth/basic-information' as any);
    } catch (err: any) {
      const msg = err?.data?.message ?? 'Verification failed. Please try again.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const resend = async () => {
    setError(null);
    setResendSuccess(false);
    try {
      await resendMutation({ userId }).unwrap();
      setResendSuccess(true);
    } catch (err: any) {
      const msg = err?.data?.message ?? 'Failed to resend OTP. Please try again.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  return { verify, resend, isVerifying, isResending, error, resendSuccess };
};
