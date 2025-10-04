import { baseApi } from './baseApi';

export interface Exam {
  _id: string;
  title: string;
  subject: string;
  class: string;
  section: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  instructions?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Result {
  _id: string;
  exam: string | Exam;
  student: string;
  marksObtained: number;
  grade: string;
  percentage: number;
  status: 'pass' | 'fail' | 'absent';
  remarks?: string;
  submittedBy: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportCard {
  _id: string;
  student: string;
  class: string;
  section: string;
  term: string;
  academicYear: string;
  subjects: {
    subject: string;
    totalMarks: number;
    obtainedMarks: number;
    grade: string;
    percentage: number;
  }[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  overallGrade: string;
  rank: number;
  attendance: {
    totalDays: number;
    presentDays: number;
    percentage: number;
  };
  remarks?: string;
  generatedAt: string;
}

export interface CreateExamRequest {
  title: string;
  subject: string;
  class: string;
  section: string;
  date: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passingMarks: number;
  instructions?: string;
}

export interface SubmitResultRequest {
  examId: string;
  studentId: string;
  marksObtained: number;
  remarks?: string;
}

export interface ExamAnalytics {
  totalStudents: number;
  appeared: number;
  passed: number;
  failed: number;
  absent: number;
  averageMarks: number;
  highestMarks: number;
  lowestMarks: number;
  passPercentage: number;
  gradeDistribution: {
    grade: string;
    count: number;
    percentage: number;
  }[];
}

export interface ClassPerformance {
  classId: string;
  className: string;
  section: string;
  totalStudents: number;
  averageMarks: number;
  passPercentage: number;
  topPerformers: {
    studentId: string;
    studentName: string;
    marksObtained: number;
    percentage: number;
  }[];
}

export const examApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Exam management
    createExam: builder.mutation<Exam, CreateExamRequest>({
      query: (examData) => ({
        url: '/api/exams',
        method: 'POST',
        body: examData,
      }),
      invalidatesTags: ['Exam'],
    }),

    getExams: builder.query<Exam[], { classId?: string; subjectId?: string; isActive?: boolean }>({
      query: (params) => ({
        url: '/api/exams',
        params,
      }),
      providesTags: ['Exam'],
    }),

    getExamById: builder.query<Exam, string>({
      query: (id) => `/api/exams/${id}`,
      providesTags: ['Exam'],
    }),

    updateExam: builder.mutation<Exam, { id: string; data: Partial<CreateExamRequest> }>({
      query: ({ id, data }) => ({
        url: `/api/exams/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Exam'],
    }),

    deleteExam: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/exams/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Exam'],
    }),

    // Result management - POST /results
    submitResult: builder.mutation<Result, SubmitResultRequest>({
      query: (resultData) => ({
        url: '/api/exams/results',
        method: 'POST',
        body: resultData,
      }),
      invalidatesTags: ['Result'],
    }),

    // GET /:examId/results - Get exam results
    getExamResults: builder.query<Result[], string>({
      query: (examId) => `/api/exams/${examId}/results`,
      providesTags: ['Result'],
    }),

    // GET /students/me/results - Get own results (student/parent)
    getMyResults: builder.query<Result[], { startDate?: string; endDate?: string } | void>({
      query: (params) => ({
        url: '/api/exams/students/me/results',
        params: params || {},
      }),
      providesTags: ['Result'],
    }),

    // GET /students/:studentId/results - Get student results
    getStudentResults: builder.query<Result[], string>({
      query: (studentId) => `/api/exams/students/${studentId}/results`,
      providesTags: ['Result'],
    }),

    // GET /results - Get all results (for teachers/admin)
    getResults: builder.query<Result[], { classId?: string; subjectId?: string; examId?: string }>({
      query: (params) => ({
        url: '/api/exams/results',
        params,
      }),
      providesTags: ['Result'],
    }),

    // Update result
    updateResult: builder.mutation<Result, { id: string; data: Partial<SubmitResultRequest> }>({
      query: ({ id, data }) => ({
        url: `/api/exams/results/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Result'],
    }),

    // POST /report-card - Generate report card
    generateReportCard: builder.mutation<ReportCard, { studentId: string; term: string; academicYear: string }>({
      query: (data) => ({
        url: '/api/exams/report-card',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ReportCard'],
    }),

    // Get report cards
    getReportCards: builder.query<ReportCard[], { studentId?: string; classId?: string; term?: string }>({
      query: (params) => ({
        url: '/api/exams/report-cards',
        params,
      }),
      providesTags: ['ReportCard'],
    }),

    getReportCardById: builder.query<ReportCard, string>({
      query: (id) => `/api/exams/report-cards/${id}`,
      providesTags: ['ReportCard'],
    }),

    // Analytics and reports
    getExamAnalytics: builder.query<ExamAnalytics, string>({
      query: (examId) => `/api/exams/${examId}/analytics`,
      providesTags: ['Result'],
    }),

    getClassPerformance: builder.query<ClassPerformance, { classId: string; examId: string }>({
      query: ({ classId, examId }) => `/api/exams/analytics/class/${classId}/exam/${examId}`,
      providesTags: ['Result'],
    }),
  }),
});

export const {
  useCreateExamMutation,
  useGetExamsQuery,
  useGetExamByIdQuery,
  useUpdateExamMutation,
  useDeleteExamMutation,
  useSubmitResultMutation,
  useGetExamResultsQuery,
  useGetMyResultsQuery,
  useGetStudentResultsQuery,
  useGetResultsQuery,
  useUpdateResultMutation,
  useGenerateReportCardMutation,
  useGetReportCardsQuery,
  useGetReportCardByIdQuery,
  useGetExamAnalyticsQuery,
  useGetClassPerformanceQuery,
} = examApi;
