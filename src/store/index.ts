import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import { transportApi } from './api/transportApi';
import authReducer from './slices/authSlice';
import academicReducer from './slices/academicSlice';
import attendanceReducer from './slices/attendanceSlice';
import examReducer from './slices/examSlice';
import noticeReducer from './slices/noticeSlice';
import feeReducer from './slices/feeSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    // assignmentApi is injected into baseApi, so no separate reducer entry is needed
    // noticeApi is injected into baseApi, so no separate reducer entry is needed
    // examApi is injected into baseApi, so no separate reducer entry is needed
    // libraryApi is injected into baseApi, so no separate reducer entry is needed
    // settingsApi is injected into baseApi, so no separate reducer entry is needed
    [transportApi.reducerPath]: transportApi.reducer,
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
    }).concat(
      baseApi.middleware,
      // assignmentApi shares baseApi instance; do not add its middleware separately
      // noticeApi shares baseApi instance; do not add its middleware separately
      // examApi shares baseApi instance; do not add its middleware separately
      // libraryApi shares baseApi instance; do not add its middleware separately
      // settingsApi shares baseApi instance; do not add its middleware separately
      transportApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

