/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera, Users, Heart } from 'lucide-react';
import type { RootState } from '../../store';
import toast from 'react-hot-toast';
import { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation, useUploadAvatarMutation } from '../../store/api/authApi';

const ParentProfile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // RTK Query hooks
  const { data: profile } = useGetProfileQuery();
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation();
  const [uploadAvatar, { isLoading: uploadingAvatar }] = useUploadAvatarMutation();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    occupation: '',
    emergencyContact: '',
    relationship: 'Father',
  });

  useEffect(() => {
    const src = (profile || user || {}) as Partial<{
      firstName: string; lastName: string; email: string; phone: string; address: string; dateOfBirth: string;
      occupation?: string; emergencyContact?: string; relationship?: string;
    }>;
    setFormData(prev => ({
      ...prev,
      firstName: src.firstName || '',
      lastName: src.lastName || '',
      email: src.email || '',
      phone: src.phone || '',
      address: src.address || '',
      dateOfBirth: src.dateOfBirth ? new Date(src.dateOfBirth as string).toISOString().split('T')[0] : '',
      occupation: (src.occupation as string) || prev.occupation,
      emergencyContact: (src.emergencyContact as string) || prev.emergencyContact,
      relationship: (src.relationship as string) || prev.relationship,
    }));
  }, [profile, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const allowed = ['firstName','lastName','phone','dateOfBirth','address'];
      const payload: Partial<{ firstName: string; lastName: string; phone: string; dateOfBirth: string; address: string; }> = {};
      for (const k of allowed) {
        (payload as any)[k] = (formData as any)[k];
      }
      await updateProfile(payload as any).unwrap();
      toast.success('Profile updated');
      setIsEditing(false);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    const src = (profile || user || {}) as Partial<{
      firstName: string; lastName: string; email: string; phone: string; address: string; dateOfBirth: string;
      occupation?: string; emergencyContact?: string; relationship?: string;
    }>;
    setFormData({
      firstName: src.firstName || '',
      lastName: src.lastName || '',
      email: src.email || '',
      phone: src.phone || '',
      address: src.address || '',
      dateOfBirth: src.dateOfBirth ? new Date(src.dateOfBirth as string).toISOString().split('T')[0] : '',
      occupation: (src.occupation as string) || '',
      emergencyContact: (src.emergencyContact as string) || '',
      relationship: (src.relationship as string) || 'Father',
    });
    setIsEditing(false);
  };

  const onAvatarClick = () => fileInputRef.current?.click();
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const form = new FormData();
    form.append('avatar', f);
    try {
      await uploadAvatar(form).unwrap();
      toast.success('Profile picture updated');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload');
    }
  };

  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const handlePasswordChange = async () => {
    try {
      await changePassword(passwordData as any).unwrap();
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (e: any) {
      toast.error(e?.message || 'Failed to change password');
    }
  };

  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.name || 'Parent';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parent Profile</h1>
          <p className="text-gray-600">Manage your profile and family information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center space-x-2"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center space-x-2 disabled:opacity-60"
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
        {/* Profile Picture & Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-4xl">
                    {user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'P'}
                  </span>
                </div>
                {isEditing && (
                  <>
                    <button onClick={onAvatarClick} disabled={uploadingAvatar} className="absolute bottom-0 right-0 bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700 disabled:opacity-60">
                      <Camera className="h-4 w-4" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
                  </>
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{displayName}</h2>
              <p className="text-orange-600 capitalize font-medium">{user?.role}</p>
              <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
            </div>
          </div>

          {/* Family Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Heart className="inline h-4 w-4 mr-1" />
                  Relationship
                </label>
                {isEditing ? (
                  <select
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                ) : (
                  <p className="text-gray-900 py-2">{formData.relationship}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  Occupation
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{formData.occupation || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Emergency Contact
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{formData.emergencyContact || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{formData.firstName || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{formData.lastName || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{formData.email || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{formData.phone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{formData.dateOfBirth || 'Not provided'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{formData.address || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Change Password</h4>
              <p className="text-sm text-gray-600">Update your account password</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                placeholder="Current"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="password"
                placeholder="New"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button onClick={handlePasswordChange} disabled={changingPassword} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-60">
                Change
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentProfile;
