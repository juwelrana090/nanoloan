import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useVerifyEmailMutation,
  useResendOtpMutation,
} from '@/shared/libs/redux/features/auth/authApi';
import { useAppDispatch } from '@/shared/hooks/useAppSelector';
import {
  setIsAuthenticated,
  setToken,
  setUser,
} from '@/shared/libs/redux/features/auth/authSlice';
import type { LoginResponse } from '@/shared/libs/types/auth.types';

const persistLoginSession = async (
  dispatch: ReturnType<typeof useAppDispatch>,
  response: LoginResponse
) => {
  const { accessToken, user } = response.data;
  await Promise.all([
    AsyncStorage.setItem('@user', JSON.stringify(user)),
    AsyncStorage.setItem('@token', accessToken),
  ]);
  dispatch(setToken(accessToken));
  dispatch(setUser(user));
  dispatch(setIsAuthenticated(true));
};


export const useVerifyEmail = (email: string) => {
  const [verifyMutation, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendMutation, { isLoading: isResending }] = useResendOtpMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  const verify = useCallback(async (email: string, otp: string) => {
    setError(null);
    try {
      const response = await verifyMutation({ email, otp }).unwrap();
      console.log('user login response :::', response);

      // Check if response contains accessToken (auto-login flow)
      if (response.data?.accessToken) {
        await persistLoginSession(dispatch, response);
        router.replace('/auth/basic-information' as any);
      } else {
        // No tokens returned - redirect to login with email pre-filled
        router.replace({
          pathname: '/auth/login',
          params: { email }
        } as any);
      }
    } catch (err: any) {
      const msg = err?.data?.message ?? 'Verification failed. Please try again.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    }
  }, [verifyMutation, dispatch, router]);

  const resend = useCallback(async () => {
    setError(null);
    setResendSuccess(false);
    try {
      await resendMutation({ email }).unwrap();
      setResendSuccess(true);
    } catch (err: any) {
      const msg = err?.data?.message ?? 'Failed to resend OTP. Please try again.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    }
  }, [resendMutation, email]);

  return { verify, resend, isVerifying, isResending, error, resendSuccess };
};
