/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from './baseApi';
import type { User, ApiResponse } from '../../types';

export interface Teacher extends User {
  teacherId: string;
  employeeId: string;
  department: string;
  subjects: string[];
  classes: string[];
  qualification: string;
  experience: number;
  joiningDate: string;
  salary: number;
  designation: string;
  specialization?: string[];
  workingHours?: {
    start: string;
    end: string;
  };
  status: 'active' | 'inactive' | 'on-leave' | 'terminated';
}

export interface CreateTeacherData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  employeeId: string;
  department: string;
  subjects: string[];
  qualification: string;
  experience: number;
  joiningDate: string;
  salary: number;
  designation: string;
  specialization?: string[];
  workingHours?: {
    start: string;
    end: string;
  };
}

export interface TeacherFilters {
  department?: string;
  subject?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TeacherSchedule {
  _id: string;
  teacher: string;
  day: string;
  periods: {
    period: number;
    subject: string;
    class: string;
    section: string;
    startTime: string;
    endTime: string;
  }[];
}

export const teacherApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all teachers with filters (via /api/users?role=teacher)
    getTeachers: builder.query<{ teachers: Teacher[]; total?: number; page?: number; totalPages?: number }, TeacherFilters | void>({
      query: (filters) => ({
        url: '/api/users',
        params: { role: 'teacher', ...(filters || {}) },
      }),
      transformResponse: (response: ApiResponse<{ teachers?: Teacher[]; users?: Teacher[]; data?: { teachers?: Teacher[]; users?: Teacher[] } } | Teacher[]>) => {
        // Normalize various shapes to { teachers: Teacher[] }
        const anyRes: any = response;
        let teachers: Teacher[] = [];
        if (Array.isArray(anyRes?.data)) teachers = anyRes.data as Teacher[];
        else if (Array.isArray(anyRes)) teachers = anyRes as Teacher[];
        else if (Array.isArray(anyRes?.data?.teachers)) teachers = anyRes.data.teachers as Teacher[];
        else if (Array.isArray(anyRes?.data?.users)) teachers = anyRes.data.users as Teacher[];
        else if (Array.isArray(anyRes?.teachers)) teachers = anyRes.teachers as Teacher[];
        else if (Array.isArray(anyRes?.users)) teachers = anyRes.users as Teacher[];
        return { teachers } as any;
      },
      providesTags: ['Teacher'],
    }),

    // Get teacher by ID (via /api/users/:id)
    getTeacherById: builder.query<Teacher, string>({
      query: (id) => `/api/users/${id}`,
      transformResponse: (response: ApiResponse<Teacher>) => response.data,
      providesTags: ['Teacher'],
    }),

    // Create new teacher (via /api/users with role=teacher)
    createTeacher: builder.mutation<Teacher, CreateTeacherData>({
      query: (teacherData) => ({
        url: '/api/users',
        method: 'POST',
        body: { ...teacherData, role: 'teacher' },
      }),
      transformResponse: (response: ApiResponse<Teacher>) => response.data,
      invalidatesTags: ['Teacher', 'User'],
    }),

