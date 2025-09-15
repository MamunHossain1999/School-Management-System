import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

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
  content: string;
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
  section?: string;
  publishDate: string;
  expiryDate?: string;
  attachments?: string[];
}

export interface SendMessageRequest {
  receiverId: string;
  subject: string;
  content: string;
  attachments?: string[];
}

export const noticeApi = createApi({
  reducerPath: 'noticeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Notice', 'Message'],
  endpoints: (builder) => ({
    // Notice management
    createNotice: builder.mutation<Notice, CreateNoticeRequest>({
      query: (noticeData) => ({
        url: '/notices',
        method: 'POST',
        body: noticeData,
      }),
      invalidatesTags: ['Notice'],
    }),

    getNotices: builder.query<Notice[], { targetAudience?: string; type?: string; isActive?: boolean }>({
      query: (params) => ({
        url: '/notices',
        params,
      }),
      providesTags: ['Notice'],
    }),

    getNoticeById: builder.query<Notice, string>({
      query: (id) => `/notices/${id}`,
      providesTags: ['Notice'],
    }),

    updateNotice: builder.mutation<Notice, { id: string; data: Partial<CreateNoticeRequest> }>({
      query: ({ id, data }) => ({
        url: `/notices/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Notice'],
    }),

    deleteNotice: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notice'],
    }),

    // Message management
    sendMessage: builder.mutation<Message, SendMessageRequest>({
      query: (messageData) => ({
        url: '/messages/send',
        method: 'POST',
        body: messageData,
      }),
      invalidatesTags: ['Message'],
    }),

    getMessages: builder.query<Message[], { type?: 'sent' | 'received' }>({
      query: (params) => ({
        url: '/messages',
        params,
      }),
      providesTags: ['Message'],
    }),

    markMessageAsRead: builder.mutation<Message, string>({
      query: (messageId) => ({
        url: `/messages/${messageId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Message'],
    }),

    deleteMessage: builder.mutation<void, string>({
      query: (id) => ({
        url: `/messages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Message'],
    }),

    getUnreadMessageCount: builder.query<{ count: number }, void>({
      query: () => '/messages/unread-count',
      providesTags: ['Message'],
    }),
  }),
});

export const {
  useCreateNoticeMutation,
  useGetNoticesQuery,
  useGetNoticeByIdQuery,
  useUpdateNoticeMutation,
  useDeleteNoticeMutation,
  useSendMessageMutation,
  useGetMessagesQuery,
  useMarkMessageAsReadMutation,
  useDeleteMessageMutation,
  useGetUnreadMessageCountQuery,
} = noticeApi;
