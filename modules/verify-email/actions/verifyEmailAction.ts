// After successful email verification the user proceeds to fill in basic info.
// If the server returns a session token here, persist it instead of navigating to login.
export const getPostVerifyPath = (): string => {
  return '/auth/basic-information';
};
