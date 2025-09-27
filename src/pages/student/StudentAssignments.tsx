/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  Upload,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  Send,
  X,
  Search,
 
} from 'lucide-react';
import {
  useGetAssignmentsQuery,
  useGetStudentSubmissionsQuery,
  useSubmitAssignmentMutation,
  useUpdateSubmissionMutation,
  type Assignment,
  type AssignmentSubmission,
} from '../../store/api/assignmentApi';
import toast from 'react-hot-toast';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment;
  existingSubmission?: AssignmentSubmission;
}

const SubmissionModal: React.FC<SubmissionModalProps> = ({
  isOpen,
  onClose,
  assignment,
  existingSubmission,
}) => {
  const [content, setContent] = useState(existingSubmission?.content || '');
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const [submitAssignment] = useSubmitAssignmentMutation();
  const [updateSubmission] = useUpdateSubmissionMutation();

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please provide submission content');
      return;
    }

    try {
      const submissionData = {
        content,
        attachments: attachments.map(f => f.name), // In real app, upload files first
      };

      if (existingSubmission) {
        await updateSubmission({
          id: existingSubmission._id,
          data: submissionData,
        }).unwrap();
        toast.success('Submission updated successfully');
      } else {
        await submitAssignment({
          assignmentId: assignment._id,
          data: submissionData,
        }).unwrap();
        toast.success('Assignment submitted successfully');
      }
      
      onClose();
      setContent('');
      setAttachments([]);
    } catch (error) {
      toast.error('Failed to submit assignment');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {existingSubmission ? 'Update Submission' : 'Submit Assignment'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">{assignment.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <span>{assignment.totalMarks} marks</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission Content *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your submission here..."
                rows={8}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments (Optional)
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {attachments.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Selected files:</p>
                  <ul className="text-sm text-gray-700">
                    {attachments.map((file, index) => (
                      <li key={index} className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Send className="h-4 w-4 mr-2" />
              {existingSubmission ? 'Update' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentAssignments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  const { data: assignments = [], isLoading: assignmentsLoading } = useGetAssignmentsQuery({});
  const { data: submissions = [], isLoading: submissionsLoading } = useGetStudentSubmissionsQuery();

  // Create a map of submissions by assignment ID for quick lookup
  const submissionMap = submissions.reduce((acc: Record<string, AssignmentSubmission>, submission: AssignmentSubmission) => {
    acc[submission.assignment] = submission;
    return acc;
  }, {});

  const filteredAssignments = assignments.filter((assignment: Assignment) => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const submission = submissionMap[assignment._id];
    const isSubmitted = !!submission;
    const isOverdue = new Date(assignment.dueDate) < new Date();
    const isPending = !isSubmitted && !isOverdue;
    
    let matchesStatus = true;
    if (statusFilter === 'submitted') matchesStatus = isSubmitted;
    else if (statusFilter === 'pending') matchesStatus = isPending;
    else if (statusFilter === 'overdue') matchesStatus = isOverdue && !isSubmitted;
    
    return matchesSearch && matchesStatus;
  });

  const handleSubmitAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissionModal(true);
  };

  const getAssignmentStatus = (assignment: Assignment) => {
    const submission = submissionMap[assignment._id];
    const isOverdue = new Date(assignment.dueDate) < new Date();
    
    if (submission) {
      if (submission.grade !== undefined) {
        return { status: 'graded', color: 'bg-purple-100 text-purple-800', text: `Graded (${submission.grade}/${assignment.totalMarks})` };
      }
      return { status: 'submitted', color: 'bg-green-100 text-green-800', text: 'Submitted' };
    }
    
    if (isOverdue) {
      return { status: 'overdue', color: 'bg-red-100 text-red-800', text: 'Overdue' };
    }
    
    return { status: 'pending', color: 'bg-yellow-100 text-yellow-800', text: 'Pending' };
  };

  const stats = [
    {
      label: 'Total Assignments',
      value: assignments.length,
      color: 'bg-blue-500',
      icon: FileText,
    },
    {
      label: 'Submitted',
      value: submissions.length,
      color: 'bg-green-500',
      icon: CheckCircle,
    },
    {
      label: 'Pending',
      value: assignments.filter((a: Assignment) => !submissionMap[a._id] && new Date(a.dueDate) >= new Date()).length,
      color: 'bg-yellow-500',
      icon: Clock,
    },
    {
      label: 'Overdue',
      value: assignments.filter((a: Assignment) => !submissionMap[a._id] && new Date(a.dueDate) < new Date()).length,
      color: 'bg-red-500',
      icon: AlertCircle,
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
        <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
        <p className="text-gray-600">View and submit your assignments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment: Assignment) => {
          const submission = submissionMap[assignment._id];
          const status = getAssignmentStatus(assignment);
          
          return (
            <div key={assignment._id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                      {status.text}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{assignment.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      <span>{assignment.totalMarks} marks</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(assignment.dueDate) < new Date()
                          ? 'Overdue'
                          : Math.ceil((new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) + ' days left'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submission Info */}
              {submission && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Your Submission</h4>
                    <span className="text-sm text-gray-500">
                      Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{submission.content}</p>
                  {submission.grade !== undefined && (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Grade: </span>
                        <span className="text-lg font-bold text-green-600">
                          {submission.grade}/{assignment.totalMarks}
                        </span>
                      </div>
                      {submission.feedback && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Feedback: </span>
                          {submission.feedback}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  {assignment.attachments && assignment.attachments.length > 0 && (
                    <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                      <Download className="h-4 w-4 mr-1" />
                      Download Materials
                    </button>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  {submission ? (
                    <>
                      <button
                        onClick={() => handleSubmitAssignment(assignment)}
                        className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View/Edit
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleSubmitAssignment(assignment)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                      disabled={new Date(assignment.dueDate) < new Date()}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Submit Assignment
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 && (
        <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all'
              ? 'No assignments match your current filters.'
              : 'You have no assignments at the moment.'}
          </p>
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <SubmissionModal
          isOpen={showSubmissionModal}
          onClose={() => setShowSubmissionModal(false)}
          assignment={selectedAssignment}
          existingSubmission={submissionMap[selectedAssignment._id] || null}
        />
      )}
    </div>
  );
};

export default StudentAssignments;
