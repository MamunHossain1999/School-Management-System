/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from './baseApi';

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  subject?: string;
  class?: string;
  section?: string;
  dueDate: string;
  totalMarks: number;
  attachments?: string[];
  teacherId?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  submissionType?: string;
  allowLateSubmission?: boolean;
  status?: string;
  createdBy?: string;
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
  subjectId: string;
  classId: string;
  sectionId: string;
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

export const assignmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Assignment endpoints
    createAssignment: builder.mutation<Assignment, CreateAssignmentRequest>({
      query: (assignmentData) => ({
        url: '/api/assignments',
        method: 'POST',
        body: assignmentData,
      }),
      transformResponse: (response: any) => {
        console.log('Create Assignment API Response:', response);
        // Handle nested response structure
        if (response.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: ['Assignment'],
    }),

    getAssignments: builder.query<Assignment[], { class?: string; subject?: string }>({
      query: (params) => ({
        url: '/api/assignments',
        params,
      }),
      transformResponse: (response: any) => {
        console.log('Raw API Response for Assignments:', response);
        
        // Handle nested response structure: response.data.assignments
        if (response.data && Array.isArray(response.data.assignments)) {
          console.log('Found assignments in response.data.assignments:', response.data.assignments);
          return response.data.assignments;
        }
        
        // Check if data is direct array
        if (response.data && Array.isArray(response.data)) {
          console.log('Found assignments in response.data (array):', response.data);
          return response.data;
        }
        
        // Check if response itself is array
        if (Array.isArray(response)) {
          console.log('Found assignments in response (direct array):', response);
          return response;
        }
        
        console.log('No assignments found, returning empty array');
        return [];
      },
      providesTags: ['Assignment'],
    }),

    updateAssignment: builder.mutation<Assignment, { id: string; data: Partial<CreateAssignmentRequest> }>({
      query: ({ id, data }) => ({
        url: `/api/assignments/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: any) => {
        console.log('Update Assignment API Response:', response);
        // Handle nested response structure
        if (response.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: ['Assignment'],
    }),

    deleteAssignment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/assignments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Assignment'],
    }),

    getAssignmentSubmissions: builder.query<AssignmentSubmission[], string>({
      query: (assignmentId) => `/api/assignments/${assignmentId}/submissions`,
      providesTags: ['Submission'],
    }),

    // Submission endpoints
    submitAssignment: builder.mutation<AssignmentSubmission, { assignmentId: string; data: SubmitAssignmentRequest }>({
      query: ({ assignmentId, data }) => ({
        url: `/api/assignments/${assignmentId}/submit`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Submission'],
    }),

    gradeSubmission: builder.mutation<AssignmentSubmission, { id: string; data: GradeSubmissionRequest }>({
      query: ({ id, data }) => ({
        url: `/api/assignments/submissions/${id}/grade`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Submission'],
    }),

    getStudentSubmissions: builder.query<AssignmentSubmission[], void>({
      query: () => '/api/assignments/submissions/my',
      providesTags: ['Submission'],
    }),

    updateSubmission: builder.mutation<AssignmentSubmission, { id: string; data: Partial<SubmitAssignmentRequest> }>({
      query: ({ id, data }) => ({
        url: `/api/assignments/submissions/${id}`,
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
