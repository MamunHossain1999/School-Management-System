/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from './baseApi';
import type { User, LoginCredentials, ApiResponse, ChangePasswordData, UpdateProfileData } from '../../types';
import Cookies from 'js-cookie';
import { setUser } from '../slices/authSlice';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  profilePicture?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterData>({
      query: (userData) => ({
        url: '/api/auth/register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => {
        const { user, refreshToken } = response.data as any;
        const token = (response.data as any).token || (response.data as any).accessToken;
        if (token && token !== 'undefined' && token !== 'null') Cookies.set('token', token, { expires: 7 });
        if (refreshToken) Cookies.set('refreshToken', refreshToken, { expires: 7 });
        Cookies.set('user', JSON.stringify(user), { expires: 7 });
        // Return normalized shape
        return { user, token, refreshToken } as AuthResponse;
      },
      invalidatesTags: ['User'],
    }),

    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => {
        const { user, refreshToken } = response.data as any;
        const token = (response.data as any).token || (response.data as any).accessToken;
        if (token && token !== 'undefined' && token !== 'null') Cookies.set('token', token, { expires: 7 });
        if (refreshToken) Cookies.set('refreshToken', refreshToken, { expires: 7 });
        Cookies.set('user', JSON.stringify(user), { expires: 7 });
        // Return normalized shape
        return { user, token, refreshToken } as AuthResponse;
      },
      invalidatesTags: ['User'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/api/auth/logout',
        method: 'POST',
      }),
      transformResponse: () => {
        Cookies.remove('token');
        Cookies.remove('refreshToken');
        Cookies.remove('user');
      },
      invalidatesTags: ['User'],
    }),

    refreshToken: builder.mutation<{ accessToken: string }, void>({
      query: () => ({
        url: '/api/auth/refresh-token',
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<{ accessToken: string }>) => {
        const { accessToken } = response.data;
        if (accessToken) Cookies.set('token', accessToken, { expires: 7 });
        return response.data;
      },
    }),

    getProfile: builder.query<User, void>({
      query: () => '/api/auth/profile',
      transformResponse: (response: ApiResponse<User>) => response.data,
      providesTags: ['User'],
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        // Mark first arg as used for ESLint
        void _;
        try {
          const { data } = await queryFulfilled; // data is User
          if (data) {
            Cookies.set('user', JSON.stringify(data), { expires: 7 });
            dispatch(setUser(data));
          }
        } catch { /* ignore */ }
      },
    }),

    updateProfile: builder.mutation<User, UpdateProfileData>({
      query: (data) => ({
        url: '/api/auth/profile',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<User>) => {
        Cookies.set('user', JSON.stringify(response.data), { expires: 7 });
        return response.data;
      },
      invalidatesTags: ['User'],
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        void _;
        try {
          const { data } = await queryFulfilled; // data is User
          if (data) {
            dispatch(setUser(data));
          }
        } catch { /* ignore */ }
      },
    }),

    // ------------------ Avatar Upload ------------------
    uploadAvatar: builder.mutation<User, FormData>({
      query: (formData) => ({
        url: '/api/auth/profile/avatar',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: ApiResponse<User | { profilePicture?: string }>) => {
        const data = response.data as any;
        // If backend returns full user, save directly. Otherwise, merge profilePicture into existing user cookie.
        if (data && (data.id || data._id || data.email)) {
          Cookies.set('user', JSON.stringify(data), { expires: 7 });
          return data as User;
        }
        const existingUser = Cookies.get('user') ? JSON.parse(Cookies.get('user') as string) : {};
        if (data?.profilePicture) {
          existingUser.profilePicture = data.profilePicture;
          Cookies.set('user', JSON.stringify(existingUser), { expires: 7 });
        }
        return existingUser as User;
      },
      invalidatesTags: ['User'],
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        // Mark first arg as used for ESLint
        void _;
        try {
          const { data } = await queryFulfilled; // data is User
          if (data) {
            dispatch(setUser(data));
          }
        } catch { /* ignore */ }
      },
    }),

    changePassword: builder.mutation<{ message: string }, ChangePasswordData>({
      query: (data) => ({
        url: '/api/auth/change-password',
        method: 'PUT',
        // Support both currentPassword and oldPassword naming for compatibility
        body: { ...data, oldPassword: (data as any).currentPassword ?? (data as any).oldPassword },
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) => response.data,
    }),

    verifyToken: builder.query<User, void>({
      query: () => '/api/auth/verify-token',
      transformResponse: (response: ApiResponse<User>) => response.data,
      providesTags: ['User'],
    }),

    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (data) => ({
        url: '/api/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) => response.data,
    }),

    resetPassword: builder.mutation<{ message: string }, { token: string; password: string }>({
      query: (data) => ({
        url: '/api/auth/reset-password',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) => response.data,
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useChangePasswordMutation,
  useVerifyTokenQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
