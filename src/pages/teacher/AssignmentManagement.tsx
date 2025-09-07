import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FileText, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Search,
  Filter
} from 'lucide-react';
import { RootState, AppDispatch } from '../../store';
import { fetchAssignments, createAssignment } from '../../store/slices/academicSlice';
import { Assignment } from '../../types';
import toast from 'react-hot-toast';

const AssignmentManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { assignments } = useSelector((state: RootState) => state.academic);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock assignments data
  const mockAssignments = [
    {
      id: '1',
      title: 'Physics Lab Report - Motion Analysis',
      description: 'Complete the lab report on projectile motion experiment conducted in class.',
      subjectId: 'physics',
      classId: '10A',
      sectionId: 'A',
      teacherId: user?.id || '',
      dueDate: '2024-01-20',
      totalMarks: 50,
      attachments: ['lab_instructions.pdf'],
      createdAt: '2024-01-10',
      submissions: 25,
      totalStudents: 30,
      status: 'active'
    },
    {
      id: '2',
      title: 'Mathematics Problem Set - Calculus',
      description: 'Solve problems 1-20 from Chapter 5: Derivatives and Applications.',
      subjectId: 'math',
      classId: '11B',
      sectionId: 'B',
      teacherId: user?.id || '',
      dueDate: '2024-01-18',
      totalMarks: 100,
      attachments: [],
      createdAt: '2024-01-08',
      submissions: 28,
      totalStudents: 32,
      status: 'active'
    },
    {
      id: '3',
      title: 'English Essay - Climate Change',
      description: 'Write a 1000-word essay on the impact of climate change on global ecosystems.',
      subjectId: 'english',
      classId: '10A',
      sectionId: 'A',
      teacherId: user?.id || '',
      dueDate: '2024-01-15',
      totalMarks: 75,
      attachments: ['essay_guidelines.pdf'],
      createdAt: '2024-01-05',
      submissions: 30,
      totalStudents: 30,
      status: 'completed'
    }
  ];

  const [assignmentsList, setAssignmentsList] = useState(mockAssignments);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAssignments({ teacherId: user.id }));
    }
  }, [dispatch, user?.id]);

  const filteredAssignments = assignmentsList.filter(assignment => {
    const matchesClass = selectedClass === '' || assignment.classId === selectedClass;
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    return matchesClass && matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubmissionRate = (submissions: number, total: number) => {
    return Math.round((submissions / total) * 100);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const stats = [
    { label: 'Total Assignments', value: assignmentsList.length, color: 'bg-blue-500' },
    { label: 'Active', value: assignmentsList.filter(a => a.status === 'active').length, color: 'bg-green-500' },
    { label: 'Completed', value: assignmentsList.filter(a => a.status === 'completed').length, color: 'bg-purple-500' },
    { label: 'Overdue', value: assignmentsList.filter(a => isOverdue(a.dueDate) && a.status === 'active').length, color: 'bg-red-500' },
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
            {/* Search */}
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

            {/* Class Filter */}
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

            {/* Status Filter */}
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

          <div className="flex space-x-2">
            <button className="btn-secondary flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAssignments.map((assignment) => (
          <div key={assignment.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {assignment.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {assignment.description}
                </p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-1" />
                  <span>Class {assignment.classId}</span>
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
                <div className={`flex items-center ${isOverdue(assignment.dueDate) && assignment.status === 'active' ? 'text-red-600' : 'text-gray-600'}`}>
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    {isOverdue(assignment.dueDate) && assignment.status === 'active' ? 'Overdue' : 
                     Math.ceil((new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) + ' days left'}
                  </span>
                </div>
              </div>

              {/* Submission Progress */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Submissions</span>
                  <span className="font-medium">
                    {assignment.submissions}/{assignment.totalStudents} ({getSubmissionRate(assignment.submissions, assignment.totalStudents)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getSubmissionRate(assignment.submissions, assignment.totalStudents)}%` }}
                  />
                </div>
              </div>

              {/* Attachments */}
              {assignment.attachments && assignment.attachments.length > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Upload className="h-4 w-4 mr-1" />
                  <span>{assignment.attachments.length} attachment(s)</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button
                  className="text-primary-600 hover:text-primary-800 p-1"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  className="text-gray-600 hover:text-gray-800 p-1"
                  title="Edit Assignment"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete Assignment"
                >
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
              : 'You haven\'t created any assignments yet.'}
          </p>
          {!searchTerm && !selectedClass && statusFilter === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Your First Assignment
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;
