import { baseApi } from './baseApi';

// Notice interfaces
export interface Notice {
  _id: string;
  title: string;
  content: string;
  type: 'general' | 'important' | 'event' | 'holiday' | 'exam';
  targetRoles: string[];
  targetClasses?: string[];
  targetSections?: string[];
  priority?: 'low' | 'medium' | 'high';
  isPublished: boolean;
  publishDate: string;
  expiryDate?: string;
  attachments?: string[];
  authorId?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  views?: string[];
  createdAt: string;
  updatedAt: string;
  // Legacy fields for backward compatibility
  targetAudience?: 'all' | 'students' | 'teachers' | 'parents' | 'staff';
  class?: string;
  section?: string;
  isActive?: boolean;
  createdBy?: string;
  viewedBy?: string[];
}

export interface CreateNoticeRequest {
  title: string;
  content: string;
  type: 'general' | 'important' | 'event' | 'holiday' | 'exam';
  targetAudience: 'all' | 'students' | 'teachers' | 'parents' | 'staff';
  class?: string;
  section?: string;
  publishDate: string;
  expiryDate?: string;
  attachments?: string[];
}

export interface UpdateNoticeRequest extends Partial<CreateNoticeRequest> {
  isActive?: boolean;
}

// Message interfaces
export interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  receiver: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  subject: string;
  content: string;
  isRead: boolean;
  sentAt: string;
  readAt?: string;
  attachments?: string[];
  parentMessage?: string; // For reply threading
  replyTo?: string; // ID of the message this is replying to
}

export interface SendMessageRequest {
  receiverId: string;
  subject: string;
  content: string;
  attachments?: string[];
}

export interface ReplyMessageRequest {
  content: string;
  attachments?: string[];
}

export interface MessageFilters {
  search?: string;
  isRead?: boolean;
  sender?: string;
  dateFrom?: string;
  dateTo?: string;
}

