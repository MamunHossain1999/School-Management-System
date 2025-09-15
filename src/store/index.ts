import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import { assignmentApi } from './api/assignmentApi';
import { noticeApi } from './api/noticeApi';
import { userApi } from './api/userApi';
import { libraryApi } from './api/libraryApi';
import { transportApi } from './api/transportApi';
import { examApi } from './api/examApi';
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
    [assignmentApi.reducerPath]: assignmentApi.reducer,
    [noticeApi.reducerPath]: noticeApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [libraryApi.reducerPath]: libraryApi.reducer,
    [transportApi.reducerPath]: transportApi.reducer,
    [examApi.reducerPath]: examApi.reducer,
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
      assignmentApi.middleware,
      noticeApi.middleware,
      userApi.middleware,
      libraryApi.middleware,
      transportApi.middleware,
      examApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
