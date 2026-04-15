import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  useVerifyEmailMutation,
  useResendOtpMutation,
} from '@/shared/libs/redux/features/auth/authApi';

export const useVerifyEmail = (email: string) => {
  const [verifyMutation, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendMutation, { isLoading: isResending }] = useResendOtpMutation();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  const verify = async (email: string, otp: string) => {
    setError(null);
    try {
      await verifyMutation({ email, otp }).unwrap();
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
      await resendMutation({ email }).unwrap();
      setResendSuccess(true);
    } catch (err: any) {
      const msg = err?.data?.message ?? 'Failed to resend OTP. Please try again.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  return { verify, resend, isVerifying, isResending, error, resendSuccess };
};
