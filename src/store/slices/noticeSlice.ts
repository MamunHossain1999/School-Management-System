/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Notice } from '../../types';
import Cookies from 'js-cookie';



interface NoticeState {
  notices: Notice[];
  userNotices: Notice[];
  isLoading: boolean;
  error: string | null;
}

const initialState: NoticeState = {
  notices: [],
  userNotices: [],
  isLoading: false,
  error: null,
};

// 🔹 Fetch notices
export const fetchNotices = createAsyncThunk(
  'notice/fetchNotices',
  async (params: { targetAudience?: string; type?: string; isActive?: boolean } = {}, { rejectWithValue }) => {
    try {
      const token = Cookies.get('token');
      const queryParams = new URLSearchParams(params as any).toString();
      const url = `${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}/api/notices${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch notices');
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notices');
    }
  }
);

// 🔹 Create notice
export const createNotice = createAsyncThunk(
  'notice/createNotice',
  async (noticeData: Partial<Notice>, { rejectWithValue }) => {
    try {
      const token = Cookies.get('token');
      const response = await fetch(`${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}/api/notices`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(noticeData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create notice');
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create notice');
    }
  }
);

const noticeSlice = createSlice({
  name: 'notice',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearNotices: (state) => {
      state.notices = [];
      state.userNotices = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Fetch notices
      .addCase(fetchNotices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notices = action.payload;
      })
      .addCase(fetchNotices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // 🔹 Create notice
      .addCase(createNotice.fulfilled, (state, action) => {
        state.notices.unshift(action.payload);
      });
  },
});

export const { clearError, clearNotices } = noticeSlice.actions;
export default noticeSlice.reducer;
