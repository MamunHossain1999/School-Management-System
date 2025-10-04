/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from './baseApi';

export interface AttendanceRecord {
  _id: string;
  student: {
    _id: string;
    name: string;
    rollNumber: string;
    class: string;
    section: string;
  };
  class: string;
  section: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  markedBy: {
    _id: string;
    name: string;
  };
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendancePercentage: number;
  classAverage?: number;
  monthlyStats?: {
    month: string;
    present: number;
    absent: number;
    late: number;
    excused: number;
    percentage: number;
  }[];
}

export interface ClassAttendanceSummary {
  class: string;
  section: string;
  date: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
  students: AttendanceRecord[];
}

export interface MarkAttendanceRequest {
  classId: string;
  sectionId: string;
  date: string;
  attendance: {
    studentId: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    remarks?: string;
  }[];
}

export interface AttendanceFilters {
  date?: string;
  startDate?: string;
  endDate?: string;
  classId?: string;
  sectionId?: string;
  studentId?: string;
  status?: 'present' | 'absent' | 'late' | 'excused';
}

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /api/attendance/mark - Mark attendance
    markAttendance: builder.mutation<AttendanceRecord[], MarkAttendanceRequest>({
      query: (attendanceData) => ({
        url: '/api/attendance/mark',
        method: 'POST',
        body: attendanceData,
      }),
      invalidatesTags: ['Attendance'],
    }),

    // GET /api/attendance - Get attendance records with filters
    getAttendanceRecords: builder.query<AttendanceRecord[], AttendanceFilters | void>({
      query: (filters) => ({
        url: '/api/attendance',
        params: filters || {},
      }),
      transformResponse: (response: any) => {
        // Normalize to an array regardless of backend envelope
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.records)) return response.records;
        return [] as AttendanceRecord[];
      },
      providesTags: ['Attendance'],
    }),

    // GET /api/attendance/student/:studentId - Get student attendance
    getStudentAttendance: builder.query<AttendanceRecord[], { studentId: string; startDate?: string; endDate?: string }>({
      query: ({ studentId, startDate, endDate }) => ({
        url: `/api/attendance/student/${studentId}`,
        params: { startDate, endDate },
      }),
      providesTags: ['Attendance'],
    }),

    // GET /api/attendance/summary - Get class attendance summary
    getAttendanceSummary: builder.query<ClassAttendanceSummary[], { 
      classId?: string; 
      sectionId?: string; 
      date?: string; 
      startDate?: string; 
      endDate?: string; 
    } | void>({
      query: (params) => ({
        url: '/api/attendance/summary',
        params: params || {},
      }),
      transformResponse: (response: any) => {
        // Normalize to an array regardless of backend envelope
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.summary)) return response.summary;
        return [] as ClassAttendanceSummary[];
      },
      providesTags: ['Attendance'],
    }),

    // GET /api/attendance/me - Get own attendance (student/parent)
    getMyAttendance: builder.query<{
      records: AttendanceRecord[];
      summary: AttendanceSummary;
    }, { startDate?: string; endDate?: string } | void>({
      query: (params) => ({
        url: '/api/attendance/me',
        params: params || {},
      }),
      providesTags: ['Attendance'],
    }),

    // Additional helper endpoints
    // Get attendance for a specific class and date
    getClassAttendanceByDate: builder.query<AttendanceRecord[], { 
      classId: string; 
      sectionId?: string; 
      date: string; 
    }>({
      query: ({ classId, sectionId, date }) => ({
        url: '/api/attendance',
        params: { classId, sectionId, date },
      }),
      providesTags: ['Attendance'],
    }),

    // Update individual attendance record
    updateAttendanceRecord: builder.mutation<AttendanceRecord, { 
      id: string; 
      status: 'present' | 'absent' | 'late' | 'excused';
      remarks?: string;
    }>({
      query: ({ id, ...updateData }) => ({
        url: `/api/attendance/${id}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: ['Attendance'],
    }),

    // Delete attendance record
    deleteAttendanceRecord: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/attendance/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Attendance'],
    }),

    // Get attendance statistics for dashboard
    // Some backends may not expose /api/attendance/stats. We'll reuse /api/attendance/summary
    // and transform it into the stats shape expected by the UI to avoid 404 errors.
    getAttendanceStats: builder.query<{
      totalStudents: number;
      presentToday: number;
      absentToday: number;
      lateToday: number;
      attendanceRate: number;
      weeklyStats: { date: string; present: number; absent: number; late: number; }[];
      classWiseStats: { class: string; section: string; present: number; total: number; percentage: number; }[];
    }, { date?: string } | void>({
      query: (params) => ({
        url: '/api/attendance/summary',
        params: params || {},
      }),
      transformResponse: (response: any) => {
        const data: any[] = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
        const totalStudents = data.reduce((sum, c) => sum + (c.totalStudents || c.total || 0), 0);
        const presentToday = data.reduce((sum, c) => sum + (c.presentCount || c.present || 0), 0);
        const absentToday = data.reduce((sum, c) => sum + (c.absentCount || c.absent || 0), 0);
        const lateToday = data.reduce((sum, c) => sum + (c.lateCount || c.late || 0), 0);
        const avgRate = data.length > 0
          ? (data.reduce((sum, c) => sum + (c.attendancePercentage || c.percentage || 0), 0) / data.length)
          : 0;
        const classWiseStats = data.map((c) => ({
          class: c.class,
          section: c.section,
          present: c.presentCount || c.present || 0,
          total: c.totalStudents || c.total || 0,
          percentage: c.attendancePercentage || c.percentage || 0,
        }));
        return {
          totalStudents,
          presentToday,
          absentToday,
          lateToday,
          attendanceRate: avgRate,
          weeklyStats: [],
          classWiseStats,
        };
      },
      providesTags: ['Attendance'],
    }),
  }),
});

export const {
  useMarkAttendanceMutation,
  useGetAttendanceRecordsQuery,
  useGetStudentAttendanceQuery,
  useGetAttendanceSummaryQuery,
  useGetMyAttendanceQuery,
  useGetClassAttendanceByDateQuery,
  useUpdateAttendanceRecordMutation,
  useDeleteAttendanceRecordMutation,
  useGetAttendanceStatsQuery,
} = attendanceApi;
