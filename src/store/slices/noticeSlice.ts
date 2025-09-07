/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Notice } from '../../types';
import { noticeAPI } from '../../services/api';

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

export const fetchNotices = createAsyncThunk(
  'notice/fetchNotices',
  async (userRole: string | undefined, { rejectWithValue }) => {
    try {
      const response = await noticeAPI.getNotices(userRole);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notices');
    }
  }
);

export const createNotice = createAsyncThunk(
  'notice/createNotice',
  async (noticeData: Partial<Notice>, { rejectWithValue }) => {
    try {
      const response = await noticeAPI.createNotice(noticeData);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
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
      .addCase(createNotice.fulfilled, (state, action) => {
        state.notices.unshift(action.payload);
      });
  },
});

export const { clearError, clearNotices } = noticeSlice.actions;
export default noticeSlice.reducer;
