// After a successful forgot-password request the user checks their email for a reset OTP.
// After verify-reset-otp succeeds, navigate to the reset-password screen.
// After reset-password succeeds, navigate back to login.
export const getPostForgotPasswordPath = (): string => '/auth/login';
