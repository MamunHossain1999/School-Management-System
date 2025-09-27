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

interface Props {
  classId?: string;
}

const SectionsPage: React.FC<Props> = ({ classId }) => {
  const { data: classes = [], isLoading: classesLoading, isError: classesError } = useGetClassesQuery();
  const { data: sections = [], isLoading: sectionsLoading, isError: sectionsError } = useGetSectionsQuery(classId ? { classId } : undefined);
  
  const [createSection] = useCreateSectionMutation();
  const [updateSection] = useUpdateSectionMutation();
  const [deleteSection] = useDeleteSectionMutation();

  const [name, setName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>(classId || '');

  const isLoading = classesLoading || sectionsLoading;
  const isError = classesError || sectionsError;

  const classOptions = useMemo(() => classes.map((c: any) => ({
    id: c._id ?? c.id,
    name: c.name,
  })), [classes]);

  const handleCreateSection = async () => {
    if (!name.trim()) return toast.error('Section name is required');
    if (!selectedClassId) return toast.error('Valid class ID is required');

    try {
      await createSection({ name: name.trim(), classId: selectedClassId }).unwrap();
      toast.success('Section created successfully');
      setName('');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to create section');
    }
  };

  const handleUpdateSection = async (section: any) => {
    const newName = prompt('Enter new section name:', section.name);
    if (!newName || newName === section.name) return;

    try {
      await updateSection({ 
        id: section._id || section.id, 
        data: { name: newName.trim() } 
      }).unwrap();
      toast.success('Section updated successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update section');
    }
  };

  const handleDeleteSection = async (section: any) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;

    try {
      await deleteSection(section._id || section.id).unwrap();
      toast.success('Section deleted successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete section');
    }
  };

  if (isLoading) return <p>Loading sections...</p>;
  if (isError) return <p>Error loading sections.</p>;

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Sections</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <input
          type="text"
          placeholder="Section Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Class</option>
          {classOptions.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          onClick={handleCreateSection}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Add Section
        </button>
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
  );
};

export default SectionsPage;
