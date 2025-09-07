import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import academicReducer from './slices/academicSlice';
import attendanceReducer from './slices/attendanceSlice';
import examReducer from './slices/examSlice';
import noticeReducer from './slices/noticeSlice';
import feeReducer from './slices/feeSlice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    user: userReducer,
    academic: academicReducer,
    attendance: attendanceReducer,
    exam: examReducer,
    notice: noticeReducer,
    fee: feeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
