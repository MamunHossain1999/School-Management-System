/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import { useListUsersQuery, useCreateStudentMutation, useUpdateUserMutation, useDeactivateUserMutation } from '../../store/api/userApi';
import { Plus, Search, Edit2, Trash2, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

type FormState = {
  name: string;
  email: string;
  classId: string;
  sectionId: string;
  rollNumber: string;
};

const initialForm: FormState = { name: '', email: '', classId: '', sectionId: '', rollNumber: '' };

const StudentProfiles: React.FC = () => {
  const { data, isLoading } = useListUsersQuery({ role: 'student' });
  const [createStudent] = useCreateStudentMutation();
  const [updateStudent] = useUpdateUserMutation();
  const [deleteStudent] = useDeactivateUserMutation();

  const students = useMemo(() => data?.users ?? [], [data]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);

  const filtered = students.filter((s: any) => (s.name || '').toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setEditingId(null);
    setForm(initialForm);
    setIsOpen(true);
  };

  const openEdit = (row: any) => {
    setEditingId(row.id);
    setForm({ name: row.name || '', email: row.email || '', classId: row.classId || '', sectionId: row.sectionId || '', rollNumber: row.rollNumber || '' });
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error('Valid email is required');
    if (!form.classId) return toast.error('Class is required');
    if (!form.sectionId) return toast.error('Section is required');
    if (!form.rollNumber.trim()) return toast.error('Roll number is required');
    try {
      if (editingId) {
        await updateStudent({ id: editingId, updates: form }).unwrap();
        toast.success('Student updated');
      } else {
        await createStudent({ 
          firstName: form.name.split(' ')[0] || form.name,
          lastName: form.name.split(' ')[1] || '',
          email: form.email,
          classId: form.classId,
          sectionId: form.sectionId,
          rollNumber: form.rollNumber,
          password: 'defaultPassword123' // You should handle this properly
        }).unwrap();
        toast.success('Student created');
      }
      setIsOpen(false);
    } catch (e: any) {
      toast.error(e?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this student?')) return;
    try {
      await deleteStudent(id).unwrap();
      toast.success('Student deleted');
    } catch (e: any) {
      toast.error(e?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage all students</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Student
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center gap-2 border rounded-md px-3 py-2 max-w-sm">
          <Search className="h-4 w-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name" className="outline-none w-full" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Class</th>
              <th className="px-4 py-2">Section</th>
              <th className="px-4 py-2">Roll</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center">Loading...</td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">No students found</td></tr>
            )}
            {filtered.map((row: any) => (
              <tr key={row.id} className="border-t">
                <td className="px-4 py-2">{row.name}</td>
                <td className="px-4 py-2">{row.email}</td>
                <td className="px-4 py-2">{row.classId}</td>
                <td className="px-4 py-2">{row.sectionId}</td>
                <td className="px-4 py-2">{row.rollNumber}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(row)} className="px-2 py-1 rounded-md border hover:bg-gray-50 inline-flex items-center gap-1"><Edit2 className="h-4 w-4" /> Edit</button>
                    <button onClick={() => handleDelete(row.id)} className="px-2 py-1 rounded-md border text-red-600 hover:bg-red-50 inline-flex items-center gap-1"><Trash2 className="h-4 w-4" /> Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{editingId ? 'Edit Student' : 'Add Student'}</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-md hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Class</label>
                <input value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Section</label>
                <input value={form.sectionId} onChange={(e) => setForm({ ...form, sectionId: e.target.value })} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Roll Number</label>
                <input value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} className="w-full border rounded-md px-3 py-2" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 rounded-md border">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 rounded-md bg-blue-600 text-white inline-flex items-center gap-2"><Save className="h-4 w-4" /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfiles;
