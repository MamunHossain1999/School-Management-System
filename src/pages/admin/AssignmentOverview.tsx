/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  FileText,


  Users,
  CheckCircle,
  AlertCircle,

  Eye,
  Search,
  BarChart3,
  PieChart,
} from 'lucide-react';
import {
  useGetAssignmentsQuery,
  useGetStudentSubmissionsQuery,
} from '../../store/api/assignmentApi';
import type { Assignment, AssignmentSubmission } from '../../store/api/assignmentApi';

interface AssignmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment;
}

const AssignmentDetailsModal: React.FC<AssignmentDetailsModalProps> = ({
  isOpen,
  onClose,
  assignment,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Assignment Details</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <Eye className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">{assignment.title}</h3>
              <p className="text-gray-600">{assignment.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Class</p>
                <p className="text-lg font-semibold text-gray-900">{assignment.class}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Subject</p>
                <p className="text-lg font-semibold text-gray-900">{assignment.subject}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Total Marks</p>
                <p className="text-lg font-semibold text-gray-900">{assignment.totalMarks}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Due Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Created</p>
              <p className="text-sm text-gray-600">
                {new Date(assignment.createdAt).toLocaleDateString()} by {assignment.createdBy}
              </p>
            </div>

            {assignment.attachments && assignment.attachments.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Attachments</p>
                <div className="space-y-1">
                  {assignment.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center text-sm text-blue-600">
                      <FileText className="h-4 w-4 mr-1" />
                      <span>{attachment}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AssignmentOverview: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { data: assignments = [], isLoading: assignmentsLoading } = useGetAssignmentsQuery({});
  const { data: allSubmissions = [], isLoading: submissionsLoading } = useGetStudentSubmissionsQuery();

  // Create submission statistics
  const submissionStats = assignments.reduce((acc: any, assignment: Assignment) => {
    const assignmentSubmissions = allSubmissions.filter(
      (sub: AssignmentSubmission) => sub.assignment === assignment._id
    );
    
    acc[assignment._id] = {
      total: assignmentSubmissions.length,
      graded: assignmentSubmissions.filter((sub: AssignmentSubmission) => sub.grade !== undefined).length,
      avgGrade: assignmentSubmissions.length > 0 
        ? assignmentSubmissions
            .filter((sub: AssignmentSubmission) => sub.grade !== undefined)
            .reduce((sum: number, sub: AssignmentSubmission) => sum + (sub.grade || 0), 0) / 
          assignmentSubmissions.filter((sub: AssignmentSubmission) => sub.grade !== undefined).length
        : 0,
    };
    
    return acc;
  }, {});

  const filteredAssignments = assignments.filter((assignment: Assignment) => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === '' || assignment.class === classFilter;
    
    const isOverdue = new Date(assignment.dueDate) < new Date();
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = !isOverdue;
    else if (statusFilter === 'overdue') matchesStatus = isOverdue;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  const handleViewDetails = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowDetailsModal(true);
  };

  // Overall statistics
  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter((a: Assignment) => new Date(a.dueDate) >= new Date()).length;
  const overdueAssignments = assignments.filter((a: Assignment) => new Date(a.dueDate) < new Date()).length;
  const totalSubmissions = allSubmissions.length;
  const gradedSubmissions = allSubmissions.filter((s: AssignmentSubmission) => s.grade !== undefined).length;

  // Get unique classes
  const uniqueClasses = [...new Set(assignments.map((a: Assignment) => a.class))];

  const overallStats = [
    {
      label: 'Total Assignments',
      value: totalAssignments,
      color: 'bg-blue-500',
      icon: FileText,
    },
    {
      label: 'Active Assignments',
      value: activeAssignments,
      color: 'bg-green-500',
      icon: CheckCircle,
    },
    {
      label: 'Overdue Assignments',
      value: overdueAssignments,
      color: 'bg-red-500',
      icon: AlertCircle,
    },
    {
      label: 'Total Submissions',
      value: totalSubmissions,
      color: 'bg-purple-500',
      icon: Users,
    },
  ];

  if (assignmentsLoading || submissionsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assignment Overview</h1>
        <p className="text-gray-600">Monitor all assignments and their progress across the school</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {overallStats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Submission Rate</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Submissions</span>
              <span className="font-medium">{totalSubmissions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Graded</span>
              <span className="font-medium">{gradedSubmissions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Grading</span>
              <span className="font-medium">{totalSubmissions - gradedSubmissions}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ 
                  width: totalSubmissions > 0 ? `${(gradedSubmissions / totalSubmissions) * 100}%` : '0%' 
                }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              {totalSubmissions > 0 ? Math.round((gradedSubmissions / totalSubmissions) * 100) : 0}% graded
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Assignment Status</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <span className="font-medium">{activeAssignments}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Overdue</span>
              </div>
              <span className="font-medium">{overdueAssignments}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ 
                  width: totalAssignments > 0 ? `${(activeAssignments / totalAssignments) * 100}%` : '0%' 
                }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              {totalAssignments > 0 ? Math.round((activeAssignments / totalAssignments) * 100) : 0}% active
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Classes</option>
              {uniqueClasses.map((className) => (
                <option key={className} value={className}>
                  Class {className}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class/Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.map((assignment: Assignment) => {
                const stats = submissionStats[assignment._id] || { total: 0, graded: 0, avgGrade: 0 };
                const isOverdue = new Date(assignment.dueDate) < new Date();
                
                return (
                  <tr key={assignment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {assignment.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Class {assignment.class}</div>
                      <div className="text-sm text-gray-500">{assignment.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                      <div className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                        {isOverdue ? 'Overdue' : 
                          Math.ceil((new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) + ' days left'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {stats.graded}/{stats.total} graded
                      </div>
                      <div className="text-sm text-gray-500">
                        {stats.avgGrade > 0 ? `Avg: ${stats.avgGrade.toFixed(1)}` : 'No grades yet'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isOverdue
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {isOverdue ? 'Overdue' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(assignment)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAssignments.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Found</h3>
            <p className="text-gray-600">
              {searchTerm || classFilter || statusFilter !== 'all'
                ? 'No assignments match your current filters.'
                : 'No assignments have been created yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Assignment Details Modal */}
      {selectedAssignment && (
        <AssignmentDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          assignment={selectedAssignment}
        />
      )}
    </div>
  );
};

export default AssignmentOverview;
