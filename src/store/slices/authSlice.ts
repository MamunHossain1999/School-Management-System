/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import type { AuthState, User, LoginCredentials } from '../../types';
import { authAPI } from '../../services/api';

const getUserFromCookies = (): User | null => {
  try {
    const userCookie = Cookies.get('user');
    return userCookie ? JSON.parse(userCookie) : null;
  } catch {
    return null;
  }
};

const getTokenFromCookies = (): string | null => {
  const token = Cookies.get('token');
  const refreshToken = Cookies.get('refreshToken');

  console.log('🔍 AuthSlice - Token cookie:', token);
  console.log('🔍 AuthSlice - Refresh token cookie:', refreshToken);

  if (token && token !== 'undefined' && token !== 'null') {
    console.log('✅ Using token cookie');
    return token;
  }

  if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
    console.log('🔄 Using refresh token cookie as token');
    Cookies.set('token', refreshToken, { expires: 7 });
    return refreshToken;
  }

  console.log('❌ No valid token found in cookies');
  return null;
};

const initialState: AuthState = {
  user: getUserFromCookies(),
  token: getTokenFromCookies(),
  refreshToken: Cookies.get('refreshToken') || null,
  isAuthenticated: !!getTokenFromCookies() && !!getUserFromCookies(),
  isLoading: false,
  error: null,
};

// ✅ Login Thunk
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux loginUser thunk called with:', credentials);
      const response = await authAPI.login(credentials);
      console.log('📡 API response received:', response);

      if (response.success) {
        // ⚡️ এখানে পরিবর্তন করলাম
        const { user, accessToken, refreshToken } = response.data as any;

        // Save to cookies
        if (accessToken) {
          Cookies.set('token', accessToken, { expires: 7 });
        }
        if (refreshToken) {
          Cookies.set('refreshToken', refreshToken, { expires: 7 });
        }
        Cookies.set('user', JSON.stringify(user), { expires: 7 });

        console.log('🍪 Cookies set successfully');
        console.log('✅ Returning data to Redux:', { user, accessToken, refreshToken });

        return { user, token: accessToken, refreshToken };
      }

      console.log('❌ Login failed, rejecting with:', response.message);
      return rejectWithValue(response.message);
    } catch (error: any) {
      console.error('💥 Login thunk error:', error);
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      Cookies.remove('token');
      Cookies.remove('refreshToken');
      Cookies.remove('user');
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        return rejectWithValue('No token found');
      }
      const response = await (authAPI as any).verifyToken(token);
      if (response.success) {
        return response.data;
      }
      Cookies.remove('token');
      Cookies.remove('user');
      return rejectWithValue(response.message);
    } catch (error: any) {
      Cookies.remove('token');
      Cookies.remove('user');
      return rejectWithValue(error.message || 'Token verification failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      Cookies.remove('token');
      Cookies.remove('refreshToken');
      Cookies.remove('user');
    },
    initializeAuth: (state) => {
      const user = getUserFromCookies();
      const token = getTokenFromCookies();

      if (user && token) {
        state.user = user;
        state.token = token;
        state.isAuthenticated = true;
        console.log('🔄 Auth state initialized from cookies:', { user: user.email, hasToken: !!token });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('🎯 Redux loginUser.fulfilled payload:', action.payload);

        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken || null;
        state.isAuthenticated = true;
        state.error = null;

        console.log('🔄 Redux state updated:', {
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        });

        console.log('🍪 Token cookie:', Cookies.get('token'));
        console.log('🍪 User cookie:', Cookies.get('user'));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Verify Token
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser, clearAuth, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
