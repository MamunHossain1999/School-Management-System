/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiResponse, LoginCredentials, User } from "../types";
import axios from "axios";
import Cookies from "js-cookie";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((cfg) => {
  // Read token from cookies with fallback to refreshToken when needed
  let token = Cookies.get('token');
  const refreshToken = Cookies.get('refreshToken');

  if (!token || token === 'undefined' || token === 'null') {
    if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
      token = refreshToken;
      // Sync cookie to avoid repeated fallbacks
      Cookies.set('token', refreshToken, { expires: 7 });
    } else {
      token = undefined;
    }
  }

  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  console.info("[api] request:", cfg.method, cfg.url, cfg.data);
  return cfg;
});

api.interceptors.response.use(
  (res) => { console.info("[api] response:", res.status, res.config.url, res.data); return res; },
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    // Normalize Zod-style validation errors to a readable message
    let friendlyMessage = data?.message || error?.message || 'Request failed';
    const issues = (data?.error || data?.errors) as Array<{ path?: string | string[]; message?: string }> | undefined;
    if (Array.isArray(issues) && issues.length > 0) {
      const lines = issues.map((i) => {
        const p = Array.isArray(i.path) ? i.path.join('.') : i.path;
        return p ? `${p}: ${i.message || ''}` : (i.message || '');
      }).filter(Boolean);
      if (lines.length) friendlyMessage = `${data?.message || 'Validation failed'} - ${lines.join('; ')}`;
    }
    console.error("[api] response error:", status, data);
    error.normalizedMessage = friendlyMessage;
    return Promise.reject(error);
  }
);

let accessToken: string | null = null;

export const getAccessToken = (): string | null => accessToken;

export const authAPI = {
  register: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    try { const res = await api.post('/api/auth/register', userData); return res.data; } 
    catch (err: any) { return { success: false, data: null as unknown as User, message: err.response?.data?.message || 'Registration failed' }; }
  },

  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token?: string; accessToken?: string; refreshToken?: string }>> => {
    try {
      // Backend loginValidation typically expects only email and password
      const { email, password } = credentials as any;
      const res = await api.post('/api/auth/login', { email, password });
      // Normalize various backend shapes → { success, data: { user, token, refreshToken } }
      const top = res?.data ?? {};
      const envelope = typeof top === 'object' && top !== null && 'data' in top ? (top as any).data : top;
      const user: User | undefined = envelope?.user || envelope?.data?.user || envelope?.profile || envelope?.userInfo || undefined;
      const rawToken = envelope?.token ?? envelope?.accessToken ?? envelope?.data?.token ?? envelope?.data?.accessToken;
      const refreshToken = envelope?.refreshToken ?? envelope?.data?.refreshToken;
      const token = rawToken;

      // Guard against undefined/null strings and sync cookies safely
      if (token && token !== 'undefined' && token !== 'null') {
        accessToken = token;
        Cookies.set('token', token, { expires: 7 });
      }
      if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
        Cookies.set('refreshToken', refreshToken, { expires: 7 });
        // If token was missing but refreshToken present, keep app working by syncing
        if (!token) Cookies.set('token', refreshToken, { expires: 7 });
      }
      // Always return a consistent ApiResponse shape
      return {
        success: !!user,
        data: { user: (user as User), token, accessToken: token, refreshToken } as any,
        message: top?.message || 'Login successful'
      };
    } catch (err: any) {
      return { success: false, data: null as unknown as { user: User; token: string }, message: err.response?.data?.message || 'Login failed' };
    }
  },

  logout: async (): Promise<ApiResponse<null>> => {
    try { const res = await api.post('/api/auth/logout'); accessToken = null; Cookies.remove('token'); Cookies.remove('refreshToken'); return res.data; } 
    catch (err: any) { return { success: false, data: null as unknown as null, message: err.response?.data?.message || 'Logout failed' }; }
  },

  refreshToken: async (): Promise<ApiResponse<{ accessToken: string }>> => {
    try { 
      const res = await api.post('/api/auth/refresh-token'); 
      const { accessToken: newToken } = res.data.data; 
      accessToken = newToken; 
      Cookies.set('token', newToken, { expires: 7 }); 
      return res.data; 
    } 
    catch (err: any) { return { success: false, data: null as unknown as { accessToken: string }, message: err.response?.data?.message || 'Token refresh failed' }; }
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    try { const res = await api.get('/api/auth/profile'); return res.data; } 
    catch (err: any) { return { success: false, data: null as unknown as User, message: err.response?.data?.message || 'Profile fetch failed' }; }
  },

  updateProfile: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      // শুধুমাত্র অনুমোদিত ফিল্ডগুলো পাঠানো হবে
      const allowedFields = ["phone", "dateOfBirth", "gender", "bloodGroup", "address", "emergencyContact", "profilePicture"];
      const updates: any = {};
      Object.keys(userData).forEach(key => { if (allowedFields.includes(key)) updates[key] = (userData as any)[key]; });

      const res = await api.put('/api/auth/profile', updates);
      if (res.data.success) Cookies.set('user', JSON.stringify(res.data.data), { expires: 7 });
      return res.data;
    } catch (err: any) { return { success: false, data: null as unknown as User, message: err.response?.data?.message || 'Profile update failed' }; }
  },

  uploadAvatar: async (file: File): Promise<ApiResponse<{ profilePicture: string }>> => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await api.post('/api/auth/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success && res.data.data?.profilePicture) {
        // আপডেট করা প্রোফাইল ছবি কুকিতে সংরক্ষণ
        const user = JSON.parse(Cookies.get('user') || '{}');
        user.profilePicture = res.data.data.profilePicture;
        Cookies.set('user', JSON.stringify(user), { expires: 7 });
      }
      return res.data;
    } catch (err: any) {
      return { success: false, data: null as unknown as { profilePicture: string }, message: err.response?.data?.message || 'Avatar upload failed' };
    }
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<null>> => {
    try { const res = await api.put('/api/auth/change-password', data); return res.data; } 
    catch (err: any) { return { success: false, data: null as unknown as null, message: err.response?.data?.message || 'Password change failed' }; }
  },

  forgotPassword: async (email: string): Promise<ApiResponse<{ message: string }>> => {
    try { const res = await api.post('/api/auth/forgot-password', { email }); return res.data; } 
    catch (err: any) { return { success: false, data: null as unknown as { message: string }, message: err.response?.data?.message || 'Forgot password failed' }; }
  },
};
