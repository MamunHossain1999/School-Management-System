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
        type: 'core'
      }).unwrap();
      toast.success('Subject created successfully');
      setName('');
      setCode('');
      setClassIds([]);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to create subject');
    }
  };

  const handleUpdateSubject = async (subject: any) => {
    const newName = prompt('Enter new subject name:', subject.name);
    if (!newName || newName === subject.name) return;

    try {
      await updateSubject({ 
        id: subject._id || subject.id, 
        data: { name: newName.trim() } 
      }).unwrap();
      toast.success('Subject updated successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update subject');
    }
  };

  const handleDeleteSubject = async (subject: any) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;

    try {
      await deleteSubject(subject._id || subject.id).unwrap();
      toast.success('Subject deleted successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete subject');
    }
  };

  if (isLoading) return <p>Loading subjects...</p>;
  if (isError) return <p>Error loading subjects.</p>;

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Subjects</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <input
          type="text"
          placeholder="Subject Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Subject Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          multiple
          value={classIds}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions).map((opt) => opt.value);
            setClassIds(values);
          }}
          className="border p-2 rounded h-24"
        >
          {classes.map((c: any) => (
            <option key={c._id ?? c.id} value={c._id ?? c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleCreateSubject}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Subject
        </button>
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
  );
};

export default SubjectsPage;
