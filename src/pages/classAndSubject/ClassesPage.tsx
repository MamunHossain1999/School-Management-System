/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useGetClassesQuery, useCreateClassMutation } from '../../store/api/academicApi';
import toast from 'react-hot-toast';

interface ClassType {
  id: string | number;
  name: string;
}

const ClassesPage: React.FC = () => {
  const { data: classesData, isLoading, isError } = useGetClassesQuery();
  const [createClass] = useCreateClassMutation();
  const [newClassName, setNewClassName] = useState('');

  const classes: ClassType[] = classesData || [];

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return toast.error('Class name is required');
    try {
      await createClass({ name: newClassName }).unwrap();
      toast.success('Class created successfully');
      setNewClassName('');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to create class');
    }
  };

  if (isLoading) return <p>Loading classes...</p>;
  if (isError) return <p>Error loading classes.</p>;

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Classes</h1>

      <div className="flex space-x-2 mb-4">
        <input 
          type="text" 
          placeholder="New Class Name" 
          value={newClassName} 
          onChange={(e) => setNewClassName(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <button 
          onClick={handleCreateClass}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">ID</th>
            <th className="px-6 py-3 text-left">Name</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {classes.length > 0 ? (
            classes.map(cls => (
              <tr key={cls.id}>
                <td className="px-6 py-2">{cls.id}</td>
                <td className="px-6 py-2">{cls.name}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="px-6 py-2 text-center text-gray-500">
                No classes found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ClassesPage;
