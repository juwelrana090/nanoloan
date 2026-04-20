import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DocumentType, ValidationError, ExtractedData } from '@/types/kyc';

export interface KYCState {
  documentType: DocumentType | null;
  frontImageUri: string | null;
  backImageUri: string | null;
  addressImageUri: string | null;
  frontData: ExtractedData | null;
  backData: ExtractedData | null;
  currentStep: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: KYCState = {
  documentType: null,
  frontImageUri: null,
  backImageUri: null,
  addressImageUri: null,
  frontData: null,
  backData: null,
  currentStep: 'select-id-type',
  isLoading: false,
  error: null,
};

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    setDocumentType: (state, action: PayloadAction<DocumentType>) => {
      state.documentType = action.payload;
    },

    setFrontImage: (state, action: PayloadAction<string>) => {
      state.frontImageUri = action.payload;
    },

    setBackImage: (state, action: PayloadAction<string>) => {
      state.backImageUri = action.payload;
    },

    setFrontData: (state, action: PayloadAction<ExtractedData>) => {
      state.frontData = action.payload;
    },

    setBackData: (state, action: PayloadAction<ExtractedData>) => {
      state.backData = action.payload;
    },

    clearFrontImage: (state) => {
      state.frontImageUri = null;
      state.frontData = null;
    },

    clearBackImage: (state) => {
      state.backImageUri = null;
      state.backData = null;
    },

    setAddressImage: (state, action: PayloadAction<string>) => {
      state.addressImageUri = action.payload;
    },

    clearAddressImage: (state) => {
      state.addressImageUri = null;
    },

    setCurrentStep: (state, action: PayloadAction<string>) => {
      state.currentStep = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    resetKYC: () => initialState,
  },
});

export const {
  setDocumentType,
  setFrontImage,
  setBackImage,
  setAddressImage,
  setFrontData,
  setBackData,
  clearFrontImage,
  clearBackImage,
  clearAddressImage,
  setCurrentStep,
  setLoading,
  setError,
  resetKYC,
} = kycSlice.actions;

export default kycSlice.reducer;
