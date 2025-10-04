/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from './baseApi';
import type { Class, Subject, Section, ApiResponse, User } from '../../types';

// Extended API Response types for nested data structures
type SubjectsApiResponse = {
  success: boolean;
  message: string;
  data: Subject[] | { subjects: Subject[] };
};

type SectionsApiResponse = {
  success: boolean;
  message: string;
  data: Section[] | { sections: Section[] };
};

// DTOs for create operations matching backend API
type CreateClassDTO = {
  name: string;
  grade: number; // 1-12
  academicYear: string;
  schoolId?: string; // Optional - backend will handle default
};

type UpdateClassDTO = {
  name?: string;
  grade?: number;
  academicYear?: string;
};

type CreateSubjectDTO = {
  name: string;
  code: string;
  classIds?: string[]; // array of related class IDs
  credits?: number;
  type?: 'core' | 'elective';
  schoolId?: string; // Optional - backend will handle default
};

type UpdateSubjectDTO = {
  name?: string;
  code?: string;
  classIds?: string[];
  credits?: number;
  type?: 'core' | 'elective';
};

type CreateSectionDTO = {
  name: string;
  classId: string;
  schoolId?: string; // Optional - backend will handle default
};

type UpdateSectionDTO = {
  name?: string;
  classId?: string;
};

type EnrollStudentDTO = {
  userId: string;
  classId?: string;
  sectionId?: string;
  schoolId?: string; // Optional - backend will handle default
};

type AssignTeacherDTO = {
  teacherId: string;
  classId?: string;
  sectionId?: string;
  subjectIds?: string[];
  schoolId?: string; // Optional - backend will handle default
};

