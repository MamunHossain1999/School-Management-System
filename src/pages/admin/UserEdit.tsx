/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from "../../store/api/userApi";
import type { User } from "../../types";
import toast from "react-hot-toast";

const roles: Array<User["role"] | string> = [
  "admin",
  "teacher",
  "student",
  "parent",
];

const UserEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUserByIdQuery(id as string, {
    skip: !id,
  });
  const [updateUser, { isLoading: isSaving }] = useUpdateUserMutation();

  const [form, setForm] = useState<Partial<User>>({});

  // Initialize form when user loads
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        role: user.role ?? "student",
        isActive: user.isActive ?? true,
      });
    }
  }, [user]);

  const userId = useMemo(
    () => user?._id || (user as any)?.id || id || "",
    [user, id]
  );

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      const updates: Partial<User> = {
        firstName: form.firstName?.trim() || "",
        lastName: form.lastName?.trim() || "",
        email: form.email?.trim() || "",
        phone: form.phone?.trim() || "",
        role: form.role as User["role"],
        isActive: Boolean(form.isActive),
      };
      await updateUser({ id: userId, updates }).unwrap();
      toast.success("User updated successfully");
      navigate("/admin/users");
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to update user"
      );
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
          <p className="text-gray-600">Update user information</p>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Link
            to="/admin/users"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            form="user-edit-form"
            type="submit"
            disabled={isSaving}
            className={`px-5 py-2 rounded-md text-white transition-colors cursor-pointer ${
              isSaving
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <form
        id="user-edit-form"
        onSubmit={onSubmit}
        className="card p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            name="firstName"
            value={form.firstName ?? ""}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="First name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            name="lastName"
            value={form.lastName ?? ""}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Last name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            name="email"
            type="email"
            value={form.email ?? ""}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Email"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            name="phone"
            value={form.phone ?? ""}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Phone"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            name="role"
            value={form.role as string}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {String(r).charAt(0).toUpperCase() + String(r).slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            checked={Boolean(form.isActive)}
            onChange={onChange}
            className="h-4 w-4 text-primary-600 border-gray-300 rounded"
          />
          <label
            htmlFor="isActive"
            className="text-sm font-medium text-gray-700"
          >
            Active
          </label>
        </div>
      </form>
    </div>
  );
};

export default UserEdit;
