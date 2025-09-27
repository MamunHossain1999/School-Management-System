import { baseApi } from './baseApi';

// System settings interface
export interface SystemSettings {
  _id: string;
  schoolName: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  schoolWebsite?: string;
  schoolLogo?: string;
  establishedYear: number;
  principalName: string;
  principalSignature?: string;
  
  // Academic settings
  academicYear: string;
  currentSession: string;
  sessionStartDate: string;
  sessionEndDate: string;
  
  // Time settings
  schoolStartTime: string;
  schoolEndTime: string;
  periodDuration: number; // in minutes
  breakDuration: number; // in minutes
  lunchDuration: number; // in minutes
  
  // Attendance settings
  attendanceGracePeriod: number; // in minutes
  lateMarkThreshold: number; // in minutes
  absentMarkThreshold: number; // in minutes
  minimumAttendancePercentage: number;
  
  // Exam settings
  passingMarks: number;
  maxMarks: number;
  gradeScale: GradeScale[];
  
  // Fee settings
  currency: string;
  currencySymbol: string;
  lateFeePercentage: number;
  feeReminderDays: number[];
  
  // Notification settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notificationRetentionDays: number;
  
  // Security settings
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  
  // System settings
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  dataRetentionYears: number;
  
  // UI settings
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  
  // Integration settings
  googleClassroomEnabled: boolean;
  microsoftTeamsEnabled: boolean;
  zoomEnabled: boolean;
  
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

// Grade scale interface
export interface GradeScale {
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  points: number;
  description: string;
}

// Settings update request
export type UpdateSettingsRequest = Partial<Omit<SystemSettings, '_id' | 'createdAt' | 'updatedAt' | 'updatedBy'>>;

// Settings categories for easier management
export interface SettingsCategory {
  id: string;
  name: string;
  description: string;
  settings: string[];
}

// User preferences interface
export interface UserPreferences {
  _id: string;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  emailNotifications: boolean;
  pushNotifications: boolean;
  dashboardLayout: string[];
  itemsPerPage: number;
  autoSave: boolean;
  createdAt: string;
  updatedAt: string;
}

// User preferences update request
export type UpdateUserPreferencesRequest = Partial<Omit<UserPreferences, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>;

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/settings - Get system settings
    getSystemSettings: builder.query<SystemSettings, void>({
      query: () => '/api/settings',
      providesTags: ['Settings'],
    }),

    // PUT /api/settings - Update system settings (Admin only)
    updateSystemSettings: builder.mutation<SystemSettings, UpdateSettingsRequest>({
      query: (settingsData) => ({
        url: '/api/settings',
        method: 'PUT',
        body: settingsData,
      }),
      invalidatesTags: ['Settings'],
    }),

    // GET /api/settings/categories - Get settings categories
    getSettingsCategories: builder.query<SettingsCategory[], void>({
      query: () => '/api/settings/categories',
      providesTags: ['Settings'],
    }),

    // GET /api/settings/backup - Download system backup (Admin only)
    downloadBackup: builder.mutation<Blob, void>({
      query: () => ({
        url: '/api/settings/backup',
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),

    // POST /api/settings/restore - Restore system from backup (Admin only)
    restoreFromBackup: builder.mutation<{ success: boolean; message: string }, FormData>({
      query: (formData) => ({
        url: '/api/settings/restore',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Settings'],
    }),

    // POST /api/settings/reset - Reset settings to default (Admin only)
    resetToDefaults: builder.mutation<SystemSettings, { category?: string }>({
      query: (data) => ({
        url: '/api/settings/reset',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),

    // User preferences endpoints
    // GET /api/settings/preferences - Get user preferences
    getUserPreferences: builder.query<UserPreferences, void>({
      query: () => '/api/settings/preferences',
      providesTags: ['UserPreferences'],
    }),

    // PUT /api/settings/preferences - Update user preferences
    updateUserPreferences: builder.mutation<UserPreferences, UpdateUserPreferencesRequest>({
      query: (preferencesData) => ({
        url: '/api/settings/preferences',
        method: 'PUT',
        body: preferencesData,
      }),
      invalidatesTags: ['UserPreferences'],
    }),

    // DELETE /api/settings/preferences - Reset user preferences to default
    resetUserPreferences: builder.mutation<UserPreferences, void>({
      query: () => ({
        url: '/api/settings/preferences',
        method: 'DELETE',
      }),
      invalidatesTags: ['UserPreferences'],
    }),

    // System health and diagnostics
    // GET /api/settings/health - Get system health status
    getSystemHealth: builder.query<{
      status: 'healthy' | 'warning' | 'critical';
      database: 'connected' | 'disconnected';
      storage: { used: number; total: number; percentage: number };
      memory: { used: number; total: number; percentage: number };
      uptime: number;
      version: string;
      lastBackup: string;
    }, void>({
      query: () => '/api/settings/health',
      providesTags: ['SystemHealth'],
    }),

    // POST /api/settings/test-email - Test email configuration
    testEmailConfiguration: builder.mutation<{ success: boolean; message: string }, { email: string }>({
      query: (data) => ({
        url: '/api/settings/test-email',
        method: 'POST',
        body: data,
      }),
    }),

    // POST /api/settings/test-sms - Test SMS configuration
    testSmsConfiguration: builder.mutation<{ success: boolean; message: string }, { phone: string }>({
      query: (data) => ({
        url: '/api/settings/test-sms',
        method: 'POST',
        body: data,
      }),
    }),

    // GET /api/settings/logs - Get system logs (Admin only)
    getSystemLogs: builder.query<{
      logs: Array<{
        timestamp: string;
        level: 'info' | 'warning' | 'error';
        message: string;
        user?: string;
        action?: string;
      }>;
      totalCount: number;
    }, { page?: number; limit?: number; level?: string }>({
      query: (params) => ({
        url: '/api/settings/logs',
        params,
      }),
      providesTags: ['SystemLogs'],
    }),
  }),
});

export const {
  useGetSystemSettingsQuery,
  useUpdateSystemSettingsMutation,
  useGetSettingsCategoriesQuery,
  useDownloadBackupMutation,
  useRestoreFromBackupMutation,
  useResetToDefaultsMutation,
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
  useResetUserPreferencesMutation,
  useGetSystemHealthQuery,
  useTestEmailConfigurationMutation,
  useTestSmsConfigurationMutation,
  useGetSystemLogsQuery,
} = settingsApi;
