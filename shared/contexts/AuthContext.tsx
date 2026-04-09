import { useAppDispatch, useAppSelector } from '@/shared/hooks/useAppSelector';
import { DeviceToken, User } from '@/shared/libs/types/user.types';
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { showSuccess, showError, showInfo, showWarning } = useToast();

    const { user, token, deviceToken, isLoading, isAuthenticated, error } = useAppSelector(
        (state) => state.auth
    );

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
            return false;
            // const res = await usersAuthCheckEmail(email).unwrap();
            // console.log('Email available', res.available);
            // if (!res.available) {
            //     return false;
            // }
            // return true;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return false;
        }
    };

    const checkUsername = async (username: string) => {
        try {
            return false;
            // const res = await usersAuthCheckUsername(username).unwrap();
            // console.log('Username available', res.available);
            // if (!res.available) {
            //     return false;
            // }
            // return true;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return false;
        }
    };

    const login = async (username: string, password: string) => {
        try {
            dispatch(setIsLoading(true));
            dispatch(setError(null));

            // let response;

            // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            // if (emailRegex.test(username)) {
            //     // Login with email - use 'email' field
            //     response = await loginEmail({ email: username, password }).unwrap();
            // } else {
            //     // Login with username - use 'username' field
            //     response = await loginUsername({ username, password }).unwrap();
            // }

            // console.log('Login response:', response);

            // if (!response.success) {
            //     throw new Error(response.message || 'Login failed');
            // }

            // // Save to AsyncStorage
            // const { data: user } = response;
            // await Promise.all([
            //     AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
            //     AsyncStorage.setItem(STORAGE_KEYS.TOKEN, user.token),
            // ]);

            // TODO: Implement actual login API call
            // dispatch(setUser(user));
            // dispatch(setToken(token));
            // dispatch(setIsAuthenticated(true));
            throw new Error('Login not yet implemented');
        } catch (error: any) {
            dispatch(setError(error.message || 'Login failed'));
            throw error;
        } finally {
            dispatch(setIsLoading(false));
        }
    };

    const register = async (userData: {
        email: string;
        username: string;
        password: string;
        learningLanguage: string;
    }) => {
        /*try {
            dispatch(setIsLoading(true));
            dispatch(setError(null));

            const payload = {
                ...userData,
                role: 'student',
            };

            const response = await registerMutation(payload).unwrap();

            if (!response.success) {
                throw new Error(response.message || 'Registration failed');
            }

            // Save to AsyncStorage
            const { token, user } = response;
            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
                AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
            ]);

            dispatch(setUser({ ...user, token }));
            dispatch(setToken(token));
            dispatch(setIsAuthenticated(true));
        } catch (error: any) {
            dispatch(setError(error.message || 'Registration failed'));
            throw error;
        } finally {
            dispatch(setIsLoading(false));
        }*/
    };


    const logout = () => {
        dispatch(setLogout());
    };

    const sendOtp = async (email: string) => {
        /*try {
            dispatch(setError(null));
            const response = await usersAuthSendOtp({ email }).unwrap();
            if (!response.success) {
                throw new Error(response.message || 'OTP send failed');
            }
        } catch (error: any) {
            dispatch(setError(error.message || 'OTP send failed'));
            throw error;
        } finally {
            dispatch(setIsLoading(false));
        }*/
    };

    const verifyOtp = async (email: string, otp: string) => {
        /*try {
            dispatch(setError(null));
            const response = await usersAuthVerifyOtp({ email, otp }).unwrap();
            if (!response.success) {
                throw new Error(response.message || 'OTP verification failed');
            }
        } catch (error: any) {
            dispatch(setError(error.message || 'OTP verification failed'));
            throw error;
        } finally {
            dispatch(setIsLoading(false));
        }*/
    };

    const resetPassword = async (email: string, newPassword: string, confirmPassword: string) => {
        /*try {
            dispatch(setError(null));
            const response = await usersAuthResetPassword({
                email,
                newPassword,
                confirmPassword,
            }).unwrap();
            if (!response.success) {
                throw new Error(response.message || 'Password reset failed');
            }
        } catch (error: any) {
            dispatch(setError(error.message || 'Password reset failed'));
            throw error;
        } finally {
            dispatch(setIsLoading(false));
        }*/
    };

    const updateUser = (userData: Partial<User>) => {
        // TODO: Implement user update with RTK Query
        // console.log('Update user not yet implemented with RTK Query:', userData);
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
