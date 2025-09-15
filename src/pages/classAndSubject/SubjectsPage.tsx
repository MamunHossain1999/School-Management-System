/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useGetSubjectsQuery, useCreateSubjectMutation } from '../../store/api/academicApi';
import toast from 'react-hot-toast';

interface SubjectType {
  id: string | number;
  name: string;
}

const SubjectsPage: React.FC = () => {
  const { data: subjectsData, isLoading, isError } = useGetSubjectsQuery();
  const [createSubject] = useCreateSubjectMutation();
  const [newSubjectName, setNewSubjectName] = useState('');

  const subjects: SubjectType[] = subjectsData || [];

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) return toast.error('Subject name is required');
    try {
      await createSubject({ name: newSubjectName }).unwrap();
      toast.success('Subject created successfully');
      setNewSubjectName('');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to create subject');
    }
  };

  if (isLoading) return <p>Loading subjects...</p>;
  if (isError) return <p>Error loading subjects.</p>;

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Subjects</h1>

      <div className="flex space-x-2 mb-4">
        <input 
          type="text" 
          placeholder="New Subject Name" 
          value={newSubjectName} 
          onChange={(e) => setNewSubjectName(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <button 
          onClick={handleCreateSubject}
          className="bg-green-600 text-white px-4 py-2 rounded"
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
          {subjects.length > 0 ? (
            subjects.map(subj => (
              <tr key={subj.id}>
                <td className="px-6 py-2">{subj.id}</td>
                <td className="px-6 py-2">{subj.name}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="px-6 py-2 text-center text-gray-500">
                No subjects found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SubjectsPage;
