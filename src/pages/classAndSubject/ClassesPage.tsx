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
  const { data: classes = [], isLoading, isError } = useGetClassesQuery() as {
    data: ClassWithId[];
    isLoading: boolean;
    isError: boolean;
  };

  const [createClass] = useCreateClassMutation();
  const [updateClass] = useUpdateClassMutation();
  const [deleteClass] = useDeleteClassMutation();
  
  const [newClassName, setNewClassName] = useState('');
  const [grade, setGrade] = useState<number | ''>('');
  const [academicYear, setAcademicYear] = useState('');

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

  const handleUpdateClass = async (cls: ClassWithId) => {
    const newName = prompt('Enter new class name:', cls.name);
    if (!newName || newName === cls.name) return;

    try {
      await updateClass({ 
        id: cls._id || cls.id, 
        data: { name: newName.trim() } 
      }).unwrap();
      toast.success('Class updated successfully');
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      toast.error(error?.data?.message || error?.message || 'Failed to update class');
    }
  };

  const handleDeleteClass = async (cls: ClassWithId) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;

    try {
      await deleteClass(cls._id || cls.id).unwrap();
      toast.success('Class deleted successfully');
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      toast.error(error?.data?.message || error?.message || 'Failed to delete class');
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading classes...</p>
      </div>
    </div>
  );
  
  if (isError) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <p className="text-lg text-red-600">Error loading classes!</p>
        <p className="text-sm text-gray-500 mt-2">Please check your internet connection and try again.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 p-4 min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Classes Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <input
          type="text"
          placeholder="Class Name"
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="number"
          min={1}
          max={12}
          placeholder="Grade (1-12)"
          value={grade}
          onChange={(e) => setGrade(e.target.value ? Number(e.target.value) : '')}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Academic Year (e.g., 2024-2025)"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={handleCreateClass}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Class
        </button>
      </div>

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
          {classes.length > 0 ? (
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
    </div>
  );
};

export default ClassesPage;
