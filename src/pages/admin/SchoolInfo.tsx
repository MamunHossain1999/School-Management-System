import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  School, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Save,
  Edit,
  Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SchoolInfoData {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  establishedYear: string;
  principalName: string;
  motto: string;
  description: string;
}

const SchoolInfo: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SchoolInfoData>({
    defaultValues: {
      name: 'Greenwood International School',
      address: '123 Education Street, Knowledge City, State 12345',
      phone: '+88 01795920956',
      email: 'info@greenwood.edu',
      website: 'www.greenwood.edu',
      establishedYear: '1995',
      principalName: 'Dr. Sarah Johnson',
      motto: 'Excellence in Education, Character in Life',
      description: 'Greenwood International School is committed to providing quality education that nurtures young minds and prepares them for future challenges.',
    }
  });

  const onSubmit = async (data: SchoolInfoData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Submitted school info:', data);
      toast.success('School information updated successfully');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update school information');
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">School Information</h1>
          <p className="text-gray-600">Manage your school's basic information and settings</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Edit className="h-5 w-5" />
            <span>Edit Information</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logo Section */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">School Logo</h3>
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="School Logo"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <School className="h-16 w-16 text-primary-600" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {isEditing && (
                <p className="text-sm text-gray-500">
                  Click the camera icon to upload a new logo
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Students</span>
                <span className="font-semibold">1,245</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Teachers</span>
                <span className="font-semibold">85</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Classes</span>
                <span className="font-semibold">42</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Established</span>
                <span className="font-semibold">1995</span>
              </div>
            </div>
          </div>
        </div>

        {/* Information Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School Name *
                    </label>
                    <input
                      type="text"
                      {...register('name', { required: 'School name is required' })}
                      disabled={!isEditing}
                      className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Established Year
                    </label>
                    <input
                      type="text"
                      {...register('establishedYear')}
                      disabled={!isEditing}
                      className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Principal Name
                    </label>
                    <input
                      type="text"
                      {...register('principalName')}
                      disabled={!isEditing}
                      className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School Motto
                    </label>
                    <input
                      type="text"
                      {...register('motto')}
                      disabled={!isEditing}
                      className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        {...register('phone', { required: 'Phone number is required' })}
                        disabled={!isEditing}
                        className="input-field pl-10 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                        disabled={!isEditing}
                        className="input-field pl-10 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        {...register('website')}
                        disabled={!isEditing}
                        className="input-field pl-10 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        {...register('address', { required: 'Address is required' })}
                        disabled={!isEditing}
                        rows={3}
                        className="input-field pl-10 resize-none disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <textarea
                  {...register('description')}
                  disabled={!isEditing}
                  rows={4}
                  className="input-field resize-none disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Brief description about the school..."
                />
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolInfo;
