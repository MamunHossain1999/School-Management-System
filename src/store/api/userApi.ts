/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from './baseApi';
import type { User, ApiResponse } from '../../types';

// ---------- Types ----------
export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface CreateStudentPayload extends CreateUserPayload {
  classId: string;
  sectionId: string;
  rollNumber: string;
}

export interface ListUsersQuery {
  role?: User['role'] | string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  total: number;
}

export interface ListUsersData {
  users: User[];
  pagination: Pagination;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ------------------ Create Admin ------------------
    createAdmin: builder.mutation<User, CreateUserPayload>({
      query: (body) => ({
        url: '/api/users/create/admin',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<{ user: User } | User>) => {
        const data = (response?.data as any)?.user ?? (response?.data as any);
        return data as User;
      },
      invalidatesTags: ['User'],
    }),
    // ------------------ Create Teacher ------------------
    createTeacher: builder.mutation<User, CreateUserPayload>({
      query: (body) => ({
        url: '/api/users/create/teacher',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<{ user: User } | User>) => {
        const data = (response?.data as any)?.user ?? (response?.data as any);
        return data as User;
      },
      invalidatesTags: ['User'],
    }),

    // ------------------ Create Student ------------------
    createStudent: builder.mutation<User, CreateStudentPayload>({
      query: (body) => ({
        url: '/api/users/create/student',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<{ user: User } | User>) => {
        const data = (response?.data as any)?.user ?? (response?.data as any);
        return data as User;
      },
      invalidatesTags: ['User'],
    }),

    // ------------------ Create User (generic role) ------------------
    createUser: builder.mutation<User, CreateUserPayload & { role: string }>({
      query: (body) => ({
        url: '/api/users/create',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<{ user: User } | User>) => {
        const data = (response?.data as any)?.user ?? (response?.data as any);
        return data as User;
      },
      invalidatesTags: ['User'],
    }),

    // ------------------ List Users ------------------
    listUsers: builder.query<ListUsersData, ListUsersQuery | undefined>({
      query: (params?: ListUsersQuery) => ({
        url: '/api/users',
        params,
      }),
      transformResponse: (response: ApiResponse<ListUsersData>) => response.data,
      providesTags: (result) =>
        result?.users
          ? [
              ...result.users.map((u) => ({ type: 'User' as const, id: u._id || u.id })),
              { type: 'User' as const, id: 'LIST' },
            ]
          : [{ type: 'User' as const, id: 'LIST' }],
    }),

    // ------------------ Get User By ID ------------------
    getUserById: builder.query<User, string>({
      query: (id) => `/api/users/${id}`,
      transformResponse: (response: ApiResponse<{ user: User } | User>) => {
        const data = (response?.data as any)?.user ?? (response?.data as any);
        return data as User;
      },
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    // ------------------ Update User ------------------
    updateUser: builder.mutation<User, { id: string; updates: Partial<User> & Record<string, unknown> }>({
      query: ({ id, updates }) => ({
        url: `/api/users/${id}`,
        method: 'PUT',
        body: updates,
      }),
      transformResponse: (response: ApiResponse<{ user: User } | User>) => {
        const data = (response?.data as any)?.user ?? (response?.data as any);
        return data as User;
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    // ------------------ Deactivate User ------------------
    deactivateUser: builder.mutation<User, string>({
      query: (id) => ({
        url: `/api/users/${id}/deactivate`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiResponse<{ user: User } | User>) => {
        const data = (response?.data as any)?.user ?? (response?.data as any);
        return data as User;
      },
      invalidatesTags: (_result, _error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    // ------------------ Activate User ------------------
    activateUser: builder.mutation<User, string>({
      query: (id) => ({
        url: `/api/users/${id}/activate`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiResponse<{ user: User } | User>) => {
        const data = (response?.data as any)?.user ?? (response?.data as any);
        return data as User;
      },
      invalidatesTags: (_result, _error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useCreateTeacherMutation,
  useCreateAdminMutation,
  useCreateStudentMutation,
  useListUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeactivateUserMutation,
  useActivateUserMutation,
} = userApi;
