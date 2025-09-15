import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  subject: string;
  class: string;
  section: string;
  dueDate: string;
  totalMarks: number;
  attachments?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSubmission {
  _id: string;
  assignment: string;
  student: string;
  content: string;
  attachments?: string[];
  submittedAt: string;
  grade?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}

export interface CreateAssignmentRequest {
  title: string;
  description: string;
  subject: string;
  class: string;
  section: string;
  dueDate: string;
  totalMarks: number;
  attachments?: string[];
}

export interface SubmitAssignmentRequest {
  content: string;
  attachments?: string[];
}

export interface GradeSubmissionRequest {
  grade: number;
  feedback?: string;
}

export const assignmentApi = createApi({
  reducerPath: 'assignmentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL}/api/assignments`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Assignment', 'Submission'],
  endpoints: (builder) => ({
    // Assignment endpoints
    createAssignment: builder.mutation<Assignment, CreateAssignmentRequest>({
      query: (assignmentData) => ({
        url: '/',
        method: 'POST',
        body: assignmentData,
      }),
      invalidatesTags: ['Assignment'],
    }),

    getAssignments: builder.query<Assignment[], { class?: string; subject?: string }>({
      query: (params) => ({
        url: '/',
        params,
      }),
      providesTags: ['Assignment'],
    }),

    updateAssignment: builder.mutation<Assignment, { id: string; data: Partial<CreateAssignmentRequest> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Assignment'],
    }),

    deleteAssignment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Assignment'],
    }),

    getAssignmentSubmissions: builder.query<AssignmentSubmission[], string>({
      query: (assignmentId) => `/${assignmentId}/submissions`,
      providesTags: ['Submission'],
    }),

    // Submission endpoints
    submitAssignment: builder.mutation<AssignmentSubmission, { assignmentId: string; data: SubmitAssignmentRequest }>({
      query: ({ assignmentId, data }) => ({
        url: `/${assignmentId}/submit`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Submission'],
    }),

    gradeSubmission: builder.mutation<AssignmentSubmission, { id: string; data: GradeSubmissionRequest }>({
      query: ({ id, data }) => ({
        url: `/submissions/${id}/grade`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Submission'],
    }),

    getStudentSubmissions: builder.query<AssignmentSubmission[], void>({
      query: () => '/submissions/my',
      providesTags: ['Submission'],
    }),

    updateSubmission: builder.mutation<AssignmentSubmission, { id: string; data: Partial<SubmitAssignmentRequest> }>({
      query: ({ id, data }) => ({
        url: `/submissions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Submission'],
    }),
  }),
});

export const {
  useCreateAssignmentMutation,
  useGetAssignmentsQuery,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetAssignmentSubmissionsQuery,
  useSubmitAssignmentMutation,
  useGradeSubmissionMutation,
  useGetStudentSubmissionsQuery,
  useUpdateSubmissionMutation,
} = assignmentApi;