// API endpoints
export const communicationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Notice endpoints
    createNotice: builder.mutation<Notice, CreateNoticeRequest>({
      query: (noticeData) => {
        console.log('Creating notice with data:', noticeData);
        return {
          url: '/api/notices',
          method: 'POST',
          body: noticeData,
        };
      },
      transformResponse: (response: any) => {
        console.log('Create notice API response:', response);
        if (response.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: ['Notice'],
    }),

    getNotices: builder.query<Notice[], { 
      targetAudience?: string; 
      type?: string; 
      isActive?: boolean;
      class?: string;
      section?: string;
    }>({
      query: (params) => {
        console.log('Getting notices with params:', params);
        return {
          url: '/api/notices',
          params,
        };
      },
      transformResponse: (response: any) => {
        console.log('Raw Notices API Response:', response);
        
        // Handle nested response structure
        if (response.data && Array.isArray(response.data.notices)) {
          console.log('Found notices in response.data.notices:', response.data.notices);
          return response.data.notices;
        }
        
        // Handle direct array in data
        if (response.data && Array.isArray(response.data)) {
          console.log('Found notices in response.data (array):', response.data);
          return response.data;
        }
        
        // Handle direct array response
        if (Array.isArray(response)) {
          console.log('Found notices in response (direct array):', response);
          return response;
        }
        
        console.log('No notices found, returning empty array');
        return [];
      },
      providesTags: ['Notice'],
    }),

    getNoticeById: builder.query<Notice, string>({
      query: (id) => `/api/notices/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Notice', id }],
    }),

    updateNotice: builder.mutation<Notice, { id: string; data: UpdateNoticeRequest }>({
      query: ({ id, data }) => ({
        url: `/api/notices/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Notice', id }, 'Notice'],
    }),

    deleteNotice: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/notices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Notice', id }, 'Notice'],
    }),

    markNoticeAsViewed: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/communication/notices/${id}/view`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Notice', id }, 'Notice'],
    }),

    // Message endpoints
    sendMessage: builder.mutation<Message, SendMessageRequest>({
      query: (messageData) => ({
        url: '/api/communication/messages',
        method: 'POST',
        body: messageData,
      }),
      invalidatesTags: ['Message'],
    }),

    getInboxMessages: builder.query<Message[], MessageFilters>({
      query: (params) => ({
        url: '/api/communication/messages/inbox',
        params,
      }),
      providesTags: ['Message'],
    }),

    getSentMessages: builder.query<Message[], MessageFilters>({
      query: (params) => ({
        url: '/api/communication/messages/sent',
        params,
      }),
      providesTags: ['Message'],
    }),

    getMessageById: builder.query<Message, string>({
      query: (id) => `/api/communication/messages/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Message', id }],
    }),

    markMessageAsRead: builder.mutation<Message, string>({
      query: (id) => ({
        url: `/api/communication/messages/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Message', id }, 'Message'],
    }),

    deleteMessage: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/communication/messages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Message', id }, 'Message'],
    }),

    replyToMessage: builder.mutation<Message, { id: string; data: ReplyMessageRequest }>({
      query: ({ id, data }) => ({
        url: `/api/communication/messages/${id}/reply`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Message'],
    }),

    // Additional utility endpoints
    getUnreadMessageCount: builder.query<{ count: number }, void>({
      query: () => '/api/communication/messages/unread-count',
      providesTags: ['Message'],
    }),

    getNoticeStats: builder.query<{
      total: number;
      active: number;
      inactive: number;
      byType: Record<string, number>;
      recentViews: number;
    }, void>({
      query: () => '/api/communication/notices/stats',
      providesTags: ['Notice'],
    }),

    getMessageStats: builder.query<{
      totalSent: number;
      totalReceived: number;
      unreadCount: number;
      todayCount: number;
    }, void>({
      query: () => '/api/communication/messages/stats',
      providesTags: ['Message'],
    }),

    // Bulk operations
    markMultipleMessagesAsRead: builder.mutation<void, string[]>({
      query: (messageIds) => ({
        url: '/api/communication/messages/bulk-read',
        method: 'PUT',
        body: { messageIds },
      }),
      invalidatesTags: ['Message'],
    }),

    deleteMultipleMessages: builder.mutation<void, string[]>({
      query: (messageIds) => ({
        url: '/api/communication/messages/bulk-delete',
        method: 'DELETE',
        body: { messageIds },
      }),
      invalidatesTags: ['Message'],
    }),

    // Search functionality
    searchMessages: builder.query<Message[], { 
      query: string; 
      type?: 'inbox' | 'sent'; 
      limit?: number 
    }>({
      query: (params) => ({
        url: '/api/communication/messages/search',
        params,
      }),
      providesTags: ['Message'],
    }),

    searchNotices: builder.query<Notice[], { 
      query: string; 
      targetAudience?: string;
      type?: string;
      limit?: number 
    }>({
      query: (params) => ({
        url: '/api/communication/notices/search',
        params,
      }),
      providesTags: ['Notice'],
    }),
  }),
});

export const {
  // Notice hooks
  useCreateNoticeMutation,
  useGetNoticesQuery,
  useGetNoticeByIdQuery,
  useUpdateNoticeMutation,
  useDeleteNoticeMutation,
  useMarkNoticeAsViewedMutation,
  useGetNoticeStatsQuery,
  useSearchNoticesQuery,

  // Message hooks
  useSendMessageMutation,
  useGetInboxMessagesQuery,
  useGetSentMessagesQuery,
  useGetMessageByIdQuery,
  useMarkMessageAsReadMutation,
  useDeleteMessageMutation,
  useReplyToMessageMutation,
  useGetUnreadMessageCountQuery,
  useGetMessageStatsQuery,
  useMarkMultipleMessagesAsReadMutation,
  useDeleteMultipleMessagesMutation,
  useSearchMessagesQuery,
} = communicationApi;

// Export types for use in components
export type { 
  Notice, 
  CreateNoticeRequest, 
  UpdateNoticeRequest,
  Message, 
  SendMessageRequest, 
  ReplyMessageRequest,
  MessageFilters 
};
