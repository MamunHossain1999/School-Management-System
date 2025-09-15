import { baseApi } from './baseApi';
import type { Class, Subject, ApiResponse } from '../../types';

export const academicApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Classes
    getClasses: builder.query<Class[], void>({
      query: () => '/api/academic/classes',
      transformResponse: (response: ApiResponse<Class[]>) => response.data,
      providesTags: ['Class'],
    }),
    
    createClass: builder.mutation<Class, Partial<Class>>({
      query: (classData) => ({
        url: '/api/academic/classes',
        method: 'POST',
        body: classData,
      }),
      transformResponse: (response: ApiResponse<Class>) => response.data,
      invalidatesTags: ['Class'],
    }),

    // Subjects
    getSubjects: builder.query<Subject[], { classId?: string } | void>({
      query: (params) => ({
        url: '/api/academic/subjects',
        params: params || {},
      }),
      transformResponse: (response: ApiResponse<Subject[]>) => response.data,
      providesTags: ['Subject'],
    }),
    createSubject: builder.mutation<Subject, Partial<Subject>>({
      query: (subjectData) => ({
        url: '/api/academic/subjects',
        method: 'POST',
        body: subjectData,
      }),
      transformResponse: (response: ApiResponse<Subject>) => response.data,
      invalidatesTags: ['Subject'],
    }),

  }),
});

export const {
  useGetClassesQuery,
  useCreateClassMutation,
  useGetSubjectsQuery,
  useCreateSubjectMutation,
} = academicApi;
