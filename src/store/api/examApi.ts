/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

export interface Exam {
  _id: string;
  title: string;
  subject: string;
  class: string;
  section: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  instructions?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Result {
  _id: string;
  exam: string | Exam;
  student: string;
  marksObtained: number;
  grade: string;
  percentage: number;
  status: 'pass' | 'fail' | 'absent';
  remarks?: string;
  submittedBy: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportCard {
  _id: string;
  student: string;
  class: string;
  section: string;
  term: string;
  academicYear: string;
  subjects: {
    subject: string;
    totalMarks: number;
    obtainedMarks: number;
    grade: string;
    percentage: number;
  }[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  overallGrade: string;
  rank: number;
  attendance: {
    totalDays: number;
    presentDays: number;
    percentage: number;
  };
  remarks?: string;
  generatedAt: string;
}

export interface CreateExamRequest {
  title: string;
  subject: string;
  class: string;
  section: string;
  date: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passingMarks: number;
  instructions?: string;
}

export interface SubmitResultRequest {
  examId: string;
  studentId: string;
  marksObtained: number;
  remarks?: string;
}

export const examApi = createApi({
  reducerPath: 'examApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Exam', 'Result', 'ReportCard'],
  endpoints: (builder) => ({
    // Exam management
    createExam: builder.mutation<Exam, CreateExamRequest>({
      query: (examData) => ({
        url: '/exams',
        method: 'POST',
        body: examData,
      }),
      invalidatesTags: ['Exam'],
    }),

    getExams: builder.query<Exam[], { classId?: string; subjectId?: string; isActive?: boolean }>({
      query: (params) => ({
        url: '/exams',
        params,
      }),
      providesTags: ['Exam'],
    }),

    getExamById: builder.query<Exam, string>({
      query: (id) => `/exams/${id}`,
      providesTags: ['Exam'],
    }),

    updateExam: builder.mutation<Exam, { id: string; data: Partial<CreateExamRequest> }>({
      query: ({ id, data }) => ({
        url: `/exams/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Exam'],
    }),

    deleteExam: builder.mutation<void, string>({
      query: (id) => ({
        url: `/exams/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Exam'],
    }),

    // Result management
    submitResult: builder.mutation<Result, SubmitResultRequest>({
      query: (resultData) => ({
        url: '/results',
        method: 'POST',
        body: resultData,
      }),
      invalidatesTags: ['Result'],
    }),

    getResults: builder.query<Result[], { examId?: string; studentId?: string; classId?: string }>({
      query: (params) => ({
        url: '/results',
        params,
      }),
      providesTags: ['Result'],
    }),

    updateResult: builder.mutation<Result, { id: string; data: Partial<SubmitResultRequest> }>({
      query: ({ id, data }) => ({
        url: `/results/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Result'],
    }),

    getStudentResults: builder.query<Result[], string>({
      query: (studentId) => `/results/student/${studentId}`,
      providesTags: ['Result'],
    }),

    // Report card management
    generateReportCard: builder.mutation<ReportCard, { studentId: string; term: string; academicYear: string }>({
      query: (data) => ({
        url: '/report-cards/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ReportCard'],
    }),

    getReportCards: builder.query<ReportCard[], { studentId?: string; classId?: string; term?: string }>({
      query: (params) => ({
        url: '/report-cards',
        params,
      }),
      providesTags: ['ReportCard'],
    }),

    getReportCardById: builder.query<ReportCard, string>({
      query: (id) => `/report-cards/${id}`,
      providesTags: ['ReportCard'],
    }),

    // Analytics and reports
    getExamAnalytics: builder.query<any, string>({
      query: (examId) => `/exams/${examId}/analytics`,
    }),

    getClassPerformance: builder.query<any, { classId: string; examId: string }>({
      query: ({ classId, examId }) => `/analytics/class/${classId}/exam/${examId}`,
    }),
  }),
});

export const {
  useCreateExamMutation,
  useGetExamsQuery,
  useGetExamByIdQuery,
  useUpdateExamMutation,
  useDeleteExamMutation,
  useSubmitResultMutation,
  useGetResultsQuery,
  useUpdateResultMutation,
  useGetStudentResultsQuery,
  useGenerateReportCardMutation,
  useGetReportCardsQuery,
  useGetReportCardByIdQuery,
  useGetExamAnalyticsQuery,
  useGetClassPerformanceQuery,
} = examApi;
