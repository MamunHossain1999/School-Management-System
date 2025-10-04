/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from './baseApi';

export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher?: string;
  totalCopies: number;
  availableCopies: number;
  location: string;
  shelfNumber?: string;
  description?: string;
  publishedYear?: number;
  language: string;
  pages?: number;
  price?: number;
  condition: 'new' | 'good' | 'fair' | 'poor';
  coverImage?: string;
  tags?: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BorrowRecord {
  _id: string;
  book: string | Book;
  borrower: string; // Can be student, teacher, or staff
  borrowerType: 'student' | 'teacher' | 'staff';
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue' | 'renewed';
  renewalCount: number;
  fine?: number;
  fineStatus: 'none' | 'pending' | 'paid';
  notes?: string;
  issuedBy: string;
  returnedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher?: string;
  totalCopies: number;
  location: string;
  shelfNumber?: string;
  description?: string;
  publishedYear?: number;
  language: string;
  pages?: number;
  price?: number;
  condition: 'new' | 'good' | 'fair' | 'poor';
  coverImage?: string;
  tags?: string[];
}

export interface UpdateBookRequest extends Partial<CreateBookRequest> {
  isActive?: boolean;
}

export interface BorrowBookRequest {
  bookId: string;
  borrowerId: string;
  borrowerType: 'student' | 'teacher' | 'staff';
  dueDate: string;
  notes?: string;
}

export interface ReturnBookRequest {
  fine?: number;
  notes?: string;
}

export interface LibraryStats {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  overdueBooks: number;
  totalMembers: number;
  activeMembers: number;
  categoriesCount: number;
  monthlyBorrows: number;
  popularBooks: Array<{
    book: Book;
    borrowCount: number;
  }>;
  categoryDistribution: Record<string, number>;
  borrowTrends: Array<{
    month: string;
    borrows: number;
    returns: number;
  }>;
}

export interface LibraryMember {
  _id: string;
  memberId: string;
  name: string;
  email: string;
  phone?: string;
  type: 'student' | 'teacher' | 'staff';
  class?: string;
  section?: string;
  department?: string;
  joinDate: string;
  isActive: boolean;
  maxBooksAllowed: number;
  currentBooksCount: number;
  totalFine: number;
  createdAt: string;
  updatedAt: string;
}

// Strongly-typed response for GET /api/library/books
interface BooksListResponse {
  success: boolean;
  message: string;
  data:
    | Book[]
    | {
        books: Book[];
        pagination?: {
          currentPage: number;
          totalPages: number;
          total: number;
        };
      };
}

