import { baseApi } from './baseApi';
import type { Attendance, ApiResponse } from '../../types';

export interface AttendanceRecord {
  _id: string;
  student: string;
  class: string;
  section: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  markedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
}

export interface MarkAttendanceRequest {
  classId: string;
  sectionId: string;
  date: string;
  attendance: {
    studentId: string;
    status: 'present' | 'absent' | 'late' | 'excused';
  }[];
}

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all attendance or filter by date/class/student
    getAttendance: builder.query<Attendance[], { date?: string; classId?: string; studentId?: string } | void>({
      query: (filters) => ({
        url: '/api/attendance',
        params: filters || {},
      }),
      transformResponse: (response: ApiResponse<Attendance[]>) => response.data,
      providesTags: ['Attendance'],
    }),

    // Mark attendance for a class
    markAttendance: builder.mutation<AttendanceRecord[], MarkAttendanceRequest>({
      query: (attendanceData) => ({
        url: '/api/attendance/mark',
        method: 'POST',
        body: attendanceData,
      }),
      transformResponse: (response: ApiResponse<AttendanceRecord[]>) => response.data,
      invalidatesTags: ['Attendance'],
    }),

    // Get student attendance summary
    getStudentAttendance: builder.query<AttendanceRecord[], { studentId: string; startDate?: string; endDate?: string }>({
      query: ({ studentId, startDate, endDate }) => ({
        url: `/api/attendance/student/${studentId}`,
        params: { startDate, endDate },
      }),
      transformResponse: (response: ApiResponse<AttendanceRecord[]>) => response.data,
      providesTags: ['Attendance'],
    }),

    // Get attendance summary for a student
    getAttendanceSummary: builder.query<AttendanceSummary, { studentId: string; startDate?: string; endDate?: string }>({
      query: ({ studentId, startDate, endDate }) => ({
        url: `/api/attendance/student/${studentId}/summary`,
        params: { startDate, endDate },
      }),
      transformResponse: (response: ApiResponse<AttendanceSummary>) => response.data,
      providesTags: ['Attendance'],
    }),

    // Get class attendance for a specific date
    getClassAttendance: builder.query<AttendanceRecord[], { classId: string; sectionId: string; date: string }>({
      query: ({ classId, sectionId, date }) => ({
        url: `/api/attendance/class/${classId}/section/${sectionId}`,
        params: { date },
      }),
      transformResponse: (response: ApiResponse<AttendanceRecord[]>) => response.data,
      providesTags: ['Attendance'],
    }),

    // Update individual attendance record
    updateAttendance: builder.mutation<AttendanceRecord, { id: string; status: 'present' | 'absent' | 'late' }>({
      query: ({ id, status }) => ({
        url: `/api/attendance/${id}`,
        method: 'PUT',
        body: { status },
      }),
      transformResponse: (response: ApiResponse<AttendanceRecord>) => response.data,
      invalidatesTags: ['Attendance'],
    }),
  }),
});

export const {
  useGetAttendanceQuery,
  useMarkAttendanceMutation,
  useGetStudentAttendanceQuery,
  useGetAttendanceSummaryQuery,
  useGetClassAttendanceQuery,
  useUpdateAttendanceMutation,
} = attendanceApi;
