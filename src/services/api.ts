/* eslint-disable @typescript-eslint/no-explicit-any */
// ...existing code...
import type { ApiResponse, LoginCredentials, User } from "../types";
import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to add auth token and logging
api.interceptors.request.use((cfg) => {
  // Add Authorization header if token exists
  const token = Cookies.get('token');
  const refreshToken = Cookies.get('refreshToken');
  
  // Use token if valid, otherwise use refreshToken as fallback
  let authToken = null;
  if (token && token !== 'undefined' && token !== 'null') {
    authToken = token;
  } else if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
    authToken = refreshToken;
    // Update token cookie with refreshToken
    Cookies.set('token', refreshToken, { expires: 7 });
  }
  
  if (authToken) {
    cfg.headers.Authorization = `Bearer ${authToken}`;
  }
  
  // don't log sensitive values in production
  console.info("[api] request:", cfg.method, cfg.url, cfg.data);
  return cfg;
});

api.interceptors.response.use(
  (res) => {
    console.info("[api] response:", res.status, res.config.url, res.data);
    return res;
  },
  (error) => {
    console.error("[api] response error:", error?.response?.status, error?.response?.data);
    return Promise.reject(error);
  }
);

let accessToken: string | null = null;

export const getAccessToken = (): string | null => accessToken;

// 🔹 Auth API
export const authAPI = {
  register: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const res = await api.post('/auth/register', userData);
      return res.data;
    } catch (err: unknown) {
      return { 
        success: false, 
        data: null as unknown as User, 
        message: (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Registration failed' 
      };
    }
  },

  login: async (
    credentials: LoginCredentials
  ): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      // debug: log payload before sending
      console.info('[authAPI.login] sending credentials:', { ...credentials, password: credentials.password ? '••••' : undefined });

      const res = await api.post('/auth/login', credentials);
      const { token, refreshToken } = res.data.data;

      // save token in memory + cookies
      accessToken = token;
      Cookies.set('token', token, { expires: 7 });
      
      // Also save refreshToken if provided
      if (refreshToken) {
        Cookies.set('refreshToken', refreshToken, { expires: 7 });
      }

      console.log('🍪 Login - Token set:', token);
      console.log('🍪 Login - RefreshToken set:', refreshToken);

      return res.data;
    } catch (err: unknown) {
      // extract backend message (helpful for validation errors)
      const resp = (err as { response?: { status?: number; data?: any } }).response;
      console.error('[authAPI.login] error status:', resp?.status, 'body:', resp?.data);

      const message =
        resp?.data?.message ||
        (Array.isArray(resp?.data?.errors) ? resp.data.errors.map((e: any) => e.msg).join(', ') : undefined) ||
        'Login failed';

      return { 
        success: false, 
        data: null as unknown as { user: User; token: string }, 
        message 
      };
    }
  },

  // ...existing code...
  logout: async (): Promise<ApiResponse<null>> => {
    try {
      const res = await api.post('/auth/logout'); // ✅ backend route
      accessToken = null;
      Cookies.remove('token');
      Cookies.remove('refreshToken');
      return res.data;
    } catch (err: unknown) {
      return { 
        success: false, 
        data: null as unknown as null, 
        message: (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Logout failed' 
      };
    }
  },

  refreshToken: async (): Promise<ApiResponse<{ accessToken: string }>> => {
    try {
      const res = await api.post('/auth/refresh-token'); // ✅ backend route
      const { accessToken: newToken } = res.data.data;
      accessToken = newToken;
      Cookies.set('token', newToken, { expires: 7 });
      return res.data;
    } catch (err: unknown) {
      return { 
        success: false, 
        data: null as unknown as { accessToken: string }, 
        message: (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Token refresh failed' 
      };
    }
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    try {
      const res = await api.get('/auth/profile'); // ✅ backend route
      return res.data;
    } catch (err: unknown) {
      return { 
        success: false, 
        data: null as unknown as User, 
        message: (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Profile fetch failed' 
      };
    }
  },

  updateProfile: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const res = await api.put('/auth/profile', userData); // ✅ backend route
      return res.data;
    } catch (err: unknown) {
      return { 
        success: false, 
        data: null as unknown as User, 
        message: (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Profile update failed' 
      };
    }
  },

  changePassword: async (data: { oldPassword: string; newPassword: string }): Promise<ApiResponse<null>> => {
    try {
      const res = await api.put('/auth/change-password', data); // ✅ backend route
      return res.data;
    } catch (err: unknown) {
      return { 
        success: false, 
        data: null as unknown as null, 
        message: (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Password change failed' 
      };
    }
  },
};
// ...existing code...