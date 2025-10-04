import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Search,
  AlertTriangle,
} from 'lucide-react';
import {
  useGetAssignmentsQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
} from '../../store/api/assignmentApi';
import { useGetClassesQuery, useGetSubjectsQuery, useGetSectionsQuery } from '../../store/api/academicApi';
import type { Assignment } from '../../store/api/assignmentApi';
import toast from 'react-hot-toast';

const AssignmentManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    assignment: Assignment | null;
  }>({ isOpen: false, assignment: null });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    subjectId: '',
    sectionId: '',
    dueDate: '',
    totalMarks: '',
  });

  const { data: assignments = [], isLoading } = useGetAssignmentsQuery({});
  const { data: classes = [] } = useGetClassesQuery();
  // Filter subjects and sections based on selected class for better UX
  const { data: subjects = [] } = useGetSubjectsQuery(formData.classId ? { classId: formData.classId } : undefined);
  const { data: sections = [] } = useGetSectionsQuery(formData.classId ? { classId: formData.classId } : undefined);
  const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();
  const [updateAssignment, { isLoading: isUpdating }] = useUpdateAssignmentMutation();
  const [deleteAssignment, { isLoading: isDeleting }] = useDeleteAssignmentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!formData.classId) {
      toast.error('Please select a Class');
      return;
    }
    try {
      // Map to API's CreateAssignmentRequest shape
      const assignmentData = {
        title: formData.title,
        description: formData.description,
        subjectId: formData.subjectId,
        classId: formData.classId,
        sectionId: formData.sectionId,
        dueDate: formData.dueDate,
        totalMarks: parseInt(formData.totalMarks) || 100,
      };
      if (editingAssignment) {
        await updateAssignment({ id: editingAssignment._id, data: assignmentData }).unwrap();
        toast.success('Assignment updated successfully');
        setEditingAssignment(null);
      } else {
        await createAssignment(assignmentData).unwrap();
        toast.success('Assignment created successfully');
        setShowCreateForm(false);
      }
      setFormData({ title: '', description: '', classId: '', subjectId: '', sectionId: '', dueDate: '', totalMarks: '' });
    } catch {
      toast.error('Failed to save assignment');
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      classId: assignment.class || '',
      subjectId: assignment.subject || '',
      sectionId: assignment.section || '',
      dueDate: assignment.dueDate.split('T')[0],
      totalMarks: assignment.totalMarks.toString(),
    });
    setShowCreateForm(true);
  };

  const handleDeleteAssignment = (assignment: Assignment) => {
    setDeleteModal({ isOpen: true, assignment });
  };

  const confirmDeleteAssignment = async () => {
    if (!deleteModal.assignment) return;
    try {
      await deleteAssignment(deleteModal.assignment._id).unwrap();
      toast.success('Assignment deleted successfully');
      setDeleteModal({ isOpen: false, assignment: null });
    } catch {
      toast.error('Failed to delete assignment');
    }
  };

  const filteredAssignments = assignments.filter((assignment: Assignment) => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
    const aClassId = assignment.class || '';
    const matchesClass = !selectedClass || aClassId === selectedClass;
    return matchesSearch && matchesClass;
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignment Management</h1>
          <p className="text-gray-600">Create and manage assignments for your classes</p>
        </div>
        <button onClick={() => setShowCreateForm(true)} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Assignment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{assignments.filter((a: Assignment) => new Date(a.dueDate) > new Date()).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{assignments.filter((a: Assignment) => new Date(a.dueDate) < new Date()).length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input type="text" placeholder="Search assignments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">All Classes</option>
            {classes.map((cls) => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
          </select>
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Select Class</option>
                  {classes.map((cls) => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select value={formData.subjectId} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Select Subject</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <select value={formData.sectionId} onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Select Section</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>{sec.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                <input type="number" value={formData.totalMarks} onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" min="1" />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => { setShowCreateForm(false); setEditingAssignment(null); setFormData({ title: '', description: '', classId: '', subjectId: '', sectionId: '', dueDate: '', totalMarks: '' }); }} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
              <button type="submit" disabled={isCreating || isUpdating} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">{isCreating || isUpdating ? 'Saving...' : editingAssignment ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Assignments ({filteredAssignments.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.map((assignment: Assignment) => (
                <tr key={assignment._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                      <div className="text-sm text-gray-500">{assignment.description.substring(0, 100)}...</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{classes.find(c => c.id === (assignment.class || ''))?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(assignment.dueDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{assignment.totalMarks}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(assignment)} className="text-primary-600 hover:text-primary-900"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDeleteAssignment(assignment)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAssignments.length === 0 && <div className="text-center py-8 text-gray-500">No assignments found</div>}
        </div>
      </div>

      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Delete Assignment</h3>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Are you sure you want to delete the assignment <strong>"{deleteModal.assignment?.title}"</strong>? This action cannot be undone.</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setDeleteModal({ isOpen: false, assignment: null })} disabled={isDeleting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDeleteAssignment} disabled={isDeleting} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50">{isDeleting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;