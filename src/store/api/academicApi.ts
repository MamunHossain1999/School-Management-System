import { baseApi } from './baseApi';
import type { Class, Subject, Assignment, ApiResponse } from '../../types';

export const academicApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Classes
    getClasses: builder.query<Class[], void>({
      query: () => '/classes',
      transformResponse: (response: ApiResponse<Class[]>) => response.data,
      providesTags: ['Class'],
    }),
    
    createClass: builder.mutation<Class, Partial<Class>>({
      query: (classData) => ({
        url: '/classes',
        method: 'POST',
        body: classData,
      }),
      transformResponse: (response: ApiResponse<Class>) => response.data,
      invalidatesTags: ['Class'],
    }),
    
    // Subjects
    getSubjects: builder.query<Subject[], string | void>({
      query: (classId) => ({
        url: '/subjects',
        params: classId ? { classId } : {},
      }),
      transformResponse: (response: ApiResponse<Subject[]>) => response.data,
      providesTags: ['Subject'],
    }),
    
    createSubject: builder.mutation<Subject, Partial<Subject>>({
      query: (subjectData) => ({
        url: '/subjects',
        method: 'POST',
        body: subjectData,
      }),
      transformResponse: (response: ApiResponse<Subject>) => response.data,
      invalidatesTags: ['Subject'],
    }),
    
    // Assignments
    getAssignments: builder.query<Assignment[], { classId?: string; subjectId?: string; teacherId?: string } | undefined>({
      query: (filters) => ({
        url: '/assignments',
        params: filters || {},
      }),
      transformResponse: (response: ApiResponse<Assignment[]>) => response.data,
      providesTags: ['Assignment'],
    }),
    
    createAssignment: builder.mutation<Assignment, Partial<Assignment>>({
      query: (assignmentData) => ({
        url: '/assignments',
        method: 'POST',
        body: assignmentData,
      }),
      transformResponse: (response: ApiResponse<Assignment>) => response.data,
      invalidatesTags: ['Assignment'],
    }),
  }),
});

export const {
  useGetClassesQuery,
  useCreateClassMutation,
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useGetAssignmentsQuery,
  useCreateAssignmentMutation,
} = academicApi;
