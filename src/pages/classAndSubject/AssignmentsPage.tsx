/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useGetAssignmentsQuery, useCreateAssignmentMutation, type Assignment } from '../../store/api/assignmentApi';
import toast from 'react-hot-toast';

const AssignmentsPage: React.FC = () => {
  const { data: assignmentsData, isLoading, isError } = useGetAssignmentsQuery({});
  const [createAssignment] = useCreateAssignmentMutation();
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');

  const assignments: Assignment[] = assignmentsData || [];

  const handleCreateAssignment = async () => {
    if (!newAssignmentTitle.trim()) return toast.error('Assignment title is required');
    try {
      await createAssignment({
        title: newAssignmentTitle,
        description: 'Assignment description',
        subject: 'General',
        class: 'Class 10',
        section: 'A',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        totalMarks: 100
      }).unwrap();
      toast.success('Assignment created successfully');
      setNewAssignmentTitle('');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to create assignment');
    }
  };

  if (isLoading) return <p>Loading assignments...</p>;
  if (isError) return <p>Error loading assignments.</p>;

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Assignments</h1>

      <div className="flex space-x-2 mb-4">
        <input 
          type="text" 
          placeholder="New Assignment Title" 
          value={newAssignmentTitle} 
          onChange={(e) => setNewAssignmentTitle(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <button 
          onClick={handleCreateAssignment}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">ID</th>
            <th className="px-6 py-3 text-left">Title</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {assignments.length > 0 ? (
            assignments.map(a => (
              <tr key={a._id}>
                <td className="px-6 py-2">{a._id}</td>
                <td className="px-6 py-2">{a.title}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="px-6 py-2 text-center text-gray-500">
                No assignments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssignmentsPage;
