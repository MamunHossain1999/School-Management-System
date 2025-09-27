/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Download,
  Upload,
} from "lucide-react";

import toast from "react-hot-toast";
import type { User } from "../../types";
import {
  useListUsersQuery,
  useDeactivateUserMutation,
  useActivateUserMutation,
} from "../../store/api/userApi";

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Debounce search to avoid spamming requests
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data, isLoading, isFetching, isError, error } = useListUsersQuery(
    {
      role: selectedRole === "all" ? undefined : selectedRole,
      search: debouncedSearch || undefined,
      page,
      limit,
    },
    { refetchOnMountOrArgChange: true }
  );
  const [deactivateUser, { isLoading: isDeactivating }] =
    useDeactivateUserMutation();
  const [activateUser, { isLoading: isActivating }] = useActivateUserMutation();

  // Track which user row is acting to disable the row action button
  const [actingUserId, setActingUserId] = useState<string | null>(null);

  const users: User[] = Array.isArray(data?.users) ? data!.users : [];

  const filteredUsers = users.filter((user: User) => {
    const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
    const matchesRole =
      selectedRole === "all" || (user.role ?? "") === selectedRole;
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesRole && matchesSearch;
  });

  const handleDeactivateUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      try {
        setActingUserId(userId);
        await deactivateUser(userId).unwrap();
        toast.success("User deactivated successfully");
      } catch (error: any) {
        toast.error(error?.message || "Failed to deactivate user");
      } finally {
        setActingUserId(null);
      }
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      setActingUserId(userId);
      await activateUser(userId).unwrap();
      toast.success("User activated successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to activate user");
    } finally {
      setActingUserId(null);
    }
  };

  const handleEditUser = (user: User) => {
    const id = user._id || (user as any).id;
    if (!id) return;
    navigate(`/admin/users/${id}/edit`);
  };

  const handleViewUser = (user: User) => {
    const id = user._id || (user as any).id;
    if (!id) return;
    navigate(`/admin/users/${id}`);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "teacher":
        return "bg-blue-100 text-blue-800";
      case "student":
        return "bg-green-100 text-green-800";
      case "parent":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const stats = [
    { label: "Total Users", value: users.length, color: "bg-blue-500" },
    {
      label: "Students",
      value: users.filter((u) => u.role === "student").length,
      color: "bg-green-500",
    },
    {
      label: "Teachers",
      value: users.filter((u) => u.role === "teacher").length,
      color: "bg-purple-500",
    },
    {
      label: "Parents",
      value: users.filter((u) => u.role === "parent").length,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage all users in the system</p>
        </div>
        <button
          onClick={() => navigate("/admin/users/create")}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 cursor-pointer text-white rounded-md hover:bg-green-700 transition-colors shadow-md"
        >
          <UserPlus className="h-5 w-5" />
          <span className="font-medium">Add User</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button className="btn-secondary flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button className="btn-secondary flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-red-600"
                  >
                    {(error as any)?.data?.message ||
                      (error as any)?.message ||
                      "Failed to load users"}
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user: User) => {
                  const fullName = `${user.firstName ?? ""} ${
                    user.lastName ?? ""
                  }`.trim();
                  const initial = fullName
                    ? fullName.charAt(0).toUpperCase()
                    : "";
                  const role = user.role ?? "";
                  const formattedRole = role
                    ? role.charAt(0).toUpperCase() + role.slice(1)
                    : "N/A";
                  const userId = user._id ?? "";

                  return (
                    <tr key={userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-600 font-medium">
                                {initial}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {fullName || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email ?? "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                            role
                          )}`}
                        >
                          {formattedRole}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.phone ?? "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            user.isActive ?? false
                          )}`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-gray-600 hover:text-gray-900"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {user.isActive ? (
                            <button
                              onClick={() => handleDeactivateUser(userId)}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Deactivate"
                              disabled={
                                actingUserId === userId ||
                                isDeactivating ||
                                isFetching
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivateUser(userId)}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Activate"
                              disabled={
                                actingUserId === userId ||
                                isActivating ||
                                isFetching
                              }
                            >
                              <UserPlus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {(() => {
              const currentPage = data?.pagination?.currentPage ?? page;
              const total = data?.pagination?.total ?? users.length;
              const start = total === 0 ? 0 : (currentPage - 1) * limit + 1;
              const end = Math.min(currentPage * limit, total);
              return (
                <>
                  Showing <span className="font-medium">{start}</span> to{" "}
                  <span className="font-medium">{end}</span> of{" "}
                  <span className="font-medium">{total}</span> results
                </>
              );
            })()}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={(data?.pagination?.currentPage ?? page) <= 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button className="px-3 py-1 bg-primary-600 text-white rounded-md text-sm font-medium">
              {data?.pagination?.currentPage ?? page}
            </button>
            <button
              onClick={() =>
                setPage((p) =>
                  Math.min(data?.pagination?.totalPages ?? p + 1, p + 1)
                )
              }
              disabled={
                (data?.pagination?.currentPage ?? page) >=
                (data?.pagination?.totalPages ?? page)
              }
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
