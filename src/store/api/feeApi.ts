
import type { Fee, ApiResponse } from '../../types';
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
    
    // Payment management
    payFee: builder.mutation<Payment, { feeId: string; paymentData: PaymentRequest }>({
      query: ({ feeId, paymentData }) => ({
        url: `/api/fees/${feeId}/pay`,
        method: 'POST',
        body: paymentData,
      }),
      transformResponse: (response: ApiResponse<Payment>) => response.data,
      invalidatesTags: ['Fee', 'Payment'],
    }),

    getPayments: builder.query<Payment[], { studentId?: string; feeId?: string }>({
      query: (params) => ({
        url: '/api/payments',
        params,
      }),
      transformResponse: (response: ApiResponse<Payment[]>) => response.data,
      providesTags: ['Payment'],
    }),

    getPaymentHistory: builder.query<Payment[], string>({
      query: (studentId) => `/api/payments/student/${studentId}`,
      transformResponse: (response: ApiResponse<Payment[]>) => response.data,
      providesTags: ['Payment'],
    }),

    generateFeeReport: builder.query<any, { classId?: string; startDate?: string; endDate?: string }>({
      query: (params) => ({
        url: '/api/fees/report',
        params,
      }),
      transformResponse: (response: ApiResponse<any>) => response.data,
    }),

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
  usePayFeeMutation,
  useGetPaymentsQuery,
  useGetPaymentHistoryQuery,
  useGenerateFeeReportQuery,
  useGetOverdueFeesQuery,
} = feeApi;
