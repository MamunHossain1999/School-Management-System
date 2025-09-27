import { baseApi } from './baseApi';

// Notice interfaces
export interface Notice {
  _id: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'event' | 'holiday' | 'exam';
  targetAudience: 'all' | 'students' | 'teachers' | 'parents' | 'staff';
  class?: string;
  section?: string;
  isActive: boolean;
  publishDate: string;
  expiryDate?: string;
  attachments?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  viewedBy?: string[]; // Array of user IDs who have viewed this notice
}

export interface CreateNoticeRequest {
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'event' | 'holiday' | 'exam';
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
      query: (noticeData) => ({
        url: '/api/communication/notices',
        method: 'POST',
        body: noticeData,
      }),
      invalidatesTags: ['Notice'],
    }),

    getNotices: builder.query<Notice[], { 
      targetAudience?: string; 
      type?: string; 
      isActive?: boolean;
      class?: string;
      section?: string;
    }>({
      query: (params) => ({
        url: '/api/communication/notices',
        params,
      }),
      providesTags: ['Notice'],
    }),

    getNoticeById: builder.query<Notice, string>({
      query: (id) => `/api/communication/notices/${id}`,
      providesTags: (result, error, id) => [{ type: 'Notice', id }],
    }),

    updateNotice: builder.mutation<Notice, { id: string; data: UpdateNoticeRequest }>({
      query: ({ id, data }) => ({
        url: `/api/communication/notices/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Notice', id }, 'Notice'],
    }),

    deleteNotice: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/communication/notices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Notice', id }, 'Notice'],
    }),

    markNoticeAsViewed: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/communication/notices/${id}/view`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Notice', id }, 'Notice'],
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
      providesTags: (result, error, id) => [{ type: 'Message', id }],
    }),

    markMessageAsRead: builder.mutation<Message, string>({
      query: (id) => ({
        url: `/api/communication/messages/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Message', id }, 'Message'],
    }),

    deleteMessage: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/communication/messages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Message', id }, 'Message'],
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
