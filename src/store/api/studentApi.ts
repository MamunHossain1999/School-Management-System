/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from './baseApi';
import type { User, ApiResponse } from '../../types';

export interface Student extends User {
  studentId: string;
  class: string;
  section: string;
  rollNumber: string;
  admissionDate: string;
  parentId?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  bloodGroup?: string;
  medicalConditions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  academicYear: string;
  status: 'active' | 'inactive' | 'graduated' | 'transferred';
}

export interface CreateStudentData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  class: string;
  section: string;
  rollNumber: string;
  admissionDate: string;
  parentId?: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  bloodGroup?: string;
  medicalConditions?: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  academicYear: string;
}

export interface StudentFilters {
  class?: string;
  section?: string;
  academicYear?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const studentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all students with filters
    getStudents: builder.query<{ students: Student[]; total: number; page: number; totalPages: number }, StudentFilters | void>({
      query: (filters) => ({
        url: '/api/students',
        params: filters || {},
      }),
      transformResponse: (response: ApiResponse<{ students: Student[]; total: number; page: number; totalPages: number }>) => response.data,
      providesTags: ['Student'],
    }),

    // Get student by ID
    getStudentById: builder.query<Student, string>({
      query: (id) => `/api/students/${id}`,
      transformResponse: (response: ApiResponse<Student>) => response.data,
      providesTags: ['Student'],
    }),

    // Create new student
    createStudent: builder.mutation<Student, CreateStudentData>({
      query: (studentData) => ({
        url: '/api/students',
        method: 'POST',
        body: studentData,
      }),
      transformResponse: (response: ApiResponse<Student>) => response.data,
      invalidatesTags: ['Student', 'User'],
    }),

    // Update student
    updateStudent: builder.mutation<Student, { id: string; data: Partial<CreateStudentData> }>({
      query: ({ id, data }) => ({
        url: `/api/students/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Student>) => response.data,
      invalidatesTags: ['Student', 'User'],
    }),

    // Delete student
    deleteStudent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/students/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Student', 'User'],
    }),

    // Get students by class
    getStudentsByClass: builder.query<Student[], { classId: string; section?: string }>({
      query: ({ classId, section }) => ({
        url: `/api/students/class/${classId}`,
        params: section ? { section } : {},
      }),
      transformResponse: (response: ApiResponse<Student[]>) => response.data,
      providesTags: ['Student'],
    }),

    // Promote students to next class
    promoteStudents: builder.mutation<{ message: string; promoted: number }, { studentIds: string[]; newClass: string; newSection: string; academicYear: string }>({
      query: (data) => ({
        url: '/api/students/promote',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ message: string; promoted: number }>) => response.data,
      invalidatesTags: ['Student'],
    }),

    // Transfer student
    transferStudent: builder.mutation<Student, { id: string; newClass: string; newSection: string; reason?: string }>({
      query: ({ id, ...data }) => ({
        url: `/api/students/${id}/transfer`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Student>) => response.data,
      invalidatesTags: ['Student'],
    }),

    // Get student academic record
    getStudentAcademicRecord: builder.query<any, string>({
      query: (id) => `/api/students/${id}/academic-record`,
      transformResponse: (response: ApiResponse<any>) => response.data,
      providesTags: ['Student', 'Grade', 'Result'],
    }),

    // Update student status
    updateStudentStatus: builder.mutation<Student, { id: string; status: 'active' | 'inactive' | 'graduated' | 'transferred' }>({
      query: ({ id, status }) => ({
        url: `/api/students/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      transformResponse: (response: ApiResponse<Student>) => response.data,
      invalidatesTags: ['Student'],
    }),

    // Bulk import students
    bulkImportStudents: builder.mutation<{ message: string; imported: number; failed: number }, FormData>({
      query: (formData) => ({
        url: '/api/students/bulk-import',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: ApiResponse<{ message: string; imported: number; failed: number }>) => response.data,
      invalidatesTags: ['Student', 'User'],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetStudentsByClassQuery,
  usePromoteStudentsMutation,
  useTransferStudentMutation,
  useGetStudentAcademicRecordQuery,
  useUpdateStudentStatusMutation,
  useBulkImportStudentsMutation,
} = studentApi;
