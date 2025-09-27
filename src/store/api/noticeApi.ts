import { baseApi } from './baseApi';

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
}

export interface Message {
  _id: string;
  sender: string;
  receiver: string;
  subject: string;
  isRead: boolean;
  sentAt: string;
  attachments?: string[];
}

export interface CreateNoticeRequest {
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'event' | 'holiday' | 'exam';
  targetAudience: 'all' | 'students' | 'teachers' | 'parents' | 'staff';
  class?: string;
  publishDate: string;
  expiryDate?: string;
  attachments?: string[];
}
// Payload for updating a notice: allow partial fields plus optional isActive toggle
export interface UpdateNoticeRequest extends Partial<CreateNoticeRequest> {
  isActive?: boolean;
}

// Extra responses for additional notice endpoints
export interface NoticeStatsResponse {
  total: number;
  active: number;
  inactive: number;
  expiringSoon?: number;
}

export interface NoticePriorityItem {
  _id: string;
  title: string;
  priority: number;
}
export interface SendMessageRequest {
  receiverId: string;
  subject: string;
  content: string;
  attachments?: string[];
}

export const noticeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Notice management
    createNotice: builder.mutation<Notice, CreateNoticeRequest>({
      query: (noticeData) => ({
        url: '/api/notices',
        method: 'POST',
        body: noticeData,
      }),
      invalidatesTags: ['Notice'],
    }),

    getNotices: builder.query<Notice[], { targetAudience?: string; type?: string; isActive?: boolean }>({
      query: (params) => ({
        url: '/api/notices',
        params,
      }),
      providesTags: ['Notice'],
    }),

    getNoticeById: builder.query<Notice, string>({
      query: (id) => `/api/notices/${id}`,
      providesTags: ['Notice'],
    }),

    updateNotice: builder.mutation<Notice, { id: string; data: UpdateNoticeRequest }>({
      query: ({ id, data }) => ({
        url: `/api/notices/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Notice'],
    }),

    // Stats for notices
    getNoticeStats: builder.query<NoticeStatsResponse, void>({
      query: () => '/api/notices/stats',
      providesTags: ['Notice'],
    }),

    // Priority list
    getNoticePriority: builder.query<NoticePriorityItem[], void>({
      query: () => '/api/notices/priority',
      providesTags: ['Notice'],
    }),

    // Mark a notice as viewed
    markNoticeViewed: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/notices/${id}/view`,
        method: 'POST',
      }),
      invalidatesTags: ['Notice'],
    }),

    deleteNotice: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/notices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notice'],
    }),

    // Message management
    sendMessage: builder.mutation<Message, SendMessageRequest>({
      query: (messageData) => ({
        url: '/api/communication/messages/send',
        method: 'POST',
        body: messageData,
      }),
      invalidatesTags: ['Message'],
    }),

    getMessages: builder.query<Message[], { type?: 'sent' | 'received' }>({
      query: (params) => ({
        url: '/api/communication/messages',
        params,
      }),
      providesTags: ['Message'],
    }),

    markMessageAsRead: builder.mutation<Message, string>({
      query: (messageId) => ({
        url: `/api/communication/messages/${messageId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Message'],
    }),

    deleteMessage: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/communication/messages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Message'],
    }),

    getUnreadMessageCount: builder.query<{ count: number }, void>({
      query: () => '/api/communication/messages/unread-count',
      providesTags: ['Message'],
    }),
  }),
});

export const {
  useCreateNoticeMutation,
  useGetNoticesQuery,
  useGetNoticeByIdQuery,
  useUpdateNoticeMutation,
  useGetNoticeStatsQuery,
  useGetNoticePriorityQuery,
  useMarkNoticeViewedMutation,
  useDeleteNoticeMutation,
  useSendMessageMutation,
  useGetMessagesQuery,
  useMarkMessageAsReadMutation,
  useDeleteMessageMutation,
  useGetUnreadMessageCountQuery,
} = noticeApi;