    // Update teacher (via /api/users/:id)
    updateTeacher: builder.mutation<Teacher, { id: string; data: Partial<CreateTeacherData> }>({
      query: ({ id, data }) => ({
        url: `/api/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Teacher>) => response.data,
      invalidatesTags: ['Teacher', 'User'],
    }),

    // Delete teacher (via /api/users/:id)
    deleteTeacher: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Teacher', 'User'],
    }),

    // Get teachers by department (via /api/users?role=teacher&department=...)
    getTeachersByDepartment: builder.query<Teacher[], string>({
      query: (department) => ({
        url: '/api/users',
        params: { role: 'teacher', department },
      }),
      transformResponse: (response: ApiResponse<Teacher[] | { users?: Teacher[]; data?: Teacher[] }>) => {
        const anyRes: any = response;
        if (Array.isArray(anyRes?.data)) return anyRes.data as Teacher[];
        if (Array.isArray(anyRes)) return anyRes as Teacher[];
        if (Array.isArray(anyRes?.users)) return anyRes.users as Teacher[];
        if (Array.isArray(anyRes?.data?.users)) return anyRes.data.users as Teacher[];
        return [] as Teacher[];
      },
      providesTags: ['Teacher'],
    }),

    // Get teachers by subject (via /api/users?role=teacher&subject=...)
    getTeachersBySubject: builder.query<Teacher[], string>({
      query: (subject) => ({
        url: '/api/users',
        params: { role: 'teacher', subject },
      }),
      transformResponse: (response: ApiResponse<Teacher[] | { users?: Teacher[]; data?: Teacher[] }>) => {
        const anyRes: any = response;
        if (Array.isArray(anyRes?.data)) return anyRes.data as Teacher[];
        if (Array.isArray(anyRes)) return anyRes as Teacher[];
        if (Array.isArray(anyRes?.users)) return anyRes.users as Teacher[];
        if (Array.isArray(anyRes?.data?.users)) return anyRes.data.users as Teacher[];
        return [] as Teacher[];
      },
      providesTags: ['Teacher'],
    }),

    // Assign classes to teacher
    assignClasses: builder.mutation<Teacher, { id: string; classes: string[] }>({
      query: ({ id, classes }) => ({
        url: `/api/teachers/${id}/assign-classes`,
        method: 'PUT',
        body: { classes },
      }),
      transformResponse: (response: ApiResponse<Teacher>) => response.data,
      invalidatesTags: ['Teacher'],
    }),

    // Assign subjects to teacher
    assignSubjects: builder.mutation<Teacher, { id: string; subjects: string[] }>({
      query: ({ id, subjects }) => ({
        url: `/api/teachers/${id}/assign-subjects`,
        method: 'PUT',
        body: { subjects },
      }),
      transformResponse: (response: ApiResponse<Teacher>) => response.data,
      invalidatesTags: ['Teacher'],
    }),

    // Get teacher schedule
    getTeacherSchedule: builder.query<TeacherSchedule[], string>({
      query: (teacherId) => `/api/teachers/${teacherId}/schedule`,
      transformResponse: (response: ApiResponse<TeacherSchedule[]>) => response.data,
      providesTags: ['Teacher', 'Timetable'],
    }),

    // Update teacher schedule
    updateTeacherSchedule: builder.mutation<TeacherSchedule, { teacherId: string; schedule: Partial<TeacherSchedule> }>({
      query: ({ teacherId, schedule }) => ({
        url: `/api/teachers/${teacherId}/schedule`,
        method: 'PUT',
        body: schedule,
      }),
      transformResponse: (response: ApiResponse<TeacherSchedule>) => response.data,
      invalidatesTags: ['Teacher', 'Timetable'],
    }),

    // Get teacher workload
    getTeacherWorkload: builder.query<{ totalHours: number; subjects: any[]; classes: any[] }, string>({
      query: (teacherId) => `/api/teachers/${teacherId}/workload`,
      transformResponse: (response: ApiResponse<{ totalHours: number; subjects: any[]; classes: any[] }>) => response.data,
      providesTags: ['Teacher'],
    }),

    // Update teacher status (via /api/users/:id/status)
    updateTeacherStatus: builder.mutation<Teacher, { id: string; status: 'active' | 'inactive' | 'on-leave' | 'terminated' }>({
      query: ({ id, status }) => ({
        url: `/api/users/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      transformResponse: (response: ApiResponse<Teacher>) => response.data,
      invalidatesTags: ['Teacher'],
    }),

    // Get teacher performance
    getTeacherPerformance: builder.query<any, { teacherId: string; startDate?: string; endDate?: string }>({
      query: ({ teacherId, startDate, endDate }) => ({
        url: `/api/teachers/${teacherId}/performance`,
        params: { startDate, endDate },
      }),
      transformResponse: (response: ApiResponse<any>) => response.data,
      providesTags: ['Teacher'],
    }),

    // Bulk import teachers (via /api/users/bulk-import with role=teacher if supported)
    bulkImportTeachers: builder.mutation<{ message: string; imported: number; failed: number }, FormData>({
      query: (formData) => ({
        url: '/api/users/bulk-import',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: ApiResponse<{ message: string; imported: number; failed: number }>) => response.data,
      invalidatesTags: ['Teacher', 'User'],
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useGetTeacherByIdQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useGetTeachersByDepartmentQuery,
  useGetTeachersBySubjectQuery,
  useAssignClassesMutation,
  useAssignSubjectsMutation,
  useGetTeacherScheduleQuery,
  useUpdateTeacherScheduleMutation,
  useGetTeacherWorkloadQuery,
  useUpdateTeacherStatusMutation,
  useGetTeacherPerformanceQuery,
  useBulkImportTeachersMutation,
} = teacherApi;
