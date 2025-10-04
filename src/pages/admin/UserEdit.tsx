/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from "../../store/api/userApi";
import type { User } from "../../types";
import toast from "react-hot-toast";
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Calendar,
  ArrowLeft,
  Save,
  X,
  Camera,
  CheckCircle,
  XCircle,
  AlertCircle,
  Home,
  ChevronRight,
} from "lucide-react";

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [initialForm, setInitialForm] = useState<Partial<User> | null>(null);

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
      setInitialForm({
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

  const isDirty = useMemo(() => {
    if (!initialForm) return false;
    return JSON.stringify(initialForm) !== JSON.stringify(form);
  }, [initialForm, form]);

  const errorCount = useMemo(() => Object.values(errors).filter((e) => e).length, [errors]);

  // Validation functions
  const validateField = (name: string, value: any) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return !value?.trim() ? 'This field is required' : '';
      case 'email':
        if (!value?.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      case 'phone':
        if (value && !/^[\d\s\-+()]+$/.test(value)) return 'Invalid phone format';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key as keyof typeof form]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
    const newValue = type === "checkbox" ? checked : value;
    
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800 border-red-200";
      case "teacher": return "bg-blue-100 text-blue-800 border-blue-200";
      case "student": return "bg-green-100 text-green-800 border-green-200";
      case "parent": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return Shield;
      case "teacher": return UserIcon;
      case "student": return UserIcon;
      case "parent": return UserIcon;
      default: return UserIcon;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }
    
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
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <Link to="/admin/users" className="hover:text-gray-700">Users</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">Edit User</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/admin/users")}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <UserIcon className="h-7 w-7 text-blue-600" />
                  <span>Edit User</span>
                </h1>
                <p className="text-gray-600 mt-1">Update user information and settings</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to="/admin/users"
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Link>
              <button
                form="user-edit-form"
                type="submit"
                disabled={isSaving || !isDirty}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg text-white transition-colors ${
                  isSaving || !isDirty
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? "Saving..." : isDirty ? "Save Changes" : "No Changes"}</span>
              </button>
              <span className={`text-sm ${isDirty ? 'text-orange-600' : 'text-green-600'}`}>
                {isDirty ? 'Unsaved changes' : 'All changes saved'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          {/* User Profile Card */}
          <div className="lg:col-span-1 h-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-full flex flex-col">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                    {`${form.firstName?.charAt(0) || 'U'}${form.lastName?.charAt(0) || ''}`}
                  </div>
                  <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Camera className="h-3 w-3 text-gray-600" />
                  </button>
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {`${form.firstName || ''} ${form.lastName || ''}`.trim() || 'User Name'}
                </h3>
                <p className="text-gray-500 text-sm mb-3">{form.email || 'user@example.com'}</p>
                
                {/* Role Badge */}
                {form.role && (
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(form.role as string)}`}>
                    {(() => {
                      const RoleIcon = getRoleIcon(form.role as string);
                      return <RoleIcon className="h-4 w-4" />;
                    })()}
                    <span>{String(form.role).charAt(0).toUpperCase() + String(form.role).slice(1)}</span>
                  </div>
                )}
              </div>

              {/* User Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs">Joined</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
                      {form.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-xs">Status</span>
                    </div>
                    <p className={`text-sm font-medium ${form.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {form.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-3 h-full">
            <form
              id="user-edit-form"
              onSubmit={onSubmit}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
              {errorCount > 0 && (
                <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">{errorCount} field{errorCount > 1 ? 's' : ''} need attention</p>
                      <p className="text-sm text-red-700">Please fix the highlighted fields below.</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserIcon className="inline h-4 w-4 mr-1" />
                    First Name *
                  </label>
                  <input
                    name="firstName"
                    value={form.firstName ?? ""}
                    onChange={onChange}
                    onBlur={onBlur}
                    aria-invalid={Boolean(errors.firstName && touched.firstName)}
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${
                      errors.firstName && touched.firstName
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && touched.firstName && (
                    <div className="flex items-center space-x-1 mt-1 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.firstName}</span>
                    </div>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserIcon className="inline h-4 w-4 mr-1" />
                    Last Name *
                  </label>
                  <input
                    name="lastName"
                    value={form.lastName ?? ""}
                    onChange={onChange}
                    onBlur={onBlur}
                    aria-invalid={Boolean(errors.lastName && touched.lastName)}
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${
                      errors.lastName && touched.lastName
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && touched.lastName && (
                    <div className="flex items-center space-x-1 mt-1 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.lastName}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email Address *
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email ?? ""}
                    onChange={onChange}
                    onBlur={onBlur}
                    aria-invalid={Boolean(errors.email && touched.email)}
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${
                      errors.email && touched.email
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && touched.email && (
                    <div className="flex items-center space-x-1 mt-1 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    value={form.phone ?? ""}
                    onChange={onChange}
                    onBlur={onBlur}
                    aria-invalid={Boolean(errors.phone && touched.phone)}
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${
                      errors.phone && touched.phone
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && touched.phone && (
                    <div className="flex items-center space-x-1 mt-1 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.phone}</span>
                    </div>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Shield className="inline h-4 w-4 mr-1" />
                    User Role *
                  </label>
                  <select
                    name="role"
                    value={form.role as string}
                    onChange={onChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {String(r).charAt(0).toUpperCase() + String(r).slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Toggle */}
                <div className="md:col-span-2 xl:col-span-3 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      {form.isActive ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span>Account Status</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      {form.isActive ? 'User can access the system' : 'User access is disabled'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      name="isActive"
                      type="checkbox"
                      checked={Boolean(form.isActive)}
                      onChange={onChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEdit;
