import { baseApi } from './baseApi';
import type { Exam, Result, ApiResponse } from '../../types';

export const examApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExams: builder.query<Exam[], { classId?: string; subjectId?: string } | void>({
      query: (filters) => ({
        url: '/exams',
        params: filters || {},
      }),
      transformResponse: (response: ApiResponse<Exam[]>) => response.data,
      providesTags: ['Exam'],
    }),
    
    createExam: builder.mutation<Exam, Partial<Exam>>({
      query: (examData) => ({
        url: '/exams',
        method: 'POST',
        body: examData,
      }),
      transformResponse: (response: ApiResponse<Exam>) => response.data,
      invalidatesTags: ['Exam'],
    }),
    
    getResults: builder.query<Result[], { examId?: string; studentId?: string }>({
      query: (filters) => ({
        url: '/results',
        params: filters,
      }),
      transformResponse: (response: ApiResponse<Result[]>) => response.data,
      providesTags: ['Result'],
    }),
    
    submitResult: builder.mutation<Result, Partial<Result>>({
      query: (resultData) => ({
        url: '/results',
        method: 'POST',
        body: resultData,
      }),
      transformResponse: (response: ApiResponse<Result>) => response.data,
      invalidatesTags: ['Result'],
    }),
  }),
});

export const {
  useGetExamsQuery,
  useCreateExamMutation,
  useGetResultsQuery,
  useSubmitResultMutation,
} = examApi;
