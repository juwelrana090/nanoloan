import type { RegisterResponse } from '@/shared/libs/types/auth.types';

export const buildVerifyEmailPath = (
  response: RegisterResponse,
  email: string
): string => {
  return `/auth/email-otp-verification?userId=${response.userId}&email=${encodeURIComponent(email)}`;
};