export const libraryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /api/library/books - Add book (Admin)
    createBook: builder.mutation<Book, CreateBookRequest>({
      query: (bookData) => ({
        url: '/api/library/books',
        method: 'POST',
        body: bookData,
      }),
      transformResponse: (response: { data?: Book } | Book) => ((response as any)?.data ?? response) as Book,
      invalidatesTags: ['Book', 'Library'],
    }),

    // GET /api/library/books - Get all books (Teacher/Admin)
    getBooks: builder.query<Book[], { 
      category?: string; 
      search?: string; 
      author?: string;
      language?: string;
      isActive?: boolean;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/api/library/books',
        params,
      }),
      transformResponse: (response: BooksListResponse | Book[] | { data: Book[] }) => {
        // Support nested API shapes
        const r = response as BooksListResponse;
        const anyResp = response as { data?: unknown };
        if (typeof r === 'object' && r !== null && 'data' in r) {
          const d = (r as BooksListResponse).data as unknown;
          if (d && typeof d === 'object' && 'books' in (d as any)) {
            const books = (d as { books: Book[] }).books;
            return Array.isArray(books) ? books : [];
          }
        }
        if (anyResp?.data && Array.isArray(anyResp.data)) {
          return anyResp.data as Book[];
        }
        if (Array.isArray(response)) {
          return response as Book[];
        }
        return [];
      },
      providesTags: ['Book'],
    }),

    // GET /api/library/books/:id - Get book by ID
    getBookById: builder.query<Book, string>({
      query: (id) => `/api/library/books/${id}`,
      transformResponse: (response: { data?: Book } | Book) => (response && (response as any).data) ? (response as any).data as Book : response as Book,
      providesTags: ['Book'],
    }),

    // PUT /api/library/books/:id - Update book (Admin)
    updateBook: builder.mutation<Book, { id: string; data: UpdateBookRequest }>({
      query: ({ id, data }) => ({
        url: `/api/library/books/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Book', 'Library'],
    }),

    // DELETE /api/library/books/:id - Delete book (Admin)
    deleteBook: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/library/books/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Book', 'Library'],
    }),

    // POST /api/library/borrow - Borrow book (Teacher/Admin)
    borrowBook: builder.mutation<BorrowRecord, BorrowBookRequest>({
      query: (borrowData) => ({
        url: '/api/library/borrow',
        method: 'POST',
        body: borrowData,
      }),
      transformResponse: (response: { data?: BorrowRecord } | BorrowRecord) => (response && (response as any).data) ? (response as any).data as BorrowRecord : response as BorrowRecord,
      invalidatesTags: ['BorrowRecord', 'Book', 'Library'],
    }),

    // PUT /api/library/return/:borrowId - Return book (Teacher/Admin)
    returnBook: builder.mutation<BorrowRecord, { borrowId: string; data: ReturnBookRequest }>({
      query: ({ borrowId, data }) => ({
        url: `/api/library/return/${borrowId}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: { data?: BorrowRecord } | BorrowRecord) => (response && (response as any).data) ? (response as any).data as BorrowRecord : response as BorrowRecord,
      invalidatesTags: ['BorrowRecord', 'Book', 'Library'],
    }),

    // GET /api/library/borrowed - Get borrowed books (Teacher/Admin)
    getBorrowedBooks: builder.query<BorrowRecord[], { 
      borrowerId?: string; 
      borrowerType?: string;
      status?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/api/library/borrowed',
        params,
      }),
      transformResponse: (response: { data?: BorrowRecord[] | { records?: BorrowRecord[] } } | BorrowRecord[]) => {
        const anyResp = response as any;
        if (anyResp?.data?.records && Array.isArray(anyResp.data.records)) return anyResp.data.records as BorrowRecord[];
        if (anyResp?.data && Array.isArray(anyResp.data)) return anyResp.data as BorrowRecord[];
        if (Array.isArray(response)) return response as BorrowRecord[];
        return [];
      },
      providesTags: ['BorrowRecord'],
    }),

    // GET /api/library/overdue - Get overdue books (Teacher/Admin)
    getOverdueBooks: builder.query<BorrowRecord[], { 
      borrowerType?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/api/library/overdue',
        params,
      }),
      transformResponse: (response: { data?: BorrowRecord[] } | BorrowRecord[]) => {
        const anyResp = response as any;
        if (anyResp?.data && Array.isArray(anyResp.data)) return anyResp.data as BorrowRecord[];
        if (Array.isArray(response)) return response as BorrowRecord[];
        return [];
      },
      providesTags: ['BorrowRecord'],
    }),

    // GET /api/library/stats - Get library statistics (Teacher/Admin)
    getLibraryStats: builder.query<LibraryStats, { 
      period?: 'week' | 'month' | 'year';
      startDate?: string;
      endDate?: string;
    }>({
      query: (params) => ({
        url: '/api/library/stats',
        params,
      }),
      transformResponse: (response: { data?: LibraryStats } | LibraryStats) => (response && (response as any).data) ? (response as any).data as LibraryStats : response as LibraryStats,
      providesTags: ['Library'],
    }),

    // Additional useful endpoints
    // GET /api/library/categories - Get book categories
    getBookCategories: builder.query<string[], void>({
      query: () => '/api/library/categories',
      transformResponse: (response: { data?: string[] } | string[]) => (response && (response as any).data) ? (response as any).data as string[] : response as string[],
      providesTags: ['Book'],
    }),

    // GET /api/library/authors - Get authors list
    getAuthors: builder.query<string[], { search?: string }>({
      query: (params) => ({
        url: '/api/library/authors',
        params,
      }),
      transformResponse: (response: { data?: string[] } | string[]) => (response && (response as any).data) ? (response as any).data as string[] : response as string[],
      providesTags: ['Book'],
    }),

    // GET /api/library/members - Get library members
    getLibraryMembers: builder.query<LibraryMember[], { 
      type?: string;
      isActive?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/api/library/members',
        params,
      }),
      transformResponse: (response: { data?: LibraryMember[] | { members?: LibraryMember[] } } | LibraryMember[]) => {
        const anyResp = response as any;
        if (anyResp?.data?.members && Array.isArray(anyResp.data.members)) return anyResp.data.members as LibraryMember[];
        if (anyResp?.data && Array.isArray(anyResp.data)) return anyResp.data as LibraryMember[];
        if (Array.isArray(response)) return response as LibraryMember[];
        return [];
      },
      providesTags: ['LibraryMember'],
    }),

    // POST /api/library/members - Add library member
    addLibraryMember: builder.mutation<LibraryMember, {
      memberId: string;
      name: string;
      email: string;
      phone?: string;
      type: 'student' | 'teacher' | 'staff';
      class?: string;
      section?: string;
      department?: string;
      maxBooksAllowed?: number;
    }>({
      query: (memberData) => ({
        url: '/api/library/members',
        method: 'POST',
        body: memberData,
      }),
      transformResponse: (response: { data?: LibraryMember } | LibraryMember) => (response && (response as any).data) ? (response as any).data as LibraryMember : response as LibraryMember,
      invalidatesTags: ['LibraryMember'],
    }),

    // PUT /api/library/members/:id - Update library member
    updateLibraryMember: builder.mutation<LibraryMember, { 
      id: string; 
      data: Partial<{
        name: string;
        email: string;
        phone: string;
        maxBooksAllowed: number;
        isActive: boolean;
      }>
    }>({
      query: ({ id, data }) => ({
        url: `/api/library/members/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['LibraryMember'],
    }),

    // GET /api/library/members/:id/history - Get member borrow history
    getMemberBorrowHistory: builder.query<BorrowRecord[], { 
      memberId: string;
      page?: number;
      limit?: number;
    }>({
      query: ({ memberId, ...params }) => ({
        url: `/api/library/members/${memberId}/history`,
        params,
      }),
      transformResponse: (response: { data?: BorrowRecord[] } | BorrowRecord[]) => {
        const anyResp = response as any;
        if (anyResp?.data && Array.isArray(anyResp.data)) return anyResp.data as BorrowRecord[];
        if (Array.isArray(response)) return response as BorrowRecord[];
        return [];
      },
      providesTags: ['BorrowRecord'],
    }),

    // PUT /api/library/renew/:borrowId - Renew book
    renewBook: builder.mutation<BorrowRecord, { 
      borrowId: string; 
      newDueDate: string;
      notes?: string;
    }>({
      query: ({ borrowId, newDueDate, notes }) => ({
        url: `/api/library/renew/${borrowId}`,
        method: 'PUT',
        body: { newDueDate, notes },
      }),
      transformResponse: (response: { data?: BorrowRecord } | BorrowRecord) => (response && (response as any).data) ? (response as any).data as BorrowRecord : response as BorrowRecord,
      invalidatesTags: ['BorrowRecord'],
    }),

    // POST /api/library/reserve - Reserve book
    reserveBook: builder.mutation<{ success: boolean; message: string; reservationId: string }, {
      bookId: string;
      borrowerId: string;
      borrowerType: 'student' | 'teacher' | 'staff';
      notes?: string;
    }>({
      query: (reservationData) => ({
        url: '/api/library/reserve',
        method: 'POST',
        body: reservationData,
      }),
      invalidatesTags: ['Book', 'Library'],
    }),

    // GET /api/library/reservations - Get reservations
    getReservations: builder.query<
      Array<{
        _id: string;
        book: Book;
        borrower: string;
        borrowerType: string;
        reservationDate: string;
        status: 'active' | 'fulfilled' | 'cancelled';
        notes?: string;
      }>,
      { borrowerId?: string; status?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: '/api/library/reservations',
        params,
      }),
      transformResponse: (
        response:
          | { data?: any[] | { reservations?: any[] } }
          | any[]
      ) => {
        const anyResp = response as any;
        if (anyResp?.data?.reservations && Array.isArray(anyResp.data.reservations)) return anyResp.data.reservations as any[];
        if (anyResp?.data && Array.isArray(anyResp.data)) return anyResp.data as any[];
        if (Array.isArray(response)) return response as any[];
        return [];
      },
      providesTags: ['Library'],
    }),

    // PUT /api/library/fine/:borrowId - Pay fine
    payFine: builder.mutation<BorrowRecord, { 
      borrowId: string;
      amount: number;
      paymentMethod: string;
      transactionId?: string;
    }>({
      query: ({ borrowId, ...data }) => ({
        url: `/api/library/fine/${borrowId}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: { data?: BorrowRecord } | BorrowRecord) => (response && (response as any).data) ? (response as any).data as BorrowRecord : response as BorrowRecord,
      invalidatesTags: ['BorrowRecord', 'LibraryMember'],
    }),

    // GET /api/library/reports/popular - Get popular books report
    getPopularBooksReport: builder.query<Array<{
      book: Book;
      borrowCount: number;
      lastBorrowed: string;
    }>, { 
      period?: 'week' | 'month' | 'year';
      limit?: number;
    }>({
      query: (params) => ({
        url: '/api/library/reports/popular',
        params,
      }),
      transformResponse: (response: { data?: any[] } | any[]) => (response && (response as any).data) ? (response as any).data as any[] : response as any[],
      providesTags: ['Library'],
    }),

    // GET /api/library/reports/defaulters - Get defaulters report
    getDefaultersReport: builder.query<Array<{
      member: LibraryMember;
      overdueBooks: BorrowRecord[];
      totalFine: number;
    }>, { 
      minDays?: number;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/api/library/reports/defaulters',
        params,
      }),
      transformResponse: (response: { data?: any[] } | any[]) => (response && (response as any).data) ? (response as any).data as any[] : response as any[],
      providesTags: ['BorrowRecord', 'LibraryMember'],
    }),
  }),
});

export const {
  // Book Management
  useCreateBookMutation,
  useGetBooksQuery,
  useGetBookByIdQuery,
  useUpdateBookMutation,
  useDeleteBookMutation,
  
  // Borrow/Return System
  useBorrowBookMutation,
  useReturnBookMutation,
  useGetBorrowedBooksQuery,
  useGetOverdueBooksQuery,
  useRenewBookMutation,
  
  // Statistics & Reports
  useGetLibraryStatsQuery,
  useGetPopularBooksReportQuery,
  useGetDefaultersReportQuery,
  
  // Members Management
  useGetLibraryMembersQuery,
  useAddLibraryMemberMutation,
  useUpdateLibraryMemberMutation,
  useGetMemberBorrowHistoryQuery,
  
  // Additional Features
  useGetBookCategoriesQuery,
  useGetAuthorsQuery,
  useReserveBookMutation,
  useGetReservationsQuery,
  usePayFineMutation,
} = libraryApi;
