
import { apiUrl } from '@/shared/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setLogout } from './features/auth/authSlice';
import { RootState } from './store';

const STORAGE_KEYS = {
    USER: '@user',
    TOKEN: '@token',
    DEVICE_TOKEN: '@deviceToken',
} as const;

const baseQuery = fetchBaseQuery({
    baseUrl: `${apiUrl}/v1`,
    prepareHeaders: async (headers, { getState }) => {
        try {
            const state: RootState = getState() as RootState;
            const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN) || state.auth.token;

            console.log('🔍 API Request Debug:');
            console.log('Base URL:', `${apiUrl}/v1`);
            console.log('Token present:', !!token);

            headers.delete('Content-Type');
            headers.set('Accept', 'application/json');
            headers.set('Content-Type', 'application/json');

            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }

            return headers;
        } catch (error) {
            console.error('❌ Error in prepareHeaders:', error);
            return headers;
        }
    }
});

const baseQueryWithAutoLogout = async (args: any, api: any, extraOptions: any) => {
    console.log('🚀 Making API Request:', {
        url: typeof args === 'string' ? args : args.url,
        method: typeof args === 'string' ? 'GET' : args.method,
        baseUrl: `${apiUrl}/v1`
    });

    try {
        const result = await baseQuery(args, api, extraOptions);

        console.log('📥 API Response:', {
            success: !result.error,
            status: result.error?.status,
            data: result.data ? 'Data received' : 'No data'
        });

        // Check for 401 Unauthorized status
        if (result.error && result.error.status === 401) {
            console.log('🔒 Unauthorized access detected (401). Auto-logging out user...');
            console.log('API Error:', JSON.stringify(result.error, null, 2));

            try {
                // Clear AsyncStorage
                await AsyncStorage.multiRemove([
                    STORAGE_KEYS.USER,
                    STORAGE_KEYS.TOKEN,
                    STORAGE_KEYS.DEVICE_TOKEN
                ]);
                console.log('✅ AsyncStorage cleared');

                // Dispatch logout action to clear Redux state
                api.dispatch(setLogout());
                console.log('✅ Redux state cleared');
            } catch (error) {
                console.error('❌ Error during auto-logout:', error);
            }
        }

        // Log other errors
        if (result.error && result.error.status !== 401) {
            console.error('❌ API Error:', {
                status: result.error.status,
                data: result.error.data,
                message: result.error.data?.message || result.error.status
            });
        }

        return result;
    } catch (error: any) {
        console.error('💥 Unexpected API Error:', {
            message: error.message,
            stack: error.stack,
            args: typeof args === 'string' ? args : args.url
        });
        return {
            error: {
                status: 'CUSTOM_ERROR',
                data: { message: error.message || 'Network request failed' }
            }
        };
    }
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithAutoLogout,
    tagTypes: ['user'],
    endpoints: () => ({})
});
