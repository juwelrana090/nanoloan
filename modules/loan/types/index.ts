/**
 * Loan Types
 * Derived from API spec: GET /v1/loans/my, POST /v1/loans/apply, etc.
 */

export type LoanStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'DISBURSED'
  | 'ACTIVE'
  | 'CLOSED'
  | 'CANCELLED';

export interface LoanSummary {
  id: string;
  loanNumber: string;
  amount: number;
  tenure: number;
  emi: number;
  status: LoanStatus;
  disbursedAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
  nextInstalmentDate?: string;
  nextInstalmentAmount?: number;
  createdAt: string;
}

export interface LoanInstalment {
  id: string;
  loanId: string;
  instalmentNumber: number;
  dueDate: string;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  paidAt?: string;
  paidAmount?: number;
}

export interface LoanStatusLog {
  id: string;
  status: LoanStatus;
  note?: string;
  createdAt: string;
}

export interface LoanDetail {
  id: string;
  loanNumber: string;
  amount: number;
  tenure: number;
  emi: number;
  interestRate: number;
  purpose: string;
  status: LoanStatus;
  bankAccount: {
    id: string;
    accountName: string;
    accountNumber: string;
  };
  instalments: LoanInstalment[];
  statusLogs: LoanStatusLog[];
  disbursedAt?: string;
  createdAt: string;
}

export interface CheckEligibilityRequest {
  amount: number;
  tenure: number;
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  maxAmount?: number;
  minAmount?: number;
  maxTenure?: number;
  minTenure?: number;
  estimatedEmi?: number;
  interestRate?: number;
}

export interface LoanApplicationRequest {
  amount: number;
  tenure: number;
  purpose: string;
  bankAccountId: string;
}

export interface LoanApplicationResponse {
  id: string;
  loanNumber: string;
  amount: number;
  tenure: number;
  emi: number;
  status: 'PENDING';
  customerName: string;
  nextSteps: string[];
  createdAt: string;
}
