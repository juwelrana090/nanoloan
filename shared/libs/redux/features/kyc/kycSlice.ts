import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DocumentType = 'NID' | 'PASSPORT' | 'UNKNOWN';

export interface ValidationError {
  field: string;
  message: string;
  isCritical: boolean;
}

export interface ExtractedData {
  documentType?: DocumentType;
  name?: string;
  idNumber?: string;
  passportNumber?: string;
  personalNumber?: string;
  expiryDate?: string;
  dob?: string;
  placeOfBirth?: string;
  dateOfIssue?: string;
  nationality?: string;
  sex?: string;
  // NID Back side specific fields
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  presentAddress?: string;
  permanentAddress?: string;
  bloodGroup?: string;
  district?: string;
  // Passport Back side specific fields
  emergencyContact?: string;
  address?: string;
  observations?: string;
  fileNumber?: string;
  rawText: string;
  validationErrors?: ValidationError[];
}

export interface KYCState {
  documentType: DocumentType | null;
  frontImageUri: string | null;
  backImageUri: string | null;
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
  setFrontData,
  setBackData,
  clearFrontImage,
  clearBackImage,
  setCurrentStep,
  setLoading,
  setError,
  resetKYC,
} = kycSlice.actions;

export default kycSlice.reducer;
