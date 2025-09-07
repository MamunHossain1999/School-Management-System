import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BASE_URL || 'http://localhost:5000',
  timeout: 10000,
  prepareHeaders: (headers) => {
    const token = Cookies.get('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Base query with error handling
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    Cookies.remove('token');
    Cookies.remove('user');
    window.location.href = '/login';
  }
  
  return result;
};

// Create the base API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Class', 'Subject', 'Assignment', 'Attendance', 'Exam', 'Result', 'Fee', 'Notice'],
  endpoints: () => ({}),
});
