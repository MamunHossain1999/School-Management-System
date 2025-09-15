/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../api/userApi";
import { userApi } from "../api";


interface UserState {
  users: User[];
  students: User[];
  teachers: User[];
  parents: User[];
  admins: User[];
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

// ✅ Async Thunks
export const fetchUsers = createAsyncThunk<User[], string | undefined, { rejectValue: string }>(
  "user/fetchUsers",
  async (role, { rejectWithValue, dispatch }) => {
    try {
      const params = role ? { role } : {};
      const result = await dispatch(userApi.endpoints.getUsers.initiate(params));
      
      if ('data' in result && result.data) {
        return Array.isArray(result.data) ? result.data : [result.data];
      }
      
      return rejectWithValue("Failed to fetch users");
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch users");
    }
  }
);

export const createUser = createAsyncThunk<User, { firstName: string; lastName: string; email: string; password: string; role: 'admin' | 'teacher' | 'student' | 'parent'; phone?: string; address?: string; dateOfBirth?: string }, { rejectValue: string }>(
  "user/createUser",
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const result = await dispatch(userApi.endpoints.createUser.initiate(userData));
      
      if ('data' in result && result.data) {
        return result.data;
      }
      
      return rejectWithValue("Failed to create user");
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create user");
    }
  }
);

export const updateUser = createAsyncThunk<User, { id: string; userData: { firstName?: string; lastName?: string; email?: string; phone?: string; address?: string; dateOfBirth?: string; profilePicture?: string } }, { rejectValue: string }>(
  "user/updateUser",
  async ({ id, userData }, { rejectWithValue, dispatch }) => {
    try {
      const result = await dispatch(userApi.endpoints.updateUser.initiate({ id, data: userData }));
      
      if ('data' in result && result.data) {
        return result.data;
      }
      
      return rejectWithValue("Failed to update user");
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update user");
    }
  }
);

export const deleteUser = createAsyncThunk<string, string, { rejectValue: string }>(
  "user/deleteUser",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const result = await dispatch(userApi.endpoints.deleteUser.initiate(id));
      
      if ('data' in result || !('error' in result)) {
        return id;
      }
      
      return rejectWithValue("Failed to delete user");
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete user");
    }
  }
);

// ✅ Slice
const userSlice = createSlice({
  name: "user",
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
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;

        // ✅ Payload নিশ্চিতভাবে array
        const usersArray = Array.isArray(action.payload) ? action.payload : [action.payload];

        state.users = usersArray;
        state.students = usersArray.filter((u) => u.role === "student");
        state.teachers = usersArray.filter((u) => u.role === "teacher");
        state.parents = usersArray.filter((u) => u.role === "parent");
        state.admins = usersArray.filter((u) => u.role === "admin");
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.push(action.payload);

        switch (action.payload.role) {
          case "student":
            state.students.push(action.payload);
            break;
          case "teacher":
            state.teachers.push(action.payload);
            break;
          case "parent":
            state.parents.push(action.payload);
            break;
          case "admin":
            state.admins.push(action.payload);
            break;
        }
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) state.users[index] = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        const userId = action.payload;
        state.users = state.users.filter((u) => u._id !== userId);
        state.students = state.students.filter((s) => s._id !== userId);
        state.teachers = state.teachers.filter((t) => t._id !== userId);
        state.parents = state.parents.filter((p) => p._id !== userId);
        state.admins = state.admins.filter((a) => a._id !== userId);
      });
  },
});

export const { clearError, setCurrentUser, clearUsers } = userSlice.actions;
export default userSlice.reducer;
