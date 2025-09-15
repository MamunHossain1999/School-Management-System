import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

export interface Route {
  _id: string;
  name: string;
  description: string;
  stops: Stop[];
  distance: number;
  estimatedTime: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Stop {
  _id: string;
  name: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  arrivalTime: string;
  departureTime: string;
  order: number;
}

export interface Bus {
  _id: string;
  busNumber: string;
  capacity: number;
  driverName: string;
  driverPhone: string;
  route?: string | Route;
  isActive: boolean;
  maintenanceDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentTransport {
  _id: string;
  student: string;
  route: string | Route;
  stop: string | Stop;
  pickupTime: string;
  dropTime: string;
  monthlyFee: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRouteRequest {
  name: string;
  description: string;
  stops: Omit<Stop, '_id'>[];
  distance: number;
  estimatedTime: number;
}

export interface CreateBusRequest {
  busNumber: string;
  capacity: number;
  driverName: string;
  driverPhone: string;
  route?: string;
}

export interface AssignStudentTransportRequest {
  studentId: string;
  routeId: string;
  stopId: string;
  pickupTime: string;
  dropTime: string;
  monthlyFee: number;
}

export const transportApi = createApi({
  reducerPath: 'transportApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL}/api/transport`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Route', 'Bus', 'StudentTransport'],
  endpoints: (builder) => ({
    // Route management
    createRoute: builder.mutation<Route, CreateRouteRequest>({
      query: (routeData) => ({
        url: '/routes',
        method: 'POST',
        body: routeData,
      }),
      invalidatesTags: ['Route'],
    }),

    getRoutes: builder.query<Route[], { isActive?: boolean }>({
      query: (params) => ({
        url: '/routes',
        params,
      }),
      providesTags: ['Route'],
    }),

    getRouteById: builder.query<Route, string>({
      query: (id) => `/routes/${id}`,
      providesTags: ['Route'],
    }),

    updateRoute: builder.mutation<Route, { id: string; data: Partial<CreateRouteRequest> }>({
      query: ({ id, data }) => ({
        url: `/routes/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Route'],
    }),

    deleteRoute: builder.mutation<void, string>({
      query: (id) => ({
        url: `/routes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Route'],
    }),

    // Bus management
    createBus: builder.mutation<Bus, CreateBusRequest>({
      query: (busData) => ({
        url: '/buses',
        method: 'POST',
        body: busData,
      }),
      invalidatesTags: ['Bus'],
    }),

    getBuses: builder.query<Bus[], { routeId?: string; isActive?: boolean }>({
      query: (params) => ({
        url: '/buses',
        params,
      }),
      providesTags: ['Bus'],
    }),

    updateBus: builder.mutation<Bus, { id: string; data: Partial<CreateBusRequest> }>({
      query: ({ id, data }) => ({
        url: `/buses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Bus'],
    }),

    deleteBus: builder.mutation<void, string>({
      query: (id) => ({
        url: `/buses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Bus'],
    }),

    assignBusToRoute: builder.mutation<Bus, { busId: string; routeId: string }>({
      query: ({ busId, routeId }) => ({
        url: `/buses/${busId}/assign-route`,
        method: 'PUT',
        body: { routeId },
      }),
      invalidatesTags: ['Bus'],
    }),

    // Student transport management
    assignStudentTransport: builder.mutation<StudentTransport, AssignStudentTransportRequest>({
      query: (transportData) => ({
        url: '/student-transport',
        method: 'POST',
        body: transportData,
      }),
      invalidatesTags: ['StudentTransport'],
    }),

    getStudentTransport: builder.query<StudentTransport[], { studentId?: string; routeId?: string }>({
      query: (params) => ({
        url: '/student-transport',
        params,
      }),
      providesTags: ['StudentTransport'],
    }),

    updateStudentTransport: builder.mutation<StudentTransport, { id: string; data: Partial<AssignStudentTransportRequest> }>({
      query: ({ id, data }) => ({
        url: `/student-transport/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['StudentTransport'],
    }),

    removeStudentTransport: builder.mutation<void, string>({
      query: (id) => ({
        url: `/student-transport/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StudentTransport'],
    }),

    getRouteStudents: builder.query<StudentTransport[], string>({
      query: (routeId) => `/routes/${routeId}/students`,
      providesTags: ['StudentTransport'],
    }),
  }),
});

export const {
  useCreateRouteMutation,
  useGetRoutesQuery,
  useGetRouteByIdQuery,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
  useCreateBusMutation,
  useGetBusesQuery,
  useUpdateBusMutation,
  useDeleteBusMutation,
  useAssignBusToRouteMutation,
  useAssignStudentTransportMutation,
  useGetStudentTransportQuery,
  useUpdateStudentTransportMutation,
  useRemoveStudentTransportMutation,
  useGetRouteStudentsQuery,
} = transportApi;
