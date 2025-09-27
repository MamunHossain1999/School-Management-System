/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  User,
  CheckCircle,
  Edit,
  Save,
  X,
  Search,
  Download,
  MessageSquare,
} from 'lucide-react';
import {
  useGetAssignmentsQuery,
  useGetAssignmentSubmissionsQuery,
  useGradeSubmissionMutation,
} from '../../store/api/assignmentApi';
import type { Assignment, AssignmentSubmission } from '../../store/api/assignmentApi';
import toast from 'react-hot-toast';

interface GradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: AssignmentSubmission;
  assignment: Assignment;
}

const GradingModal: React.FC<GradingModalProps> = ({
  isOpen,
  onClose,
  submission,
  assignment,
}) => {
  const [grade, setGrade] = useState(submission.grade?.toString() || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');
  
  const [gradeSubmission] = useGradeSubmissionMutation();

  const handleSubmit = async () => {
    const gradeNum = parseInt(grade);
    
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > assignment.totalMarks) {
      toast.error(`Grade must be between 0 and ${assignment.totalMarks}`);
      return;
    }

    try {
      await gradeSubmission({
        id: submission._id,
        data: {
          grade: gradeNum,
          feedback: feedback.trim() || undefined,
        },
      }).unwrap();
      
      toast.success('Submission graded successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to grade submission');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Grade Submission</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assignment Info */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">{assignment.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>Total: {assignment.totalMarks} marks</span>
                </div>
              </div>

              {/* Student Submission */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Student Submission</h4>
                  <span className="text-sm text-gray-500">
                    Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content:
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 max-h-60 overflow-y-auto">
                      {submission.content}
                    </div>
                  </div>

                  {submission.attachments && submission.attachments.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Attachments:
                      </label>
                      <div className="space-y-1">
                        {submission.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center text-sm text-blue-600">
                            <FileText className="h-4 w-4 mr-1" />
                            <button className="hover:underline">{attachment}</button>
                            <Download className="h-4 w-4 ml-1" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Grading Section */}
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4">Grade & Feedback</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade (out of {assignment.totalMarks}) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={assignment.totalMarks}
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter grade"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback (Optional)
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide feedback to the student..."
                      rows={6}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {submission.grade !== undefined && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Current Grade:</strong> {submission.grade}/{assignment.totalMarks}
                      </p>
                      {submission.feedback && (
                        <p className="text-sm text-blue-700 mt-1">
                          <strong>Previous Feedback:</strong> {submission.feedback}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
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
                  <Save className="h-4 w-4 mr-2" />
                  Save Grade
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AssignmentGrading: React.FC = () => {
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [selectedAssignmentData, setSelectedAssignmentData] = useState<Assignment | null>(null);
  const [showGradingModal, setShowGradingModal] = useState(false);

  const { data: assignments = [], isLoading: assignmentsLoading } = useGetAssignmentsQuery({});
  const { data: submissions = [], isLoading: submissionsLoading } = useGetAssignmentSubmissionsQuery(
    selectedAssignment,
    { skip: !selectedAssignment }
  );

  const filteredSubmissions = submissions.filter((submission: AssignmentSubmission) => {
    const matchesSearch = searchTerm === '' || 
      submission.student.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'graded') matchesStatus = submission.grade !== undefined;
    else if (statusFilter === 'ungraded') matchesStatus = submission.grade === undefined;
    
    return matchesSearch && matchesStatus;
  });

  const handleGradeSubmission = (submission: AssignmentSubmission) => {
    const assignment = assignments.find((a: Assignment) => a._id === selectedAssignment);
    if (assignment) {
      setSelectedSubmission(submission);
      setSelectedAssignmentData(assignment);
      setShowGradingModal(true);
    }
  };

  const getSubmissionStats = () => {
    const total = submissions.length;
    const graded = submissions.filter((s: AssignmentSubmission) => s.grade !== undefined).length;
    const ungraded = total - graded;
    const avgGrade = graded > 0 
      ? submissions
          .filter((s: AssignmentSubmission) => s.grade !== undefined)
          .reduce((sum: number, s: AssignmentSubmission) => sum + (s.grade || 0), 0) / graded
      : 0;

    return { total, graded, ungraded, avgGrade };
  };

  const stats = getSubmissionStats();

  if (assignmentsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assignment Grading</h1>
        <p className="text-gray-600">Grade student submissions and provide feedback</p>
      </div>

      {/* Assignment Selection */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Assignment
            </label>
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose an assignment...</option>
              {assignments.map((assignment: Assignment) => (
                <option key={assignment._id} value={assignment._id}>
                  {assignment.title} - {assignment.class} ({assignment.totalMarks} marks)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedAssignment && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-blue-500 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Graded</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.graded}</p>
                </div>
                <div className="bg-green-500 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.ungraded}</p>
                </div>
                <div className="bg-yellow-500 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Grade</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.avgGrade > 0 ? stats.avgGrade.toFixed(1) : '-'}
                  </p>
                </div>
                <div className="bg-purple-500 p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
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
                    placeholder="Search by student..."
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
                  <option value="all">All Submissions</option>
                  <option value="graded">Graded</option>
                  <option value="ungraded">Ungraded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submissions List */}
          {submissionsLoading ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSubmissions.map((submission: AssignmentSubmission) => (
                      <tr key={submission._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {submission.student}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            submission.grade !== undefined
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {submission.grade !== undefined ? 'Graded' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {submission.grade !== undefined ? (
                            <span className="font-medium">
                              {submission.grade}/{selectedAssignmentData?.totalMarks}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleGradeSubmission(submission)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Grade Submission"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredSubmissions.length === 0 && (
                <div className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Found</h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== 'all'
                      ? 'No submissions match your current filters.'
                      : 'No submissions have been received for this assignment yet.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!selectedAssignment && (
        <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Assignment</h3>
          <p className="text-gray-600">
            Choose an assignment from the dropdown above to view and grade submissions.
          </p>
        </div>
      )}

      {/* Grading Modal */}
      {showGradingModal && selectedSubmission && selectedAssignmentData && (
        <GradingModal
          isOpen={showGradingModal}
          onClose={() => setShowGradingModal(false)}
          submission={selectedSubmission}
          assignment={selectedAssignmentData}
        />
      )}
    </div>
  );
};

export default AssignmentGrading;
