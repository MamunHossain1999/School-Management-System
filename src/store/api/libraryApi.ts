import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  location: string;
  description?: string;
  publishedYear?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BorrowRecord {
  _id: string;
  book: string | Book;
  student: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
  fine?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  location: string;
  description?: string;
  publishedYear?: number;
}

export interface BorrowBookRequest {
  bookId: string;
  studentId: string;
  dueDate: string;
}

export const libraryApi = createApi({
  reducerPath: 'libraryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL}/api/library`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Book', 'BorrowRecord'],
  endpoints: (builder) => ({
    // Book management
    createBook: builder.mutation<Book, CreateBookRequest>({
      query: (bookData) => ({
        url: '/books',
        method: 'POST',
        body: bookData,
      }),
      invalidatesTags: ['Book'],
    }),

    getBooks: builder.query<Book[], { category?: string; search?: string }>({
      query: (params) => ({
        url: '/books',
        params,
      }),
      providesTags: ['Book'],
    }),

    getBookById: builder.query<Book, string>({
      query: (id) => `/books/${id}`,
      providesTags: ['Book'],
    }),

    updateBook: builder.mutation<Book, { id: string; data: Partial<CreateBookRequest> }>({
      query: ({ id, data }) => ({
        url: `/books/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Book'],
    }),

    deleteBook: builder.mutation<void, string>({
      query: (id) => ({
        url: `/books/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Book'],
    }),

    // Borrow/Return system
    borrowBook: builder.mutation<BorrowRecord, BorrowBookRequest>({
      query: (borrowData) => ({
        url: '/borrow',
        method: 'POST',
        body: borrowData,
      }),
      invalidatesTags: ['BorrowRecord', 'Book'],
    }),

    returnBook: builder.mutation<BorrowRecord, { recordId: string; fine?: number }>({
      query: ({ recordId, fine }) => ({
        url: `/return/${recordId}`,
        method: 'PUT',
        body: { fine },
      }),
      invalidatesTags: ['BorrowRecord', 'Book'],
    }),

    getBorrowRecords: builder.query<BorrowRecord[], { studentId?: string; status?: string }>({
      query: (params) => ({
        url: '/borrow-records',
        params,
      }),
      providesTags: ['BorrowRecord'],
    }),

    getStudentBorrowHistory: builder.query<BorrowRecord[], string>({
      query: (studentId) => `/students/${studentId}/borrow-history`,
      providesTags: ['BorrowRecord'],
    }),

    getOverdueBooks: builder.query<BorrowRecord[], void>({
      query: () => '/overdue',
      providesTags: ['BorrowRecord'],
    }),

    renewBook: builder.mutation<BorrowRecord, { recordId: string; newDueDate: string }>({
      query: ({ recordId, newDueDate }) => ({
        url: `/renew/${recordId}`,
        method: 'PUT',
        body: { newDueDate },
      }),
      invalidatesTags: ['BorrowRecord'],
    }),
  }),
});

export const {
  useCreateBookMutation,
  useGetBooksQuery,
  useGetBookByIdQuery,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useBorrowBookMutation,
  useReturnBookMutation,
  useGetBorrowRecordsQuery,
  useGetStudentBorrowHistoryQuery,
  useGetOverdueBooksQuery,
  useRenewBookMutation,
} = libraryApi;
