// StudentProfile.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  Camera,
  BookOpen,
  Hash,
} from "lucide-react";
import toast from "react-hot-toast";
import type { RootState } from "../../store";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
} from "../../store/api/authApi";

const allowedUpdates = [
  "firstName",
  "lastName",
  "phone",
  "dateOfBirth",
  "gender",
  "bloodGroup",
  "address",
  "bio",
  "emergencyContact",
];

const StudentProfile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // RTK Query hooks
  const { data: profile, refetch } = useGetProfileQuery();
  const [updateProfileMutation, { isLoading: saving }] = useUpdateProfileMutation();
  const [changePasswordMutation, { isLoading: changingPassword }] = useChangePasswordMutation();
  const [uploadAvatarMutation, { isLoading: uploadingAvatar }] = useUploadAvatarMutation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    studentId: "",
    class: "",
    section: "",
    rollNumber: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  // Populate form with user data (prefer live profile data)
  useEffect(() => {
    const src = profile || user;
    if (src) {
      setFormData({
        firstName: src.firstName || "",
        lastName: src.lastName || "",
        email: src.email || "",
        phone: src.phone || "",
        address: src.address || "",
        dateOfBirth: src.dateOfBirth
          ? new Date(src.dateOfBirth as string).toISOString().split("T")[0]
          : "",
        studentId: (src as any).studentId || "",
        class: (src as any).class || "",
        section: (src as any).section || "",
        rollNumber: (src as any).rollNumber || "",
      });
    }
  }, [profile, user]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save profile (only allowed fields)
  const handleSave = async () => {
    try {
      const filteredData: Partial<typeof formData> = {};
      Object.keys(formData).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          filteredData[key as keyof typeof formData] =
            formData[key as keyof typeof formData];
        }
      });

      await updateProfileMutation(filteredData as any).unwrap();
      // Ensure UI shows latest server data
      await refetch();
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update profile");
    }
  };

  // Cancel editing
  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        dateOfBirth: user.dateOfBirth || "",
        studentId: (user as any).studentId || "",
        class: (user as any).class || "",
        section: (user as any).section || "",
        rollNumber: (user as any).rollNumber || "",
      });
    }
    setIsEditing(false);
  };

  // Change password
  const handlePasswordChange = async () => {
    try {
      await changePasswordMutation(passwordData as any).unwrap();
      toast.success("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (error: any) {
      toast.error(error?.message || "Failed to change password");
    }
  };

  // Avatar upload
  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleAvatarSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("avatar", file);
    try {
      await uploadAvatarMutation(form).unwrap();
      await refetch();
      toast.success("Profile picture updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload avatar");
    }
  };

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name || "Student";

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Student Profile</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your academic profile and information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center justify-center space-x-2"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center justify-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border text-center">
            <div className="relative inline-block">
              {((profile as any)?.profilePicture || (user as any)?.profilePicture) ? (
                <img
                  src={(profile as any)?.profilePicture || (user as any)?.profilePicture}
                  alt="Profile"
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover mx-auto mb-4 border"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-4xl">
                    {user?.firstName?.charAt(0) || user?.name?.charAt(0) || "S"}
                  </span>
                </div>
              )}
              {isEditing && (
                <>
                  <button onClick={handleAvatarClick} className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 disabled:opacity-60" disabled={uploadingAvatar}>
                    <Camera className="h-4 w-4" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelected} />
                </>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{displayName}</h2>
            <p className="text-purple-600 capitalize font-medium">{user?.role}</p>
            <p className="text-gray-500 text-sm mt-1 break-all">{user?.email}</p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border mt-4 sm:mt-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Academic Information
            </h3>
            <div className="space-y-4">
              {[
                { label: "Student ID", icon: Hash, value: formData.studentId },
                { label: "Class", icon: BookOpen, value: formData.class },
                { label: "Section", value: formData.section },
                { label: "Roll Number", value: formData.rollNumber },
              ].map((item) => (
                <div key={item.label}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    {item.icon && <item.icon className="inline h-4 w-4 mr-1" />}
                    {item.label}
                  </label>
                  <p className="text-gray-900 py-1 sm:py-2">
                    {item.value || "Not assigned"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {[
                { label: "First Name", name: "firstName", icon: User, type: "text" },
                { label: "Last Name", name: "lastName", icon: User, type: "text" },
                { label: "Email Address", name: "email", icon: Mail, type: "email" },
                { label: "Phone Number", name: "phone", icon: Phone, type: "tel" },
                { label: "Date of Birth", name: "dateOfBirth", icon: Calendar, type: "date" },
                { label: "Address", name: "address", icon: MapPin, type: "textarea", colSpan: 2 },
              ].map((field) => (
                <div key={field.name} className={field.colSpan ? "md:col-span-2" : ""}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    {field.icon && <field.icon className="inline h-4 w-4 mr-1" />}
                    {field.label}
                  </label>
                  {isEditing ? (
                    field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    )
                  ) : (
                    <p className="text-gray-900 py-1 sm:py-2 break-words">
                      {formData[field.name as keyof typeof formData] || "Not provided"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg">
            <div className="min-w-0">
              <h4 className="font-medium text-gray-900">Change Password</h4>
              <p className="text-sm text-gray-600">Update your account password</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <input
                type="password"
                placeholder="Current"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                className="w-full sm:w-40 px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="password"
                placeholder="New"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                className="w-full sm:w-40 px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handlePasswordChange}
                disabled={changingPassword}
                className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-60"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
