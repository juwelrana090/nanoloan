import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import { apiSlice } from './apiSlice';
import authReducer from './features/auth/authSlice';
import kycReducer from './features/kyc/kycSlice';
import bankReducer from './features/bank/bankSlice';
// import notificationReducer from './features/notification/notificationSlice';

// Persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'kyc', 'bank'], // Persist auth, KYC, and bank state
};

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  kyc: kycReducer,
  bank: bankReducer,
  // notification: notificationReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH',
        ],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp', 'register', 'rehydrate'],
        ignoredPaths: [
          'api.queries.userProfile({"refetchOnMount":true}).originalArgs.onSuccess',
          'api.queries',
          'api.mutations',
          'register',
          'rehydrate',
        ],
      },
      immutableCheck: false,
    }).concat(apiSlice.middleware),
});

// Persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
