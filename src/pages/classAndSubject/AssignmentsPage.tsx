/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useGetAssignmentsQuery, useCreateAssignmentMutation, useUpdateAssignmentMutation, useDeleteAssignmentMutation, type Assignment } from '../../store/api/assignmentApi';
import { useGetClassesQuery, useGetSubjectsQuery } from '../../store/api/academicApi';
import { Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AssignmentsPage: React.FC = () => {
  const { data: assignmentsData, isLoading: assignmentsLoading, isError: assignmentsError } = useGetAssignmentsQuery({});
  const { data: classes = [], isLoading: classesLoading } = useGetClassesQuery();
  const { data: subjects = [], isLoading: subjectsLoading } = useGetSubjectsQuery();
  
  const [createAssignment] = useCreateAssignmentMutation();
  const [updateAssignment] = useUpdateAssignmentMutation();
  const [deleteAssignment] = useDeleteAssignmentMutation();
  
  // Form state
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [section, setSection] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; assignment: Assignment | null; isProcessing: boolean }>({ isOpen: false, assignment: null, isProcessing: false });

  const assignments: Assignment[] = assignmentsData || [];
  const isLoading = assignmentsLoading || classesLoading || subjectsLoading;
  const isError = assignmentsError;

  // Debug logging
  console.log('Assignments API Debug:', {
    assignmentsLoading,
    assignmentsError,
    assignmentsData,
    assignmentsCount: assignments.length,
    assignments: assignments
  });

  const handleCreateAssignment = async () => {
    if (!title.trim()) return toast.error('Assignment title is required');
    if (!description.trim()) return toast.error('Assignment description is required');
    if (!selectedSubject) return toast.error('Subject is required');
    if (!selectedClass) return toast.error('Class is required');
    if (!dueDate) return toast.error('Due date is required');
    
    try {
      await createAssignment({
        title: title.trim(),
        description: description.trim(),
        subjectId: selectedSubject,
        classId: selectedClass,
        sectionId: section || 'A',
        dueDate: new Date(dueDate).toISOString(),
        totalMarks: totalMarks
      }).unwrap();
      toast.success('Assignment created successfully');
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedSubject('');
      setSelectedClass('');
      setSection('');
      setDueDate('');
      setTotalMarks(100);
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to create assignment');
    }
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setTitle(assignment.title);
    setDescription(assignment.description);
    // Resolve IDs in case existing assignment stores names instead of IDs
    const resolveId = (items: any[], value?: string) => {
      if (!value) return '';
      const direct = items.find((i) => i?._id === value || i?.id === value);
      if (direct) return direct._id || direct.id;
      const byName = items.find((i) => i?.name === value);
      return byName ? (byName._id || byName.id) : '';
    };
    setSelectedSubject(resolveId(subjects as any[], assignment.subject));
    setSelectedClass(resolveId(classes as any[], assignment.class));
    setSection(assignment.section || '');
    setDueDate(assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : '');
    setTotalMarks(assignment.totalMarks);
  };

  const handleUpdateAssignment = async () => {
    if (!editingAssignment) return;
    if (!title.trim()) return toast.error('Assignment title is required');
    if (!description.trim()) return toast.error('Assignment description is required');
    
    try {
      await updateAssignment({
        id: editingAssignment._id,
        data: {
          title: title.trim(),
          description: description.trim(),
          subjectId: selectedSubject,
          classId: selectedClass,
          sectionId: section || 'A',
          dueDate: new Date(dueDate).toISOString(),
          totalMarks: totalMarks
        }
      }).unwrap();
      toast.success('Assignment updated successfully');
      
      // Reset form
      setEditingAssignment(null);
      setTitle('');
      setDescription('');
      setSelectedSubject('');
      setSelectedClass('');
      setSection('');
      setDueDate('');
      setTotalMarks(100);
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to update assignment');
    }
  };

  const handleDeleteAssignment = (assignment: Assignment) => {
    setDeleteModal({ isOpen: true, assignment, isProcessing: false });
  };

  const confirmDeleteAssignment = async () => {
    if (!deleteModal.assignment) return;
    try {
      setDeleteModal(prev => ({ ...prev, isProcessing: true }));
      await deleteAssignment(deleteModal.assignment._id).unwrap();
      toast.success('Assignment deleted successfully');
      setDeleteModal({ isOpen: false, assignment: null, isProcessing: false });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete assignment');
      setDeleteModal(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleCancelEdit = () => {
    setEditingAssignment(null);
    setTitle('');
    setDescription('');
    setSelectedSubject('');
    setSelectedClass('');
    setSection('');
    setDueDate('');
    setTotalMarks(100);
  };

  return (
    <div className="space-y-4 p-4 min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Assignment Management</h1>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading assignments...</p>
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-600">Error loading assignments. Please try again.</p>
          </div>
        )}

        {/* Create/Edit Assignment Form */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">
            {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                placeholder="Assignment Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Subject</option>
                {subjects.map((subject: any) => (
                  <option key={subject._id || subject.id} value={subject._id || subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Class</option>
                {classes.map((cls: any) => (
                  <option key={cls._id || cls.id} value={cls._id || cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <input
                type="text"
                placeholder="Section (e.g., A, B, C)"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
              <input
                type="number"
                min="1"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              placeholder="Assignment Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={editingAssignment ? handleUpdateAssignment : handleCreateAssignment}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
            </button>
            {editingAssignment && (
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Assignments Table */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments && assignments.length > 0 ? (
              assignments.map(a => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{a.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{a.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {a.teacherId ? `${a.teacherId.firstName} ${a.teacherId.lastName}` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(a.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{a.totalMarks}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      a.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      a.status === 'published' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {a.status || 'draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditAssignment(a)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Edit Assignment"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteAssignment(a)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Delete Assignment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  {isError ? 'Error loading assignments. Please try again.' : 'No assignments found. Create your first assignment above.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Delete Assignment</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">Are you sure you want to delete the assignment <strong>{deleteModal.assignment?.title}</strong>? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => !deleteModal.isProcessing && setDeleteModal({ isOpen: false, assignment: null, isProcessing: false })}
                  disabled={deleteModal.isProcessing}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAssignment}
                  disabled={deleteModal.isProcessing}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-60"
                >
                  {deleteModal.isProcessing ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
