import { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLoginMutation } from '@/shared/libs/redux/features/auth/authApi';
import { useAppDispatch } from '@/shared/hooks/useAppSelector';
import {
  setIsAuthenticated,
  setToken,
  setUser,
} from '@/shared/libs/redux/features/auth/authSlice';
import type { LoginRequest, LoginResponse } from '@/shared/libs/types/auth.types';

const persistLoginSession = async (
  dispatch: ReturnType<typeof useAppDispatch>,
  response: LoginResponse
) => {
  const { accessToken, user } = response;
  await Promise.all([
    AsyncStorage.setItem('@user', JSON.stringify(user)),
    AsyncStorage.setItem('@token', accessToken),
  ]);
  dispatch(setToken(accessToken));
  dispatch(setUser(user));
  dispatch(setIsAuthenticated(true));
};

export const useLogin = () => {
  const [loginMutation, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginRequest) => {
    setError(null);
    try {
      const response = await loginMutation(data).unwrap();
      console.log('user login response :::', response);
      await persistLoginSession(dispatch, response);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err?.data?.message ?? 'Login failed. Please try again.';

      // Check if email verification is required
      if (msg === 'Please verify your email first') {
        router.replace(`/auth/email-otp-verification?email=${data.identifier}` as any);
        return;
      }

      setError(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  return { login, isLoading, error };
};
