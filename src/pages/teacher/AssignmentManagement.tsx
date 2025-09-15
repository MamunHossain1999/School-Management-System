import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  Users,
  Eye,
  Edit,
  Trash2,
  
  Upload,
  Search,
} from 'lucide-react';
import { useCreateAssignmentMutation, useGetAssignmentsQuery } from '../../store/api/assignmentApi';
import toast from 'react-hot-toast';

// Modal Component (Create Assignment)
interface CreateAssignmentData {
  title: string;
  description: string;
  class: string;
  dueDate: string;
  totalMarks: number;
}

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (assignment: CreateAssignmentData) => void;
}

const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classValue, setClassValue] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = () => {
    if (!title || !description || !classValue || !dueDate) {
      toast.error('All fields are required');
      return;
    }
    onCreate({ title, description, class: classValue, dueDate, totalMarks: 100 });
    onClose();
    setTitle('');
    setDescription('');
    setClassValue('');
    setDueDate('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create Assignment</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <select
            value={classValue}
            onChange={(e) => setClassValue(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Class</option>
            <option value="10A">Class 10-A</option>
            <option value="10B">Class 10-B</option>
            <option value="11A">Class 11-A</option>
            <option value="11B">Class 11-B</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary">Create</button>
        </div>
      </div>
    </div>
  );
};

const AssignmentManagement: React.FC = () => {
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // RTK Query hooks
  const { data: assignments = [] } = useGetAssignmentsQuery({});
  const [createAssignment] = useCreateAssignmentMutation();

  const filteredAssignments = assignments.filter(a => {
    const matchesClass = selectedClass === '' || a.class === selectedClass;
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'overdue' ? new Date(a.dueDate) < new Date() : statusFilter === 'active');
    return matchesClass && matchesSearch && matchesStatus;
  });


  const handleCreateAssignment = async (newAssignment: CreateAssignmentData) => {
    try {
      await createAssignment({
        title: newAssignment.title,
        description: newAssignment.description,
        subject: 'General', // You may want to add subject selection
        class: newAssignment.class,
        section: 'A', // You may want to add section selection
        dueDate: newAssignment.dueDate,
        totalMarks: newAssignment.totalMarks,
      }).unwrap();
      toast.success('Assignment created successfully');
    } catch {
      toast.error('Failed to create assignment');
    }
  };

  const stats = [
    { label: 'Total Assignments', value: assignments.length, color: 'bg-blue-500' },
    { label: 'Active', value: assignments.filter(a => new Date(a.dueDate) >= new Date()).length, color: 'bg-green-500' },
    { label: 'Completed', value: 0, color: 'bg-purple-500' }, // You may want to add completion tracking
    { label: 'Overdue', value: assignments.filter(a => new Date(a.dueDate) < new Date()).length, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignment Management</h1>
          <p className="text-gray-600">Create and manage assignments for your classes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Assignment</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Classes</option>
              <option value="10A">Class 10-A</option>
              <option value="10B">Class 10-B</option>
              <option value="11A">Class 11-A</option>
              <option value="11B">Class 11-B</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAssignments.map((assignment) => (
          <div key={assignment._id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{assignment.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{assignment.description}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${new Date(assignment.dueDate) < new Date() ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {new Date(assignment.dueDate) < new Date() ? 'Overdue' : 'Active'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-1" />
                  <span>Class {assignment.class}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>{assignment.totalMarks} marks</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                </div>
                <div className={`flex items-center ${new Date(assignment.dueDate) < new Date() ? 'text-red-600' : 'text-gray-600'}`}>
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    {new Date(assignment.dueDate) < new Date()
                      ? 'Overdue'
                      : Math.ceil((new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) + ' days left'}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Submissions</span>
                  <span className="font-medium">
                    0/0 (0%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: '0%' }}
                  />
                </div>
              </div>

              {assignment.attachments && assignment.attachments.length > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Upload className="h-4 w-4 mr-1" />
                  <span>{assignment.attachments.length} attachment(s)</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button className="text-primary-600 hover:text-primary-800 p-1" title="View Details">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="text-gray-600 hover:text-gray-800 p-1" title="Edit Assignment">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-800 p-1" title="Delete Assignment">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                View Submissions
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 && (
        <div className="card text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedClass || statusFilter !== 'all'
              ? 'No assignments match your current filters.'
              : "You haven't created any assignments yet."}
          </p>
          {!searchTerm && !selectedClass && statusFilter === 'all' && (
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              Create Your First Assignment
            </button>
          )}
        </div>
      )}

      {/* Create Assignment Modal */}
      <CreateAssignmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateAssignment}
      />
    </div>
  );
};

export default AssignmentManagement;
