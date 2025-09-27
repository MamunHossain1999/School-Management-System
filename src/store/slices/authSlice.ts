/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthState, LoginCredentials, UpdateProfileData, ChangePasswordData } from '../../types';
import { authAPI } from '../../services/api';
import Cookies from 'js-cookie';

// --- Initial State ---
// Normalize cookie values to avoid treating the strings 'undefined'/'null' as valid
const normalizeCookie = (v?: string | null) => {
  if (!v || v === 'undefined' || v === 'null') return null;
  return v;
};

const rawUser = Cookies.get('user') || (typeof window !== 'undefined' ? localStorage.getItem('user') : null);
const rawToken = Cookies.get('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
const rawRefresh = Cookies.get('refreshToken') || (typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null);

const cookieUser = rawUser && rawUser !== 'undefined' && rawUser !== 'null' ? JSON.parse(rawUser) : null;
const cookieToken = normalizeCookie(rawToken);
const cookieRefresh = normalizeCookie(rawRefresh);

const initialState: AuthState = {
  user: cookieUser,
  token: cookieToken,
  refreshToken: cookieRefresh,
  isAuthenticated: !!cookieToken && !!cookieUser,
  isLoading: false,
  error: null,
};

// --- Slice ---
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      Cookies.set('user', JSON.stringify(action.payload), { expires: 7 });
      if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(action.payload));
    },
    setToken: (state, action: PayloadAction<string>) => {
      const v = action.payload;
      if (!v || v === 'undefined' || v === 'null') {
        state.token = null;
        Cookies.remove('token');
      } else {
        state.token = v;
        Cookies.set('token', v, { expires: 7 });
        if (typeof window !== 'undefined') localStorage.setItem('token', v);
      }
    },
    setRefreshToken: (state, action: PayloadAction<string>) => {
      const v = action.payload;
      if (!v || v === 'undefined' || v === 'null') {
        state.refreshToken = null;
        Cookies.remove('refreshToken');
      } else {
        state.refreshToken = v;
        Cookies.set('refreshToken', v, { expires: 7 });
        if (typeof window !== 'undefined') localStorage.setItem('refreshToken', v);
      }
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      Cookies.remove('user');
      Cookies.remove('token');
      Cookies.remove('refreshToken');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => { state.isLoading = action.payload; },
    setError: (state, action: PayloadAction<string | null>) => { state.error = action.payload; },
    clearError: (state) => { state.error = null; },
  },
});

export const { setUser, setToken, setRefreshToken, clearAuth, setLoading, setError, clearError } = authSlice.actions;
export default authSlice.reducer;

// --- Async Actions without createAsyncThunk ---
export const loginUser = async (credentials: LoginCredentials, dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const response = await authAPI.login(credentials);
    if (response.success) {
      const { user, token, refreshToken } = response.data;
      dispatch(setUser(user));
      if (token) dispatch(setToken(token));
      if (refreshToken) dispatch(setRefreshToken(refreshToken));
    } else {
      dispatch(setError(response.message));
    }
  } catch (err: any) {
    dispatch(setError(err.message || 'Login failed'));
  } finally {
    dispatch(setLoading(false));
  }
};

// --- Initialize Auth State from Cookies ---
// Restores auth state on app start and fixes cases where cookies contain 'undefined'/'null' strings.
export const initializeAuth = () => (dispatch: any) => {
  try {
    const rawToken = Cookies.get('token');
    const rawRefreshToken = Cookies.get('refreshToken');
    const rawUser = Cookies.get('user') || (typeof window !== 'undefined' ? localStorage.getItem('user') : null);

    const normalize = (v?: string | null) => {
      if (!v || v === 'undefined' || v === 'null') return null;
      return v;
    };

    let token = normalize(rawToken);
    let refreshToken = normalize(rawRefreshToken);
    // Fallback from localStorage
    if (!token && typeof window !== 'undefined') token = normalize(localStorage.getItem('token'));
    if (!refreshToken && typeof window !== 'undefined') refreshToken = normalize(localStorage.getItem('refreshToken'));
    const user = rawUser && rawUser !== 'undefined' && rawUser !== 'null' ? JSON.parse(rawUser) : null;

    // Debug logs to trace cookie values
    console.log('Auth initialize:', { token, refreshToken, hasUser: !!user });

    // If token is missing/invalid but refreshToken exists, sync token from refreshToken
    if (!token && refreshToken) {
      Cookies.set('token', refreshToken, { expires: 7 });
      dispatch(setToken(refreshToken));
    } else if (token) {
      dispatch(setToken(token));
    }

    if (refreshToken) {
      dispatch(setRefreshToken(refreshToken));
    }

    if (user) {
      dispatch(setUser(user));
    }
  } catch (e: any) {
    console.warn('Failed to initialize auth from cookies:', e?.message || e);
  }
};

export const registerUser = async (userData: Partial<User>, dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const response = await authAPI.register(userData);
    if (!response.success) dispatch(setError(response.message));
  } catch (err: any) {
    dispatch(setError(err.message || 'Registration failed'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const logoutUser = async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    await authAPI.logout();
    dispatch(clearAuth());
  } catch (err: any) {
    dispatch(setError(err.message || 'Logout failed'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const getProfile = async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const response = await authAPI.getProfile();
    if (response.success) dispatch(setUser(response.data));
    else dispatch(setError(response.message));
  } catch (err: any) {
    dispatch(setError(err.message || 'Failed to fetch profile'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateProfile = async (data: UpdateProfileData, dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const response = await authAPI.updateProfile(data);
    if (response.success) dispatch(setUser(response.data));
    else dispatch(setError(response.message));
  } catch (err: any) {
    dispatch(setError(err.message || 'Failed to update profile'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const uploadAvatar = async (file: File, dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const response = await authAPI.uploadAvatar(file);
    if (response.success && response.data?.profilePicture) {
      const user = Cookies.get('user') ? JSON.parse(Cookies.get('user')!) : {};
      user.profilePicture = response.data.profilePicture;
      dispatch(setUser(user));
    } else {
      dispatch(setError(response.message));
    }
  } catch (err: any) {
    dispatch(setError(err.message || 'Avatar upload failed'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const changePassword = async (data: ChangePasswordData, dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const response = await authAPI.changePassword(data);
    if (!response.success) {
      dispatch(setError(response.message));
      throw new Error(response.message || 'Failed to change password');
    }
    return response;
  } catch (err: any) {
    dispatch(setError(err.message || 'Failed to change password'));
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};
