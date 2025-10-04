/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from './baseApi';

export interface Notice {
  _id: string;
  title: string;
  content: string;
  type: 'general' | 'important' | 'event' | 'holiday' | 'exam';
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
  type: 'general' | 'important' | 'event' | 'holiday' | 'exam';
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
      query: (params) => {
        console.log('NoticeApi - Getting notices with params:', params);
        return {
          url: '/api/notices',
          params,
        };
      },
      transformResponse: (response: any) => {
        console.log('NoticeApi - Raw API Response:', response);
        
        // Handle nested response structure
        if (response.data && Array.isArray(response.data.notices)) {
          console.log('NoticeApi - Found notices in response.data.notices:', response.data.notices);
          return response.data.notices;
        }
        
        // Handle direct array in data
        if (response.data && Array.isArray(response.data)) {
          console.log('NoticeApi - Found notices in response.data (array):', response.data);
          return response.data;
        }
        
        // Handle direct array response
        if (Array.isArray(response)) {
          console.log('NoticeApi - Found notices in response (direct array):', response);
          return response;
        }
        
        console.log('NoticeApi - No notices found, returning empty array');
        return [];
      },
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
      query: () => ({
        url: '/api/notices',
        params: { action: 'unread-count' }
      }),
      providesTags: ['Message'],
      // Add error handling for when endpoint is not available
      transformErrorResponse: (response: { status: number; data?: unknown }) => {
        if (response.status === 404) {
          console.warn('Unread message count endpoint not found, returning default count');
          return { count: 0 };
        }
        return response;
      },
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
