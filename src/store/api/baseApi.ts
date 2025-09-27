import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import Cookies from 'js-cookie';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      let token = state.auth.token;
      
      // Fallback to cookies if Redux state doesn't have token
      if (!token || token === 'undefined' || token === 'null') {
        const cookieToken = Cookies.get('token');
        const refreshToken = Cookies.get('refreshToken');
        
        if (cookieToken && cookieToken !== 'undefined' && cookieToken !== 'null') {
          token = cookieToken;
        } else if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
          token = refreshToken;
          Cookies.set('token', refreshToken, { expires: 7 });
        }
        // Final fallback to localStorage for SPA reload resilience
        if (!token) {
          const lsToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          if (lsToken && lsToken !== 'undefined' && lsToken !== 'null') token = lsToken;
        }
      }
      
      if (token && token !== 'undefined' && token !== 'null') {
        headers.set('authorization', `Bearer ${token}`);
      }
      // Do NOT set Content-Type here globally. For JSON requests,
      // fetchBaseQuery will set it when needed. For FormData (file uploads),
      // letting the browser set the multipart boundary is required.
      return headers;
    },
  }),
  tagTypes: [
    'User', 'Student', 'Teacher', 'Parent', 'Admin',
    'Class', 'Subject', 'Section', 'Assignment', 'Submission', 'Attendance', 
    'Fee', 'Notice', 'Message', 'Exam', 'Result', 'Payment',
    'Library', 'Book', 'BorrowRecord', 'LibraryMember', 'Transport', 'Route', 'Vehicle',
    'Academic', 'Timetable', 'Grade', 'Report', 'Enrollment', 'ReportCard',
    'Settings', 'UserPreferences', 'SystemHealth', 'SystemLogs'
  ],
  endpoints: () => ({}),
});
