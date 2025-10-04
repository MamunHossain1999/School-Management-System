import React, { useEffect, useMemo, useState } from 'react';
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetPermissionsQuery,
  useUpdateRolePermissionsMutation,
  useAssignRoleMutation,
  type Role,
  type Permission,
} from '../../store/api/rolesApi';

const RolesPermissions: React.FC = () => {
  const { data: roles, isLoading: rolesLoading, refetch } = useGetRolesQuery();
  const { data: permissions, isLoading: permsLoading } = useGetPermissionsQuery();
  const [createRole, { isLoading: creating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: deleting }] = useDeleteRoleMutation();
  const [updateRolePermissions, { isLoading: updatingPerms }] = useUpdateRolePermissionsMutation();
  const [assignRole, { isLoading: assigning }] = useAssignRoleMutation();

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [permFilter, setPermFilter] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [assignUserId, setAssignUserId] = useState('');

  useEffect(() => {
    if (selectedRole) {
      setRoleName(selectedRole.name);
      setRoleDesc(selectedRole.description || '');
      setSelectedPerms(selectedRole.permissions || []);
    } else {
      setRoleName('');
      setRoleDesc('');
      setSelectedPerms([]);
    }
  }, [selectedRole]);

  const filteredRoles = useMemo(() => {
    if (!roles) return [] as Role[];
    const s = search.trim().toLowerCase();
    if (!s) return roles;
    return roles.filter(r => r.name.toLowerCase().includes(s) || (r.description || '').toLowerCase().includes(s));
  }, [roles, search]);

  const filteredPerms = useMemo(() => {
    if (!permissions) return [] as Permission[];
    const s = permFilter.trim().toLowerCase();
    if (!s) return permissions;
    return permissions.filter(p => p.name.toLowerCase().includes(s) || p.key.toLowerCase().includes(s) || (p.module||'').toLowerCase().includes(s));
  }, [permissions, permFilter]);

  const resetSelection = () => setSelectedRole(null);

  const onCreate = async () => {
    if (!roleName.trim()) return alert('Role name is required');
    try {
      await createRole({ name: roleName.trim(), description: roleDesc.trim(), permissions: selectedPerms }).unwrap();
      resetSelection();
      await refetch();
      alert('Role created');
    } catch (e: any) {
      alert(e?.data?.message || 'Failed to create role');
    }
  };

  const onUpdate = async () => {
    if (!selectedRole) return;
    try {
      await updateRole({ id: selectedRole._id, data: { name: roleName.trim(), description: roleDesc.trim() } }).unwrap();
      await updateRolePermissions({ roleId: selectedRole._id, permissions: selectedPerms }).unwrap();
      await refetch();
      alert('Role updated');
    } catch (e: any) {
      alert(e?.data?.message || 'Failed to update role');
    }
  };

  const onDelete = async (role: Role) => {
    if (!confirm(`Delete role "${role.name}"?`)) return;
    try {
      await deleteRole({ id: role._id }).unwrap();
      if (selectedRole?._id === role._id) resetSelection();
      await refetch();
      alert('Role deleted');
    } catch (e: any) {
      alert(e?.data?.message || 'Failed to delete role');
    }
  };

  const togglePerm = (key: string) => {
    setSelectedPerms((prev) => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));
  };

  const onAssign = async () => {
    if (!assignUserId.trim() || !selectedRole) return alert('Select role and enter user ID');
    try {
      await assignRole({ userId: assignUserId.trim(), roleId: selectedRole._id }).unwrap();
      setAssignUserId('');
      alert('Role assigned');
    } catch (e: any) {
      alert(e?.data?.message || 'Failed to assign role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Roles & Permissions</h2>
          <p className="text-gray-600">Create roles, manage permissions, and assign to users.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles"
            className="rounded-md border border-gray-300 px-3 py-2"
          />
          <button onClick={() => refetch()} className="rounded-md border px-3 py-2 hover:bg-gray-50">Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles list */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Roles</h3>
            {(rolesLoading) ? <span className="text-sm text-gray-500">Loading...</span> : null}
          </div>
          <div className="space-y-2">
            {filteredRoles.map((r) => (
              <div key={r._id} className={`p-3 rounded border flex items-center justify-between ${selectedRole?._id === r._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <div>
                  <div className="font-medium text-gray-900">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedRole(r)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => onDelete(r)} className="text-red-600 hover:underline" disabled={deleting}>Delete</button>
                </div>
              </div>
            ))}
            {filteredRoles.length === 0 && (
              <div className="text-sm text-gray-600">No roles found.</div>
            )}
          </div>
        </div>

        {/* Role editor */}
        <div className="bg-white rounded-lg shadow-sm border p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">{selectedRole ? 'Edit Role' : 'Create Role'}</h3>
            {(updating || creating || updatingPerms) ? <span className="text-sm text-gray-500">Saving...</span> : null}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">Role Name</span>
              <input className="w-full rounded-md border border-gray-300 px-3 py-2" value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="e.g., librarian" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">Description</span>
              <input className="w-full rounded-md border border-gray-300 px-3 py-2" value={roleDesc} onChange={(e) => setRoleDesc(e.target.value)} placeholder="Optional" />
            </label>
          </div>

          {/* Permissions chooser */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Permissions</span>
              <input value={permFilter} onChange={(e) => setPermFilter(e.target.value)} placeholder="Filter permissions" className="rounded-md border border-gray-300 px-2 py-1 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto p-2 border rounded">
              {permsLoading ? (
                <div className="text-sm text-gray-600">Loading permissions...</div>
              ) : (
                filteredPerms.map((p) => (
                  <label key={p.key} className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 border">
                    <input type="checkbox" checked={selectedPerms.includes(p.key)} onChange={() => togglePerm(p.key)} className="mt-1" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.key} {p.module ? `• ${p.module}` : ''}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            {selectedRole ? (
              <>
                <button onClick={onUpdate} disabled={updating || updatingPerms} className="rounded-md bg-blue-600 text-white px-4 py-2 disabled:opacity-50">Update Role</button>
                <button onClick={resetSelection} className="rounded-md border px-4 py-2">New Role</button>
              </>
            ) : (
              <button onClick={onCreate} disabled={creating} className="rounded-md bg-green-600 text-white px-4 py-2 disabled:opacity-50">Create Role</button>
            )}
          </div>

          {/* Assign role to user */}
          <div className="mt-6 border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Assign Role to User</h4>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)} placeholder="User ID" className="rounded-md border border-gray-300 px-3 py-2 flex-1" />
              <select className="rounded-md border border-gray-300 px-3 py-2" value={selectedRole?._id || ''} onChange={(e) => {
                const r = roles?.find(rr => rr._id === e.target.value) || null;
                setSelectedRole(r);
              }}>
                <option value="">Select role</option>
                {roles?.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
              </select>
              <button onClick={onAssign} disabled={assigning} className="rounded-md border px-4 py-2 hover:bg-gray-50 disabled:opacity-50">Assign</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesPermissions;