export const academicApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Classes Management
    getClasses: builder.query<Class[], void>({
      query: () => '/api/academic/classes',
      transformResponse: (response: any) => {
        console.log('Raw API Response for Classes:', response);
        
        // Handle nested response structure: response.data.classes
        if (response.data && response.data.classes) {
          console.log('Found classes in response.data.classes:', response.data.classes);
          return response.data.classes;
        }
        
        // Check if data is direct array
        if (response.data && Array.isArray(response.data)) {
          console.log('Found classes in response.data (array):', response.data);
          return response.data;
        }
        
        // Check if response itself is array
        if (Array.isArray(response)) {
          console.log('Found classes in response (direct array):', response);
          return response;
        }
        
        console.log('No classes found, returning empty array');
        return [];
      },
      providesTags: ['Class'],
    }),
    
    createClass: builder.mutation<Class, CreateClassDTO>({
      query: (classData) => ({
        url: '/api/academic/classes',
        method: 'POST',
        body: classData,
      }),
      transformResponse: (response: ApiResponse<Class>) => response.data,
      invalidatesTags: ['Class'],
    }),

    updateClass: builder.mutation<Class, { id: string; data: UpdateClassDTO }>({
      query: ({ id, data }) => ({
        url: `/api/academic/classes/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Class>) => response.data,
      invalidatesTags: ['Class'],
    }),

    deleteClass: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/academic/classes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Class'],
    }),

    // Subjects Management
    getSubjects: builder.query<Subject[], { classId?: string } | void>({
      query: (params) => ({
        url: '/api/subjects',
        params: params || {},
      }),
      transformResponse: (response: SubjectsApiResponse) => {
        // Handle nested response structure
        if (response.data && Array.isArray((response.data as any).subjects)) {
          return (response.data as any).subjects;
        }
        if (response.data && Array.isArray(response.data)) {
          return response.data as Subject[];
        }
        // Fallback for direct array response
        return (response.data as any) || response || [];
      },
      providesTags: ['Subject'],
    }),

    getSubjectById: builder.query<Subject, string>({
      query: (id) => `/api/subjects/${id}`,
      transformResponse: (response: ApiResponse<Subject>) => response.data,
      providesTags: ['Subject'],
    }),

    createSubject: builder.mutation<Subject, CreateSubjectDTO>({
      query: (subjectData) => ({
        url: '/api/subjects',
        method: 'POST',
        body: subjectData,
      }),
      transformResponse: (response: ApiResponse<Subject>) => response.data,
      invalidatesTags: ['Subject'],
    }),

    updateSubject: builder.mutation<Subject, { id: string; data: UpdateSubjectDTO }>({
      query: ({ id, data }) => ({
        url: `/api/subjects/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Subject>) => response.data,
      invalidatesTags: ['Subject'],
    }),

    deleteSubject: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/subjects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subject'],
    }),

    assignTeachersToSubject: builder.mutation<Subject, { id: string; teacherIds: string[] }>({
      query: ({ id, teacherIds }) => ({
        url: `/api/subjects/${id}/teachers`,
        method: 'PUT',
        body: { teacherIds },
      }),
      transformResponse: (response: ApiResponse<Subject>) => response.data,
      invalidatesTags: ['Subject'],
    }),

    getSubjectsByTeacher: builder.query<Subject[], string>({
      query: (teacherId) => `/api/subjects/teacher/${teacherId}`,
      transformResponse: (response: ApiResponse<Subject[]>) => response.data,
      providesTags: ['Subject'],
    }),

    // Sections Management
    getSections: builder.query<Section[], { classId?: string } | void>({
      query: (params) => (
        params && Object.keys(params).length > 0
          ? { url: '/api/academic/sections', params }
          : '/api/academic/sections'
      ),
      transformResponse: (response: SectionsApiResponse) => {
        // Handle nested response structure
        if (response.data && Array.isArray((response.data as any).sections)) {
          return (response.data as any).sections;
        }
        if (response.data && Array.isArray(response.data)) {
          return response.data as Section[];
        }
        // Fallback for direct array response
        return (response.data as any) || response || [];
      },
      providesTags: ['Section'],
    }),

    createSection: builder.mutation<Section, CreateSectionDTO>({
      query: (sectionData) => ({
        url: '/api/academic/sections',
        method: 'POST',
        body: sectionData,
      }),
      transformResponse: (response: ApiResponse<Section>) => response.data,
      invalidatesTags: ['Section'],
    }),

    updateSection: builder.mutation<Section, { id: string; data: UpdateSectionDTO }>({
      async queryFn({ id, data }, _api, _extra, baseQuery) {
        // Try a sequence of likely routes/methods to maximize compatibility
        const attempts = [
          { url: `/api/academic/sections/${id}`, method: 'PUT' as const },
          { url: `/api/sections/${id}`, method: 'PUT' as const },
          { url: `/api/academic/sections/${id}`, method: 'PATCH' as const },
          { url: `/api/sections/${id}`, method: 'PATCH' as const },
          { url: `/api/academic/section/${id}`, method: 'PUT' as const },
          { url: `/api/section/${id}`, method: 'PUT' as const },
        ];

        let res: any = null;
        for (const attempt of attempts) {
          res = await baseQuery({ url: attempt.url, method: attempt.method, body: data });
          if (!res?.error || (res?.error as any).status !== 404) break;
        }
        if (res?.error) return { error: res.error as any } as any;
        const payload = (res?.data as ApiResponse<Section>)?.data ?? res?.data;
        return { data: payload as Section };
      },
      invalidatesTags: ['Section'],
    }),

    deleteSection: builder.mutation<void, string>({
      async queryFn(id, _api, _extra, baseQuery) {
        // Try a sequence of likely routes to maximize compatibility
        const attempts = [
          { url: `/api/academic/sections/${id}`, method: 'DELETE' as const },
          { url: `/api/sections/${id}`, method: 'DELETE' as const },
          { url: `/api/academic/section/${id}`, method: 'DELETE' as const },
          { url: `/api/section/${id}`, method: 'DELETE' as const },
        ];

        let res: any = null;
        for (const attempt of attempts) {
          res = await baseQuery({ url: attempt.url, method: attempt.method });
          if (!res?.error || (res?.error as any).status !== 404) break;
        }
        if (res?.error) return { error: res.error as any } as any;
        return { data: undefined } as any;
      },
      invalidatesTags: ['Section'],
    }),

    // Student Management
    enrollStudent: builder.mutation<unknown, EnrollStudentDTO>({
      query: (payload) => ({
        url: '/api/academic/students',
        method: 'POST',
        body: payload,
      }),
      transformResponse: (response: ApiResponse<unknown>) => response.data,
      invalidatesTags: ['Student', 'Enrollment'],
    }),

    getAcademicStudents: builder.query<User[], { classId?: string; sectionId?: string } | void>({
      query: (params) => ({
        url: '/api/academic/students',
        params: params || {},
      }),
      transformResponse: (response: ApiResponse<User[]>) => response.data,
      providesTags: ['Student'],
    }),

    // Teacher Management
    assignTeacher: builder.mutation<unknown, AssignTeacherDTO>({
      query: (payload) => ({
        url: '/api/academic/teachers',
        method: 'POST',
        body: payload,
      }),
      transformResponse: (response: ApiResponse<unknown>) => response.data,
      invalidatesTags: ['Teacher'],
    }),

    getAcademicTeachers: builder.query<User[], { classId?: string; sectionId?: string; subjectId?: string } | void>({
      query: (params) => ({
        url: '/api/academic/teachers',
        params: params || {},
      }),
      transformResponse: (response: ApiResponse<User[]>) => response.data,
      providesTags: ['Teacher'],
    }),

    // Get all student users for enrollment dropdown
    getAllStudentUsers: builder.query<User[], void>({
      query: () => '/api/users?role=student',
      transformResponse: (response: any) => {
        console.log('Raw Student Users API Response:', response);
        
        // Handle different response structures
        if (response.data && Array.isArray(response.data.users)) {
          console.log('Found users in response.data.users:', response.data.users);
          return response.data.users;
        }
        if (response.data && Array.isArray(response.data)) {
          console.log('Found users in response.data (array):', response.data);
          return response.data;
        }
        
        console.log('Returning fallback data:', response.data || response || []);
        return response.data || response || [];
      },
      providesTags: ['User'],
    }),

  }),
});

export const {
  // Classes
  useGetClassesQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  
  // Subjects
  useGetSubjectsQuery,
  useGetSubjectByIdQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useAssignTeachersToSubjectMutation,
  useGetSubjectsByTeacherQuery,
  
  // Sections
  useGetSectionsQuery,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  
  // Students & Teachers
  useEnrollStudentMutation,
  useGetAcademicStudentsQuery,
  useAssignTeacherMutation,
  useGetAcademicTeachersQuery,
  useGetAllStudentUsersQuery,
} = academicApi;

