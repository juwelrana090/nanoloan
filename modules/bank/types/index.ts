/**
 * Bank Account Types
 * Derived from API spec: GET /v1/bank/accounts
 */

export interface BankAccount {
  id: string;
  customerId: string;
  accountNumber: string;
  accountType: 'PERSONAL' | 'BUSINESS' | 'SAVINGS';
  accountName: string;
  bankName: string;
  branchName: string;
  routingNumber: string;
  balance: number;
  status: 'ACTIVE' | 'INACTIVE' | 'FROZEN';
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankTransaction {
  id: string;
  accountId: string;
  type: 'CREDIT' | 'DEBIT';
  transactionType: 'LOAN_DISBURSEMENT' | 'LOAN_REPAYMENT' | 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface AccountWithTransactions {
  account: BankAccount;
  transactions: BankTransaction[];
}

export interface AccountsListResponse {
  accounts: BankAccount[];
}
