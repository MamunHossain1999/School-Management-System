import { baseApi } from './baseApi';

export interface Permission {
  key: string; // e.g., 'users.read'
  name: string; // e.g., 'Read Users'
  description?: string;
  module?: string; // e.g., 'Users'
}

export interface Role {
  _id: string;
  name: string; // e.g., 'teacher', 'accountant', 'librarian'
  description?: string;
  permissions: string[]; // permission keys
  system?: boolean; // protected role
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/roles
    getRoles: builder.query<Role[], void>({
      query: () => '/api/roles',
      providesTags: (result) => [
        { type: 'Role' as const, id: 'LIST' },
        ...(result?.map((r) => ({ type: 'Role' as const, id: r._id })) ?? []),
      ],
    }),

    // POST /api/roles
    createRole: builder.mutation<Role, CreateRoleRequest>({
      query: (body) => ({ url: '/api/roles', method: 'POST', body }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),

    // PUT /api/roles/:id
    updateRole: builder.mutation<Role, { id: string; data: UpdateRoleRequest }>({
      query: ({ id, data }) => ({ url: `/api/roles/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Role', id: 'LIST' },
        { type: 'Role', id: arg.id },
      ],
    }),

    // DELETE /api/roles/:id
    deleteRole: builder.mutation<{ success: boolean }, { id: string }>({
      query: ({ id }) => ({ url: `/api/roles/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),

    // GET /api/roles/permissions
    getPermissions: builder.query<Permission[], void>({
      query: () => '/api/roles/permissions',
      providesTags: [{ type: 'Permission', id: 'LIST' }],
    }),

    // PUT /api/roles/:roleId/permissions
    updateRolePermissions: builder.mutation<Role, { roleId: string; permissions: string[] }>({
      query: ({ roleId, permissions }) => ({
        url: `/api/roles/${roleId}/permissions`,
        method: 'PUT',
        body: { permissions },
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Role', id: arg.roleId },
        { type: 'Role', id: 'LIST' },
      ],
    }),

    // POST /api/roles/assign
    assignRole: builder.mutation<{ success: boolean }, { userId: string; roleId: string }>({
      query: (body) => ({ url: '/api/roles/assign', method: 'POST', body }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    // GET /api/roles/user/:userId
    getUserRoles: builder.query<Role[], { userId: string }>({
      query: ({ userId }) => `/api/roles/user/${userId}`,
      providesTags: (_res, _err, arg) => [{ type: 'User', id: arg.userId }],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetPermissionsQuery,
  useUpdateRolePermissionsMutation,
  useAssignRoleMutation,
  useGetUserRolesQuery,
} = rolesApi;
