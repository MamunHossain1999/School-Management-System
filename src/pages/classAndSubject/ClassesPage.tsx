import React, { useState } from 'react';
import { 
  useGetClassesQuery, 
  useCreateClassMutation, 
  useUpdateClassMutation, 
  useDeleteClassMutation 
} from '../../store/api/academicApi';
import { Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Class } from '../../types';

// Extended Class type to handle API response format
interface ClassWithId extends Omit<Class, 'id'> {
  _id?: string;
  id: string;
}

const ClassesPage: React.FC = () => {
  const { data: classes = [], isLoading, isError, error } = useGetClassesQuery() as {
    data: ClassWithId[];
    isLoading: boolean;
    isError: boolean;
    error?: { data?: { message?: string }; message?: string };
  };

  // Debug information
  console.log('Classes API Debug:', {
    isLoading,
    isError,
    error,
    classesCount: classes.length,
    classesData: classes,
    apiUrl: import.meta.env.VITE_API_BASE_URL
  });

  // schoolId removed - backend will handle default school assignment

  const [createClass] = useCreateClassMutation();
  const [updateClass] = useUpdateClassMutation();
  const [deleteClass] = useDeleteClassMutation();
  
  const [newClassName, setNewClassName] = useState('');
  const [grade, setGrade] = useState<number | ''>('');
  const [academicYear, setAcademicYear] = useState('');

  // Modal states
  const [editModal, setEditModal] = useState<{ isOpen: boolean; cls: ClassWithId | null; name: string }>({ isOpen: false, cls: null, name: '' });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; cls: ClassWithId | null }>({ isOpen: false, cls: null });

  const handleCreateClass = async () => {
    // Validation matching backend rules
    if (!newClassName.trim()) return toast.error('Class name is required');
    if (grade === '' || Number.isNaN(Number(grade))) return toast.error('Grade must be a number');
    const g = Number(grade);
    if (g < 1 || g > 12) return toast.error('Grade must be between 1 and 12');
    if (!academicYear.trim()) return toast.error('Academic year is required');
    
    try {
      await createClass({ 
        name: newClassName.trim(), 
        grade: g, 
        academicYear: academicYear.trim()
        // schoolId removed - backend will assign default school
      }).unwrap();
      toast.success('Class created successfully');
      setNewClassName('');
      setGrade('');
      setAcademicYear('');
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      toast.error(error?.data?.message || error?.message || 'Failed to create class');
    }
  };

  const handleUpdateClass = (cls: ClassWithId) => {
    setEditModal({ isOpen: true, cls, name: cls.name });
  };

  const handleDeleteClass = (cls: ClassWithId) => {
    setDeleteModal({ isOpen: true, cls });
  };

  const confirmUpdateClass = async () => {
    if (!editModal.cls) return;
    const newName = editModal.name.trim();
    if (!newName) return toast.error('Class name is required');
    if (newName === editModal.cls.name) {
      setEditModal({ isOpen: false, cls: null, name: '' });
      return;
    }
    try {
      await updateClass({ id: editModal.cls._id || editModal.cls.id, data: { name: newName } }).unwrap();
      toast.success('Class updated successfully');
      setEditModal({ isOpen: false, cls: null, name: '' });
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      toast.error(error?.data?.message || error?.message || 'Failed to update class');
    }
  };

  const confirmDeleteClass = async () => {
    if (!deleteModal.cls) return;
    try {
      await deleteClass(deleteModal.cls._id || deleteModal.cls.id).unwrap();
      toast.success('Class deleted successfully');
      setDeleteModal({ isOpen: false, cls: null });
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      toast.error(error?.data?.message || error?.message || 'Failed to delete class');
    }
  };


  
 


  return (
    <div className="space-y-4 p-4 min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Classes Management</h1>

        {/* Create Class Form */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Create New Class</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="e.g., Class 1A"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade (1-12)</label>
              <input
                type="number"
                min="1"
                max="12"
                value={grade}
                onChange={(e) => setGrade(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g., 1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g., 2024-2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCreateClass}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Create Class
              </button>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading classes...</p>
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-600">
              Error loading classes: {error?.data?.message || error?.message || 'Unknown error'}
            </p>
          </div>
        )}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">ID</th>
            <th className="px-6 py-3 text-left">Name</th>
            <th className="px-6 py-3 text-left">Grade</th>
            <th className="px-6 py-3 text-left">Academic Year</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {classes && classes.length > 0 ? (
            classes.map((cls: ClassWithId) => (
              <tr key={cls._id || cls.id}>
                <td className="px-6 py-2">{cls._id || cls.id}</td>
                <td className="px-6 py-2">{cls.name}</td>
                <td className="px-6 py-2">{cls.grade || '-'}</td>
                <td className="px-6 py-2">{cls.academicYear || '-'}</td>
                <td className="px-6 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateClass(cls)}
                      className="px-2 py-1 rounded-md border hover:bg-gray-50 inline-flex items-center gap-1"
                    >
                      <Edit2 className="h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls)}
                      className="px-2 py-1 rounded-md border text-red-600 hover:bg-red-50 inline-flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-2 text-center text-gray-500">
                No classes found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Edit Class</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                  <input
                    type="text"
                    value={editModal.name}
                    onChange={(e) => setEditModal((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button onClick={() => setEditModal({ isOpen: false, cls: null, name: '' })} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button>
                  <button onClick={confirmUpdateClass} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Update</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Delete Class</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 mb-4">Are you sure you want to delete the class <strong>{deleteModal.cls?.name}</strong>? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setDeleteModal({ isOpen: false, cls: null })} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button>
                <button onClick={confirmDeleteClass} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
