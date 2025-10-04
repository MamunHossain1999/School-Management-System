/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { 
  useGetSubjectsQuery, 
  useCreateSubjectMutation, 
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useGetClassesQuery 
} from '../../store/api/academicApi';
import { Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { DEFAULT_SCHOOL_ID } from '../../constants/defaults';

type Props = { classId?: string };

const SubjectsPage: React.FC<Props> = ({ classId }) => {
  const { data: subjects = [], isLoading: subjectsLoading, isError: subjectsError } = useGetSubjectsQuery(classId ? { classId } : undefined);
  const { data: classes = [], isLoading: classesLoading, isError: classesError } = useGetClassesQuery();
  
  const [createSubject] = useCreateSubjectMutation();
  const [updateSubject] = useUpdateSubjectMutation();
  const [deleteSubject] = useDeleteSubjectMutation();
  
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [classIds, setClassIds] = useState<string[]>([]);

  // Modals
  const [editModal, setEditModal] = useState<{ isOpen: boolean; subject: any | null; name: string }>(() => ({ isOpen: false, subject: null, name: '' }));
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; subject: any | null }>({ isOpen: false, subject: null });

  const isLoading = subjectsLoading || classesLoading;
  const isError = subjectsError || classesError;

  const handleCreateSubject = async () => {
    // Validation rules
    if (!name.trim()) return toast.error('Subject name is required');
    if (!code.trim()) return toast.error('Subject code is required');
    
    try {
      await createSubject({ 
        name: name.trim(), 
        code: code.trim(), 
        classIds: classIds.length > 0 ? classIds : undefined,
        credits: 3,
        type: 'core',
        schoolId: DEFAULT_SCHOOL_ID // Default school ID - backend should handle this
      }).unwrap();
      toast.success('Subject created successfully');
      setName('');
      setCode('');
      setClassIds([]);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to create subject');
    }
  };

  const handleUpdateSubject = (subject: any) => {
    setEditModal({ isOpen: true, subject, name: subject.name });
  };

  const handleDeleteSubject = (subject: any) => {
    setDeleteModal({ isOpen: true, subject });
  };

  const confirmUpdateSubject = async () => {
    if (!editModal.subject) return;
    const newName = editModal.name.trim();
    if (!newName) return toast.error('Subject name is required');
    if (newName === editModal.subject.name) {
      setEditModal({ isOpen: false, subject: null, name: '' });
      return;
    }
    try {
      await updateSubject({ id: editModal.subject._id || editModal.subject.id, data: { name: newName } }).unwrap();
      toast.success('Subject updated successfully');
      setEditModal({ isOpen: false, subject: null, name: '' });
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update subject');
    }
  };

  const confirmDeleteSubject = async () => {
    if (!deleteModal.subject) return;
    try {
      await deleteSubject(deleteModal.subject._id || deleteModal.subject.id).unwrap();
      toast.success('Subject deleted successfully');
      setDeleteModal({ isOpen: false, subject: null });
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete subject');
    }
  };

  return (
    <div className="space-y-4 p-4 min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Subjects Management {classId && `(Filtered by Class)`}
        </h1>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading subjects...</p>
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-600">Error loading subjects. Please try again.</p>
          </div>
        )}

        {/* Create Subject Form */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Create New Subject</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Subject Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Subject Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              multiple
              value={classIds}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                setClassIds(values);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
            >
              {classes.map((c: any) => (
                <option key={c._id ?? c.id} value={c._id ?? c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleCreateSubject}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Subject
            </button>
          </div>
        </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">ID</th>
            <th className="px-6 py-3 text-left">Name</th>
            <th className="px-6 py-3 text-left">Code</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {subjects.length > 0 ? (
            subjects.map((subj: any) => (
              <tr key={subj._id || subj.id}>
                <td className="px-6 py-2">{subj._id || subj.id}</td>
                <td className="px-6 py-2">{subj.name}</td>
                <td className="px-6 py-2">{subj.code || '-'}</td>
                <td className="px-6 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateSubject(subj)}
                      className="px-2 py-1 rounded-md border hover:bg-gray-50 inline-flex items-center gap-1"
                    >
                      <Edit2 className="h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subj)}
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
              <td colSpan={4} className="px-6 py-2 text-center text-gray-500">
                No subjects found.
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
              <h3 className="text-lg font-semibold text-gray-900">Edit Subject</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  value={editModal.name}
                  onChange={(e) => setEditModal(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setEditModal({ isOpen: false, subject: null, name: '' })} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button>
                <button onClick={confirmUpdateSubject} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Update</button>
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
              <h3 className="text-lg font-semibold text-gray-900">Delete Subject</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">Are you sure you want to delete the subject <strong>{deleteModal.subject?.name}</strong>? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setDeleteModal({ isOpen: false, subject: null })} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button>
                <button onClick={confirmDeleteSubject} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default SubjectsPage;
