/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetUserByIdQuery } from "../../store/api/userApi";

const Field: React.FC<{ label: string; value?: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div>
    <p className="text-sm font-medium text-gray-600">{label}</p>
    <p className="text-base text-gray-900">{value ?? "N/A"}</p>
  </div>
);

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
      <div className="card p-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
          <p className="text-gray-600">View user profile and information</p>
        </div>
        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
          >
            Back
          </button>
          <Link
            to={`/admin/users/${user._id || (user as any).id}/edit`}
            className="px-5 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 text-xl font-medium">
              {initial}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{name}</h2>
            <div className="flex items-center space-x-2">
              <Badge color={getRoleColor(user.role)}>
                {(user.role ?? "N/A")
                  .toString()
                  .replace(/^./, (c) => c.toUpperCase())}
              </Badge>
              <Badge color={getStatusColor(user.isActive)}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Email" value={user.email} />
          <Field label="Phone" value={user.phone} />
          <Field
            label="Joined"
            value={
              user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"
            }
          />
          <Field
            label="Updated"
            value={
              (user as any)?.updatedAt
                ? new Date((user as any).updatedAt).toLocaleString()
                : "N/A"
            }
          />
          <Field label="User ID" value={user._id || (user as any).id} />
        </div>
      </div>
    </div>
  );
};

export default UserView;
