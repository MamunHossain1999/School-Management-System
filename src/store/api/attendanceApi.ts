import { baseApi } from './baseApi';
import type { Attendance, ApiResponse } from '../../types';

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAttendance: builder.query<Attendance[], { date?: string; classId?: string; studentId?: string }>({
      query: (filters) => ({
        url: '/attendance',
        params: filters,
      }),
      transformResponse: (response: ApiResponse<Attendance[]>) => response.data,
      providesTags: ['Attendance'],
    }),
    
    markAttendance: builder.mutation<Attendance[], Partial<Attendance>[]>({
      query: (attendanceData) => ({
        url: '/attendance/mark',
        method: 'POST',
        body: attendanceData,
      }),
      transformResponse: (response: ApiResponse<Attendance[]>) => response.data,
      invalidatesTags: ['Attendance'],
    }),
  }),
});

export const {
  useGetAttendanceQuery,
  useMarkAttendanceMutation,
} = attendanceApi;
