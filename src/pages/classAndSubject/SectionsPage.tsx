/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import { 
  useGetSectionsQuery, 
  useCreateSectionMutation, 
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useGetClassesQuery 
} from '../../store/api/academicApi';
import { Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { DEFAULT_SCHOOL_ID } from '../../constants/defaults';

interface Props {
  classId?: string;
}

const SectionsPage: React.FC<Props> = ({ classId }) => {
  // All hooks must be called before any early returns
  const { data: classes = [], isLoading: classesLoading, isError: classesError } = useGetClassesQuery();
  const { data: sections = [], isLoading: sectionsLoading, isError: sectionsError } = useGetSectionsQuery(classId ? { classId } : undefined);
  
  const [createSection] = useCreateSectionMutation();
  const [updateSection] = useUpdateSectionMutation();
  const [deleteSection] = useDeleteSectionMutation();

  const [name, setName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>(classId || '');

  // Modals
  const [editModal, setEditModal] = useState<{ isOpen: boolean; section: any | null; name: string }>({ isOpen: false, section: null, name: '' });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; section: any | null }>({ isOpen: false, section: null });

  const classOptions = useMemo(() => classes.map((c: any) => ({
    id: c._id ?? c.id,
    name: c.name,
  })), [classes]);

  const isLoading = classesLoading || sectionsLoading;
  const isError = classesError || sectionsError;

  const handleCreateSection = async () => {
    if (!name.trim()) return toast.error('Section name is required');
    if (!selectedClassId) return toast.error('Valid class ID is required');

    try {
      await createSection({ 
        name: name.trim(), 
        classId: selectedClassId,
        schoolId: DEFAULT_SCHOOL_ID // Default school ID - backend should handle this
      }).unwrap();
      toast.success('Section created successfully');
      setName('');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to create section');
    }
  };

  const handleUpdateSection = (section: any) => {
    setEditModal({ isOpen: true, section, name: section.name });
  };

  const handleDeleteSection = (section: any) => {
    setDeleteModal({ isOpen: true, section });
  };

  const confirmUpdateSection = async () => {
    if (!editModal.section) return;
    const newName = editModal.name.trim();
    if (!newName) return toast.error('Section name is required');
    if (newName === editModal.section.name) {
      setEditModal({ isOpen: false, section: null, name: '' });
      return;
    }
    try {
      await updateSection({ id: editModal.section._id || editModal.section.id, data: { name: newName } }).unwrap();
      toast.success('Section updated successfully');
      setEditModal({ isOpen: false, section: null, name: '' });
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update section');
    }
  };

  const confirmDeleteSection = async () => {
    if (!deleteModal.section) return;
    try {
      await deleteSection(deleteModal.section._id || deleteModal.section.id).unwrap();
      toast.success('Section deleted successfully');
      setDeleteModal({ isOpen: false, section: null });
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete section');
    }
  };

  return (
    <div className="space-y-4 p-4 min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Sections Management {classId && `(Filtered by Class)`}
        </h1>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading sections...</p>
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-600">Error loading sections. Please try again.</p>
          </div>
        )}

        {/* Create Section Form */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Create New Section</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Section Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Class</option>
              {classOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              onClick={handleCreateSection}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Section
            </button>
          </div>
        </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">ID</th>
            <th className="px-6 py-3 text-left">Name</th>
            <th className="px-6 py-3 text-left">Class</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sections.length > 0 ? (
            sections.map((s: any) => (
              <tr key={s._id ?? s.id}>
                <td className="px-6 py-2">{s._id ?? s.id}</td>
                <td className="px-6 py-2">{s.name}</td>
                <td className="px-6 py-2">{(s.classId && (classOptions.find(c => c.id === (s.classId._id ?? s.classId))?.name)) || '-'}</td>
                <td className="px-6 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateSection(s)}
                      className="px-2 py-1 rounded-md border hover:bg-gray-50 inline-flex items-center gap-1"
                    >
                      <Edit2 className="h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSection(s)}
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
                No sections found.
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
              <h3 className="text-lg font-semibold text-gray-900">Edit Section</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
                <input
                  type="text"
                  value={editModal.name}
                  onChange={(e) => setEditModal(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setEditModal({ isOpen: false, section: null, name: '' })} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button>
                <button onClick={confirmUpdateSection} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Update</button>
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
              <h3 className="text-lg font-semibold text-gray-900">Delete Section</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">Are you sure you want to delete the section <strong>{deleteModal.section?.name}</strong>? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setDeleteModal({ isOpen: false, section: null })} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button>
                <button onClick={confirmDeleteSection} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionsPage;
