/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  isActive: boolean;
  profilePicture?: string;
  address?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  address?: string;
  dateOfBirth?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  profilePicture?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL}/api/users`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // User management
    createUser: builder.mutation<User, CreateUserRequest>({
      query: (userData) => ({
        url: '/',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    getUsers: builder.query<User[], { role?: string; isActive?: boolean; search?: string }>({
      query: (params) => ({
        url: '/',
        params,
      }),
      providesTags: ['User'],
    }),

    getUserById: builder.query<User, string>({
      query: (id) => `/${id}`,
      providesTags: ['User'],
    }),

    updateUser: builder.mutation<User, { id: string; data: UpdateUserRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    toggleUserActivation: builder.mutation<User, string>({
      query: (id) => ({
        url: `/${id}/toggle-activation`,
        method: 'PUT',
      }),
      invalidatesTags: ['User'],
    }),

    changeUserRole: builder.mutation<User, { id: string; role: string }>({
      query: ({ id, role }) => ({
        url: `/${id}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['User'],
    }),

    changePassword: builder.mutation<void, { id: string; data: ChangePasswordRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}/change-password`,
        method: 'PUT',
        body: data,
      }),
    }),

    resetPassword: builder.mutation<void, { id: string; newPassword: string }>({
      query: ({ id, newPassword }) => ({
        url: `/${id}/reset-password`,
        method: 'PUT',
        body: { newPassword },
      }),
    }),

    uploadProfilePicture: builder.mutation<User, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/${id}/profile-picture`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),

    // Bulk operations
    bulkCreateUsers: builder.mutation<User[], CreateUserRequest[]>({
      query: (usersData) => ({
        url: '/bulk',
        method: 'POST',
        body: { users: usersData },
      }),
      invalidatesTags: ['User'],
    }),

    bulkUpdateUsers: builder.mutation<User[], { ids: string[]; data: Partial<UpdateUserRequest> }>({
      query: ({ ids, data }) => ({
        url: '/bulk-update',
        method: 'PUT',
        body: { ids, data },
      }),
      invalidatesTags: ['User'],
    }),

    bulkDeleteUsers: builder.mutation<void, string[]>({
      query: (ids) => ({
        url: '/bulk-delete',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: ['User'],
    }),

    // Analytics
    getUserStats: builder.query<any, void>({
      query: () => '/stats',
    }),

    getUsersByRole: builder.query<User[], string>({
      query: (role) => `/?role=${role}`,
      providesTags: ['User'],
    }),
  }),
});

export const {
  useCreateUserMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserActivationMutation,
  useChangeUserRoleMutation,
  useChangePasswordMutation,
  useResetPasswordMutation,
  useUploadProfilePictureMutation,
  useBulkCreateUsersMutation,
  useBulkUpdateUsersMutation,
  useBulkDeleteUsersMutation,
  useGetUserStatsQuery,
  useGetUsersByRoleQuery,
} = userApi;
