
import type { Fee, ApiResponse } from '../../types';
import { baseApi } from './baseApi';

export const feeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFees: builder.query<Fee[], string | void>({
      query: (studentId) => ({
        url: '/fees',
        params: studentId ? { studentId } : {},
      }),
      transformResponse: (response: ApiResponse<Fee[]>) => response.data,
      providesTags: ['Fee'],
    }),
    
    createFee: builder.mutation<Fee, Partial<Fee>>({
      query: (feeData) => ({
        url: '/fees',
        method: 'POST',
        body: feeData,
      }),
      transformResponse: (response: ApiResponse<Fee>) => response.data,
      invalidatesTags: ['Fee'],
    }),
    
    payFee: builder.mutation<Fee, { feeId: string; paymentData: unknown }>({
      query: ({ feeId, paymentData }) => ({
        url: `/fees/${feeId}/pay`,
        method: 'POST',
        body: paymentData,
      }),
      transformResponse: (response: ApiResponse<Fee>) => response.data,
      invalidatesTags: ['Fee'],
    }),
  }),
});

export const {
  useGetFeesQuery,
  useCreateFeeMutation,
  usePayFeeMutation,
} = feeApi;
