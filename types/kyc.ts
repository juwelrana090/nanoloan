// KYC Document Type Definitions
// Based on prompt.md requirements for NanoLoan project

export type IDSide = 'front' | 'back';
export type IDType = 'nid' | 'passport';

// NID Front Fields
export interface NIDFrontFields {
  name: string; // English name
  dateOfBirth: string; // Format: DD MMM YYYY
  nidNo: string; // 10 or 17 digit number
  fatherName: string; // পিতা - Bengali text
  motherName: string; // মাতা - Bengali text
}

// NID Back Fields
export interface NIDBackFields {
  address: string; // ঠিকানা - Bengali address block
  placeOfBirth: string; // English text
}

// Passport Front Fields
export interface PassportFrontFields {
  surname: string;
  givenName: string;
  dateOfBirth: string;
  passportNumber: string;
  dateOfIssue: string;
  dateOfExpiry: string;
}

// Passport Back Fields
export interface PassportBackFields {
  permanentAddress: string;
  emergencyContactAddress: string;
  emergencyContactTelephone: string;
}

// Combined KYC Document State
export interface KYCDocumentState {
  idType: IDType;
  frontFields: NIDFrontFields | PassportFrontFields | null;
  backFields: NIDBackFields | PassportBackFields | null;
  frontImage: string | null;
  backImage: string | null;
}

// Validation Error
export interface ValidationError {
  field: string;
  message: string;
  isCritical: boolean;
}

// Document Type for extracted data (uppercase, as returned by OCR)
export type DocumentType = 'NID' | 'PASSPORT' | 'UNKNOWN';

// Extracted Data (for compatibility with existing code)
export interface ExtractedData {
  documentType?: DocumentType;
  name?: string;
  idNumber?: string; // Maps to nidNo for NID
  nidNo?: string; // NID number (10 or 17 digits)
  passportNumber?: string;
  personalNumber?: string;
  expiryDate?: string; // Maps to dateOfExpiry for passports
  dob?: string; // Maps to dateOfBirth
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
