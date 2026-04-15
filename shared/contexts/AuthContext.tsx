import { useAppDispatch, useAppSelector } from '@/shared/hooks/useAppSelector';
import { DeviceToken, User } from '@/shared/libs/types/user.types';
import {
  useLazyCheckEmailQuery,
  useLazyCheckUsernameQuery,
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from '@/shared/libs/redux/features/auth/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useGlobalSearchParams } from 'expo-router';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '../hooks/useToast';
import { setError, setIsAuthenticated, setIsLoading, setLogout, setToken, setUser } from '../libs/redux/features/auth/authSlice';

const STORAGE_KEYS = {
    USER: '@user',
    TOKEN: '@token',
} as const;

// Create context
interface AuthContextType {
    user: User | null;
    token: string | null;
    deviceToken: DeviceToken | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    step: number;
    setStep: (step: number) => void;
    email: string;
    setEmail: (email: string) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    username: string;
    setUsername: (username: string) => void;
    password: string;
    setPassword: (password: string) => void;
    isRemember: boolean;
    setIsRemember: (isRemember: boolean) => void;
    showPassword: boolean;
    setShowPassword: (showPassword: boolean) => void;
    checkEmail: (email: string) => Promise<boolean>;
    checkUsername: (username: string) => Promise<boolean>;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: {
        email: string;
        username: string;
        password: string;
        learningLanguage: string;
    }) => Promise<void>;
    logout: () => void;
    sendOtp: (email: string) => Promise<void>;
    verifyOtp: (email: string, otp: string) => Promise<void>;
    resetPassword: (email: string, newPassword: string, confirmPassword: string) => Promise<void>;
    updateUser: (userData: Partial<User>) => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const globParams = useGlobalSearchParams();

    const dispatch = useAppDispatch();
    const { showSuccess, showError, showInfo, showWarning } = useToast();

    const { user, token, deviceToken, isLoading, isAuthenticated, error } = useAppSelector(
        (state) => state.auth
    );

    // RTK Query hooks
    const [loginMutation] = useLoginMutation();
    const [registerMutation] = useRegisterMutation();
    const [verifyEmailMutation] = useVerifyEmailMutation();
    const [resendOtpMutation] = useResendOtpMutation();
    const [forgotPasswordMutation] = useForgotPasswordMutation();
    const [resetPasswordMutation] = useResetPasswordMutation();
    const [checkEmailQuery] = useLazyCheckEmailQuery();
    const [checkUsernameQuery] = useLazyCheckUsernameQuery();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [learningLanguage, setLearningLanguage] = useState('');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isRemember, setIsRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSocialLogin, setIsSocialLogin] = useState(false);
    const [socialLoginData, setSocialLoginData] = useState<{
        provider: string;
        providerId: string;
        email: string;
        profilePicture: string | null;
        displayName: string | null;
        role: string;
    }>({
        provider: '',
        providerId: '',
        email: '',
        profilePicture: null,
        displayName: null,
        role: '',
    });

    const [hasInitialized, setHasInitialized] = useState(false);

    // Initialize auth on app start
    useEffect(() => {
        if (hasInitialized) return;

        const initializeAuth = async () => {
            try {
                console.log('🔐 Initializing auth...');
                dispatch(setIsLoading(true));
                const [storedUser, storedToken] = await Promise.all([
                    AsyncStorage.getItem(STORAGE_KEYS.USER),
                    AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
                ]);

                if (storedUser && storedToken) {
                    const userData = JSON.parse(storedUser);
                    dispatch(setUser(userData));
                    dispatch(setToken(storedToken));
                    dispatch(setIsAuthenticated(true));
                    console.log('✅ User found in storage');
                } else {
                    console.log('📭 No user found in storage');
                }
            } catch (error) {
                console.error('❌ Error initializing auth:', error);
                // Clear potentially corrupted data
                await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.TOKEN]);
            } finally {
                dispatch(setIsLoading(false));
                setHasInitialized(true);
                console.log('🏁 Auth initialization complete');
            }
        };

        initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasInitialized]);

    // Handle query parameters from URL (e.g., from Google Sign-In redirect)
    useEffect(() => {
        if (globParams) {
            console.log('Query params received:', globParams);

            // Set step if provided
            const stepParam = globParams.step;
            if (stepParam) {
                setStep(Number(stepParam));
            }

            // Set email if provided
            const emailParam = globParams.email;
            if (emailParam as string) {
                setEmail(emailParam as string);
            }

            // Set username if provided
            const usernameParam = globParams.username;
            if (usernameParam) {
                setUsername(usernameParam as string);
            }

            // Set password if provided
            const passwordParam = globParams.password;
            if (passwordParam as string) {
                setPassword(passwordParam as string);
            }

            // Set learning language if provided
            const learningLanguageParam = globParams.learningLanguage;
            if (learningLanguageParam as string) {
                setLearningLanguage(learningLanguageParam as string);
            }

            // Set social login data if Google Sign-In params are present
            const providerParam = globParams.provider;
            const idParam = Array.isArray(globParams.id) ? globParams.id[0] : globParams.id || '';
            const emailForSocial = globParams.email;
            const photoParam = Array.isArray(globParams.photo)
                ? globParams.photo[0]
                : globParams.photo || null;
            const nameParam = Array.isArray(globParams.name)
                ? globParams.name[0]
                : globParams.name || null;

            if (providerParam === 'google' && idParam && emailForSocial) {
                setIsSocialLogin(true);
                setSocialLoginData({
                    provider: providerParam as string,
                    providerId: idParam,
                    email: emailForSocial as string,
                    profilePicture: photoParam,
                    displayName: nameParam,
                    role: 'student',
                });
            }
        }
    }, [globParams]);

    const checkEmail = async (email: string) => {
        try {
            const res = await checkEmailQuery(email).unwrap();
            // Return true if email does NOT exist (is available)
            return !res.exists;
        } catch (error) {
            console.error('Error checking email:', error);
            return false;
        }
    };

    const checkUsername = async (username: string) => {
        try {
            const res = await checkUsernameQuery(username).unwrap();
            // Return true if username does NOT exist (is available)
            return !res.exists;
        } catch (error) {
            console.error('Error checking username:', error);
            return false;
        }
    };

    const login = async (identifier: string, password: string) => {
        try {
            dispatch(setIsLoading(true));
            dispatch(setError(null));

            const response = await loginMutation({ identifier, password }).unwrap();
            const { accessToken, user } = response.data;

            // Save to AsyncStorage
            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
                AsyncStorage.setItem(STORAGE_KEYS.TOKEN, accessToken),
            ]);

            dispatch(setUser(user));
            dispatch(setToken(accessToken));
            dispatch(setIsAuthenticated(true));

            showSuccess('Login successful');
        } catch (error: any) {
            const errorMsg = error?.data?.message || 'Login failed';
            dispatch(setError(errorMsg));
            showError(errorMsg);
            throw error;
        } finally {
            dispatch(setIsLoading(false));
        }
    };

    const register = async (userData: {
        email: string;
        username: string;
        password: string;
        fullName: string;
        phoneNumber: string;
        dateOfBirth: string;
    }) => {
        try {
            dispatch(setIsLoading(true));
            dispatch(setError(null));

            const response = await registerMutation(userData).unwrap();

            showSuccess('Registration successful. Please verify your email.');
            return response;
        } catch (error: any) {
            const errorMsg = error?.data?.message || 'Registration failed';
            dispatch(setError(errorMsg));
            showError(errorMsg);
            throw error;
        } finally {
            dispatch(setIsLoading(false));
        }
    };


    const logout = () => {
        dispatch(setLogout());
    };

    const sendOtp = async (email: string) => {
        try {
            dispatch(setError(null));
            dispatch(setIsLoading(true));

            await resendOtpMutation({ email }).unwrap();
            showSuccess('OTP sent successfully');
        } catch (error: any) {
            const errorMsg = error?.data?.message || 'Failed to send OTP';
            dispatch(setError(errorMsg));
            showError(errorMsg);
            throw error;
        } finally {
            dispatch(setIsLoading(false));
        }
    };

    const verifyOtp = async (email: string, otp: string) => {
        try {
            dispatch(setError(null));
            dispatch(setIsLoading(true));

            await verifyEmailMutation({ email, otp }).unwrap();
            showSuccess('Email verified successfully');
        } catch (error: any) {
            const errorMsg = error?.data?.message || 'OTP verification failed';
            dispatch(setError(errorMsg));
            showError(errorMsg);
            throw error;
        } finally {
            dispatch(setIsLoading(false));
        }
    };

    const resetPassword = async (email: string, otp: string, newPassword: string) => {
        try {
            dispatch(setError(null));
            dispatch(setIsLoading(true));

            await resetPasswordMutation({ email, otp, newPassword }).unwrap();
            showSuccess('Password reset successful');
        } catch (error: any) {
            const errorMsg = error?.data?.message || 'Password reset failed';
            dispatch(setError(errorMsg));
            showError(errorMsg);
            throw error;
        } finally {
            dispatch(setIsLoading(false));
        }
    };

    const updateUser = (userData: Partial<User>) => {
        dispatch(setUser(userData));
    };

    const value: AuthContextType = {
        user,
        token,
        deviceToken,
        isLoading,
        isAuthenticated,
        error,
        step,
        setStep,
        email,
        setEmail,
        loading,
        setLoading,
        username,
        setUsername,
        password,
        setPassword,
        isRemember,
        setIsRemember,
        showPassword,
        setShowPassword,
        checkEmail,
        checkUsername,
        login,
        register,
        logout,
        sendOtp,
        verifyOtp,
        resetPassword,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
