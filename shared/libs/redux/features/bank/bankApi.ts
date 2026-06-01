import { apiSlice } from '@/shared/libs/redux/apiSlice';
import type { BankAccount, AccountWithTransactions, AccountsListResponse } from '@/modules/bank/types';
import type { ApiSuccessResponse } from '@/shared/libs/types/auth.types';

export const bankApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /v1/bank/accounts - List all accounts
    getAccounts: builder.query<ApiSuccessResponse<AccountsListResponse>, void>({
      query: () => ({
        url: '/bank/accounts',
        method: 'GET',
      }),
      providesTags: ['BankAccounts'],
    }),

    // GET /v1/bank/accounts/:id - Get single account with transactions
    getAccount: builder.query<ApiSuccessResponse<AccountWithTransactions>, string>({
      query: (id) => ({
        url: `/bank/accounts/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'BankAccounts', id }, 'BankAccounts'],
    }),

    // POST /v1/bank/accounts/:id/primary - Set primary account
    setPrimaryAccount: builder.mutation<ApiSuccessResponse<BankAccount>, string>({
      query: (id) => ({
        url: `/bank/accounts/${id}/primary`,
        method: 'POST',
      }),
      invalidatesTags: ['BankAccounts'],
    }),

    // GET /v1/bank/accounts/:id/transactions - Get account transactions
    getAccountTransactions: builder.query<
      ApiSuccessResponse<{ transactions: unknown[]; total: number; page: number }>,
      { id: string; page?: number; limit?: number }
    >({
      query: ({ id, page = 1, limit = 20 }) => ({
        url: `/bank/accounts/${id}/transactions`,
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: (result, error, { id }) => [{ type: 'BankAccounts', id }, 'BankAccounts'],
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useGetAccountQuery,
  useSetPrimaryAccountMutation,
  useGetAccountTransactionsQuery,
} = bankApi;
