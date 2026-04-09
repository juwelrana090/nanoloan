import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useRegisterMutation } from '@/shared/libs/redux/features/auth/authApi';
import type { RegisterRequest } from '@/shared/libs/types/auth.types';

export const useRegister = () => {
  const [registerMutation, { isLoading }] = useRegisterMutation();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const register = async (data: RegisterRequest) => {
    setError(null);
    try {
      const response = await registerMutation(data).unwrap();
      const path = `/auth/email-otp-verification?userId=${response.userId}&email=${encodeURIComponent(data.email)}`;
      router.push(path as any);
    } catch (err: any) {
      const msg = err?.data?.message ?? 'Registration failed. Please try again.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  return { register, isLoading, error };
};
