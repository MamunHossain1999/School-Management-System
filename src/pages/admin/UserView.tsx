/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetUserByIdQuery } from "../../store/api/userApi";
import {
  ArrowLeft,
  Edit as EditIcon,
  User as UserIcon,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Shield,
  BadgeCheck,
} from "lucide-react";

const Badge: React.FC<{ children: React.ReactNode; color: string }> = ({
  children,
  color,
}) => (
  <span
    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${color}`}
  >
    {children}
  </span>
);

const getRoleColor = (role?: string) => {
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

const getStatusColor = (isActive?: boolean) =>
  isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";

const UserView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUserByIdQuery(id as string, { skip: !id });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-primary-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card p-6">
        <p className="text-red-600 mb-4">
          {(error as any)?.data?.message ||
            (error as any)?.message ||
            "Failed to load user"}
        </p>
        <button className="btn-secondary" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card p-6">
        <p className="text-gray-600">User not found.</p>
        <Link to="/admin/users" className="btn-primary inline-block mt-4">
          Back to Users
        </Link>
      </div>
    );
  }

  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "N/A";
  const initial = name ? name.charAt(0).toUpperCase() : "";

  return (
    <div className="space-y-6">
      {/* Header with breadcrumb and actions */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm text-gray-500">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/admin/users" className="hover:underline">Users</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">View</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
          <p className="text-gray-600">View user profile and information</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </button>
          <Link
            to={`/admin/users/${user._id || (user as any).id}/edit`}
            className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <EditIcon className="h-4 w-4 mr-2" /> Edit
          </Link>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Profile card */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border p-6 h-full">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 text-2xl font-semibold">
                {initial || <UserIcon className="h-8 w-8 text-primary-600" />}
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">{name}</h2>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <Badge color={getRoleColor(user.role)}>
                <span className="inline-flex items-center">
                  <Shield className="h-3.5 w-3.5 mr-1" />
                  {(user.role ?? "N/A").toString().replace(/^./, (c) => c.toUpperCase())}
                </span>
              </Badge>
              <Badge color={getStatusColor(user.isActive)}>
                <span className="inline-flex items-center">
                  <BadgeCheck className="h-3.5 w-3.5 mr-1" />
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </Badge>
            </div>
            <div className="mt-4 text-sm text-gray-600 flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
            </div>
          </div>
        </div>

        {/* Right: Details card */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600 flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" /> Email
              </p>
              <p className="text-base text-gray-900">{user.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-500" /> Phone
              </p>
              <p className="text-base text-gray-900">{user.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 flex items-center">
                <Shield className="h-4 w-4 mr-2 text-gray-500" /> Role
              </p>
              <p className="text-base text-gray-900">{(user.role ?? "N/A").toString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 flex items-center">
                <BadgeCheck className="h-4 w-4 mr-2 text-gray-500" /> Status
              </p>
              <p className="text-base text-gray-900">{user.isActive ? "Active" : "Inactive"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" /> Joined
              </p>
              <p className="text-base text-gray-900">{user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" /> Updated
              </p>
              <p className="text-base text-gray-900">{(user as any)?.updatedAt ? new Date((user as any).updatedAt).toLocaleString() : "N/A"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-600 flex items-center">
                <UserIcon className="h-4 w-4 mr-2 text-gray-500" /> User ID
              </p>
              <p className="text-base text-gray-900 break-all">{user._id || (user as any).id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserView;
