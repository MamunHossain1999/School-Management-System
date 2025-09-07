/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, type PayloadAction,  } from '@reduxjs/toolkit';

import { userAPI } from '../../services/api';
import type { Admin, Parent, Student, Teacher, User } from '../../types';

interface UserState {
  users: User[];
  students: Student[];
  teachers: Teacher[];
  parents: Parent[];
  admins: Admin[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  students: [],
  teachers: [],
  parents: [],
  admins: [],
  currentUser: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (role: string | undefined, { rejectWithValue }) => {
    try {
      const response = await userAPI.getUsers(role);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch users');
    }
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await userAPI.createUser(userData);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, userData }: { id: string; userData: Partial<User> }, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateUser(id, userData);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await userAPI.deleteUser(id);
      if (response.success) {
        return id;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete user');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    clearUsers: (state) => {
      state.users = [];
      state.students = [];
      state.teachers = [];
      state.parents = [];
      state.admins = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
        
        // Separate users by role
        state.students = action.payload.filter((user: User) => user.role === 'student') as Student[];
        state.teachers = action.payload.filter((user: User) => user.role === 'teacher') as Teacher[];
        state.parents = action.payload.filter((user: User) => user.role === 'parent') as Parent[];
        state.admins = action.payload.filter((user: User) => user.role === 'admin') as Admin[];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create User
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.push(action.payload);
        
        // Add to appropriate role array
        switch (action.payload.role) {
          case 'student':
            state.students.push(action.payload as Student);
            break;
          case 'teacher':
            state.teachers.push(action.payload as Teacher);
            break;
          case 'parent':
            state.parents.push(action.payload as Parent);
            break;
          case 'admin':
            state.admins.push(action.payload as Admin);
            break;
        }
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        
        // Update in role-specific arrays
        const updateRoleArray = (array: any[], payload: any) => {
          const roleIndex = array.findIndex(item => item.id === payload.id);
          if (roleIndex !== -1) {
            array[roleIndex] = payload;
          }
        };
        
        switch (action.payload.role) {
          case 'student':
            updateRoleArray(state.students, action.payload);
            break;
          case 'teacher':
            updateRoleArray(state.teachers, action.payload);
            break;
          case 'parent':
            updateRoleArray(state.parents, action.payload);
            break;
          case 'admin':
            updateRoleArray(state.admins, action.payload);
            break;
        }
      })
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        const userId = action.payload;
        state.users = state.users.filter(user => user.id !== userId);
        state.students = state.students.filter(student => student.id !== userId);
        state.teachers = state.teachers.filter(teacher => teacher.id !== userId);
        state.parents = state.parents.filter(parent => parent.id !== userId);
        state.admins = state.admins.filter(admin => admin.id !== userId);
      });
  },
});

export const { clearError, setCurrentUser, clearUsers } = userSlice.actions;
export default userSlice.reducer;
