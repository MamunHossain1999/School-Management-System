/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
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
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import type { RootState, AppDispatch } from "../../store";
import {
  updateProfile,
  changePassword,
  uploadAvatar,
} from "../../store/slices/authSlice";
import { format } from "date-fns";

const allowedUpdates = [
  "firstName",
  "lastName",
  "phone",
  "dateOfBirth",
  "gender",
  "bloodGroup",
  "address",
  "bio",
];

const AdminProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    role: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  // password show/hide toggle state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Avatar upload refs and handlers
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const onClickUpload = () => fileInputRef.current?.click();
  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      await uploadAvatar(file, dispatch);
      toast.success("Profile picture updated!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload avatar");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (user) {
      console.log("User from store:", user); // debug
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        role: user.role || "",
      });
    }
  }, [user]);

  // Optional: keep debug log of formData changes without creating a dependency loop
  useEffect(() => {
    console.log("Form data after set:", formData); // debug
  }, [formData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const filteredData: Partial<typeof formData> = {};
      Object.keys(formData).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          filteredData[key as keyof typeof formData] =
            formData[key as keyof typeof formData];
        }
      });
      await updateProfile(filteredData as any, dispatch);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        dateOfBirth: user.dateOfBirth || "",
        role: user.role || "",
      });
    }
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    try {
      await changePassword(passwordData as any, dispatch);
      toast.success("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (error: any) {
      toast.error(error?.message || "Failed to change password");
    }
  };

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name || "Admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-600">
            Manage your account information and settings
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <div className="relative inline-block">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-4xl">
                    {user?.firstName?.charAt(0) ||
                      user?.name?.charAt(0) ||
                      "A"}
                  </span>
                </div>
              )}
              {isEditing && (
                <>
                  <button
                    onClick={onClickUpload}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onFileSelected}
                    className="hidden"
                  />
                </>
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {displayName}
            </h2>
            <p className="text-blue-600 capitalize font-medium">{user?.role}</p>
            <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  label: "First Name",
                  name: "firstName",
                  icon: User,
                  type: "text",
                },
                {
                  label: "Last Name",
                  name: "lastName",
                  icon: User,
                  type: "text",
                },
                { label: "Email", name: "email", icon: Mail, type: "email" },
                { label: "Phone", name: "phone", icon: Phone, type: "tel" },
                {
                  label: "Date of Birth",
                  name: "dateOfBirth",
                  icon: Calendar,
                  type: "date",
                },
                {
                  label: "Address",
                  name: "address",
                  icon: MapPin,
                  type: "textarea",
                  colSpan: 2,
                },
              ].map((field) => (
                <div
                  key={field.name}
                  className={field.colSpan ? "md:col-span-2" : ""}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.icon && (
                      <field.icon className="inline h-4 w-4 mr-1" />
                    )}
                    {field.label}
                  </label>
                  {isEditing ? (
                    field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        value={
                          formData[field.name as keyof typeof formData] as string
                        }
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={
                          formData[field.name as keyof typeof formData] as string
                        }
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )
                  ) : (
                    <p className="text-gray-900 py-2">
                      {field.name === "dateOfBirth" && formData.dateOfBirth
                        ? format(
                            new Date(formData.dateOfBirth),
                            "dd MMM yyyy"
                          )
                        : (formData[
                            field.name as keyof typeof formData
                          ] as string) || "Not provided"}
                    </p>
                  )}
                </div>
              ))}
            </div>

            
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Account Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 flex items-center">
                <Lock className="h-4 w-4 mr-1" /> Change Password
              </h4>
              <p className="text-sm text-gray-600">
                Update your account password
              </p>
            </div>
            <div className="flex space-x-2 items-center">
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Current"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowCurrentPassword(!showCurrentPassword)
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <button
                onClick={handlePasswordChange}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
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

export default AdminProfile;
