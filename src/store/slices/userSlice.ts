/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';
import Cookies from 'js-cookie';

export interface UserState {
  users: User[];
  students: User[];
  teachers: User[];
  parents: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  students: [],
  teachers: [],
  parents: [],
  isLoading: false,
  error: null,
};

// Fetch all users
export const fetchUsers = createAsyncThunk<User[], void, { rejectValue: string }>(
  'user/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      // Use token with fallback to refreshToken and synchronize if needed
      let token = Cookies.get('token');
      const refreshToken = Cookies.get('refreshToken');
      if (!token || token === 'undefined' || token === 'null') {
        if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
          token = refreshToken;
          Cookies.set('token', refreshToken, { expires: 7 });
        }
      }
      const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const res = await fetch(`${base}/api/users`, {
        headers: {
          'Authorization': token && token !== 'undefined' && token !== 'null' ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Failed to fetch users');
      }
      const data = await res.json();
      // Normalize various possible response shapes to an array
      let users: User[] = [];
      if (Array.isArray(data)) {
        users = data as User[];
      } else if (Array.isArray(data?.data)) {
        users = data.data as User[];
      } else if (Array.isArray(data?.data?.users)) {
        users = data.data.users as User[];
      } else if (Array.isArray(data?.users)) {
        users = data.users as User[];
      } else {
        users = [];
      }
      return users;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to fetch users');
    }
  }
);

// Delete a user
export const deleteUser = createAsyncThunk<string, string, { rejectValue: string }>(
  'user/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      let token = Cookies.get('token');
      const refreshToken = Cookies.get('refreshToken');
      if (!token || token === 'undefined' || token === 'null') {
        if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
          token = refreshToken;
          Cookies.set('token', refreshToken, { expires: 7 });
        }
      }
      const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const res = await fetch(`${base}/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token && token !== 'undefined' && token !== 'null' ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Failed to delete user');
      }
      return id;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to delete user');
    }
  }
);

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = Array.isArray(action.payload) ? action.payload : [];
      const list = Array.isArray(state.users) ? state.users : [];
      state.students = list.filter(u => u.role === 'student');
      state.teachers = list.filter(u => u.role === 'teacher');
      state.parents = list.filter(u => u.role === 'parent');
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = Array.isArray(action.payload) ? action.payload : [];
        const list = Array.isArray(state.users) ? state.users : [];
        state.students = list.filter(u => u.role === 'student');
        state.teachers = list.filter(u => u.role === 'teacher');
        state.parents = list.filter(u => u.role === 'parent');
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch users';
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        const id = action.payload;
        const current = Array.isArray(state.users) ? state.users : [];
        state.users = current.filter(u => (u._id || (u as any).id) !== id);
        const list = Array.isArray(state.users) ? state.users : [];
        state.students = list.filter(u => u.role === 'student');
        state.teachers = list.filter(u => u.role === 'teacher');
        state.parents = list.filter(u => u.role === 'parent');
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete user';
      });
  },
});

export const { setUsers, clearError } = slice.actions;
export default slice.reducer;
