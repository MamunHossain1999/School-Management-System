import type { ApiResponse } from '../../types';
import { baseApi } from './baseApi';

export interface FeeRecord {
  _id: string;
  student: string;
  class: string;
  feeType: 'tuition' | 'transport' | 'library' | 'exam' | 'other';
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paidAmount?: number;
  paymentDate?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  fee: string;
  student: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'online';
  transactionId?: string;
  paymentDate: string;
  receivedBy: string;
  createdAt: string;
}

export interface FeeSummary {
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  fees: FeeRecord[];
}

export interface FeeReport {
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  classWiseReport: ClassWiseReport[];
  monthlyReport: MonthlyReport[];
}

export interface ClassWiseReport {
  classId: string;
  className: string;
  totalStudents: number;
  totalFees: number;
  collectedAmount: number;
  pendingAmount: number;
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalCollected: number;
  totalPending: number;
}

export interface CreateFeeRequest {
  studentId: string;
  classId: string;
  feeType: 'tuition' | 'transport' | 'library' | 'exam' | 'other';
  amount: number;
  dueDate: string;
  description?: string;
}

export interface PaymentRequest {
  amount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'online';
  transactionId?: string;
}

export const feeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Fee management
    getFees: builder.query<FeeRecord[], { studentId?: string; classId?: string; status?: string }>({
      query: (params) => ({
        url: '/api/fees',
        params,
      }),
      transformResponse: (response: ApiResponse<FeeRecord[]>) => response.data,
      providesTags: ['Fee'],
    }),
    
    createFee: builder.mutation<FeeRecord, CreateFeeRequest>({
      query: (feeData) => ({
        url: '/api/fees',
        method: 'POST',
        body: feeData,
      }),
      transformResponse: (response: ApiResponse<FeeRecord>) => response.data,
      invalidatesTags: ['Fee'],
    }),

    updateFee: builder.mutation<FeeRecord, { id: string; data: Partial<CreateFeeRequest> }>({
      query: ({ id, data }) => ({
        url: `/api/fees/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<FeeRecord>) => response.data,
      invalidatesTags: ['Fee'],
    }),

    deleteFee: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/fees/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Fee'],
    }),
    
    // Payment management - POST /:feeId/payment
    processPayment: builder.mutation<Payment, { feeId: string; paymentData: PaymentRequest }>({
      query: ({ feeId, paymentData }) => ({
        url: `/api/fees/${feeId}/payment`,
        method: 'POST',
        body: paymentData,
      }),
      transformResponse: (response: ApiResponse<Payment>) => response.data,
      invalidatesTags: ['Fee', 'Payment'],
    }),

    // GET /student/:studentId/summary
    getStudentFeeSummary: builder.query<FeeSummary, string>({
      query: (studentId) => `/api/fees/student/${studentId}/summary`,
      transformResponse: (response: ApiResponse<FeeSummary>) => response.data,
      providesTags: ['Fee'],
    }),

    // GET /payment-history
    getPaymentHistory: builder.query<Payment[], { studentId?: string; startDate?: string; endDate?: string }>({
      query: (params) => ({
        url: '/api/fees/payment-history',
        params,
      }),
      transformResponse: (response: ApiResponse<Payment[]>) => response.data,
      providesTags: ['Payment'],
    }),

    // GET /report
    generateFeeReport: builder.query<FeeReport, { classId?: string; startDate?: string; endDate?: string }>({
      query: (params) => ({
        url: '/api/fees/report',
        params,
      }),
      transformResponse: (response: ApiResponse<FeeReport>) => response.data,
    }),

    // Additional helper endpoints
    getOverdueFees: builder.query<FeeRecord[], void>({
      query: () => '/api/fees/overdue',
      transformResponse: (response: ApiResponse<FeeRecord[]>) => response.data,
      providesTags: ['Fee'],
    }),
  }),
});

export const {
  useGetFeesQuery,
  useCreateFeeMutation,
  useUpdateFeeMutation,
  useDeleteFeeMutation,
  useProcessPaymentMutation,
  useGetStudentFeeSummaryQuery,
  useGetPaymentHistoryQuery,
  useGenerateFeeReportQuery,
  useGetOverdueFeesQuery,
} = feeApi;
