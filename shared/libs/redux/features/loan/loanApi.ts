import { apiSlice } from '@/shared/libs/redux/apiSlice';
import type {
  LoanSummary,
  LoanDetail,
  CheckEligibilityRequest,
  EligibilityResult,
  LoanApplicationRequest,
  LoanApplicationResponse,
} from '@/modules/loan/types';
import type { ApiSuccessResponse } from '@/shared/libs/types/auth.types';

interface GetMyLoansResponse {
  loans: LoanSummary[];
  total: number;
}

export const loanApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /v1/loans/my - Get customer's loans
    getMyLoans: builder.query<ApiSuccessResponse<GetMyLoansResponse>, { page?: number; limit?: number; status?: string } | void>({
      query: (params = {}) => ({
        url: '/loans/my',
        method: 'GET',
        params,
      }),
      providesTags: ['MyLoans'],
    }),

    // GET /v1/loans/my/:id - Get loan detail
    getMyLoanDetail: builder.query<ApiSuccessResponse<LoanDetail>, string>({
      query: (id) => ({
        url: `/loans/my/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'MyLoans', id }, 'MyLoans'],
    }),

    // POST /v1/loans/check-eligibility - Check loan eligibility
    checkEligibility: builder.mutation<ApiSuccessResponse<EligibilityResult>, CheckEligibilityRequest>({
      query: (data) => ({
        url: '/loans/check-eligibility',
        method: 'POST',
        body: data,
      }),
    }),

    // POST /v1/loans/apply - Apply for loan
    applyLoan: builder.mutation<ApiSuccessResponse<LoanApplicationResponse>, LoanApplicationRequest>({
      query: (data) => ({
        url: '/loans/apply',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MyLoans'],
    }),

    // POST /v1/loans/my/:id/cancel - Cancel loan
    cancelLoan: builder.mutation<ApiSuccessResponse<{ id: string; status: string }>, string>({
      query: (id) => ({
        url: `/loans/my/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'MyLoans', id }, 'MyLoans'],
    }),
  }),
});

export const {
  useGetMyLoansQuery,
  useGetMyLoanDetailQuery,
  useCheckEligibilityMutation,
  useApplyLoanMutation,
  useCancelLoanMutation,
} = loanApi;
