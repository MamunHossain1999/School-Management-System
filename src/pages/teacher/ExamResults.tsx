import React, { useState } from 'react';
import { 
  Search, 
  Filter, 

  Edit, 
  Check, 
  X,
  Users,

 
  Award,
  TrendingUp,
  FileText
} from 'lucide-react';
import { 
  useGetExamsQuery,
  useGetExamResultsQuery,
  useSubmitResultMutation,
  useUpdateResultMutation,
  type Result,
  type SubmitResultRequest
} from '../../store/api/examApi';
import { useGetAcademicStudentsQuery } from '../../store/api/academicApi';
import { toast } from 'react-hot-toast';

const ExamResults: React.FC = () => {
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingResults, setEditingResults] = useState<Record<string, number>>({});
  const [editingRemarks, setEditingRemarks] = useState<Record<string, string>>({});

  // API hooks
  const { data: exams = [] } = useGetExamsQuery({});
  const { data: results = [], isLoading: resultsLoading, refetch } = useGetExamResultsQuery(
    selectedExam, 
    { skip: !selectedExam }
  );
  const [submitResult, { isLoading: isSubmitting }] = useSubmitResultMutation();
  const [updateResult, { isLoading: isUpdating }] = useUpdateResultMutation();

  // Get selected exam details
  const selectedExamData = exams.find(exam => exam._id === selectedExam);

  // Load students for the selected exam's class and section
  const { data: students = [], isLoading: studentsLoading } = useGetAcademicStudentsQuery(
    selectedExamData ? { classId: selectedExamData.class, sectionId: selectedExamData.section } : undefined,
    { skip: !selectedExamData }
  );

  // Minimal student shape to avoid using any
  type StudentLike = {
    _id: string;
    name?: string;
    fullName?: string;
    profile?: { name?: string; rollNumber?: string };
    user?: { name?: string };
    rollNumber?: string;
    student?: { rollNumber?: string };
    studentId?: string;
    userId?: string;
  };

  // Helpers to resolve student fields safely across possible shapes
  const getStudentName = (student: StudentLike) =>
    student?.name || student?.fullName || student?.profile?.name || student?.user?.name || 'Unknown';
  const getStudentRoll = (student: StudentLike) =>
    student?.rollNumber || student?.student?.rollNumber || student?.profile?.rollNumber || '';

  // Create results map for easy lookup
  const resultsMap = results.reduce((acc, result) => {
    acc[result.student] = result;
    return acc;
  }, {} as Record<string, Result>);

  // Filter students based on search
  const filteredStudents = (students as StudentLike[]).filter((student) => {
    const name = getStudentName(student).toLowerCase();
    const roll = String(getStudentRoll(student) || '');
    return name.includes(searchTerm.toLowerCase()) || roll.includes(searchTerm);
  });

  const calculateGrade = (marks: number, totalMarks: number) => {
    const percentage = (marks / totalMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    return 'F';
  };

  const getStatus = (marks: number, passingMarks: number) => {
    return marks >= passingMarks ? 'pass' : 'fail';
  };

  const handleSubmitResult = async (studentId: string, marks: number, remarks?: string) => {
    if (!selectedExam || !selectedExamData) return;

    const resultData: SubmitResultRequest = {
      examId: selectedExam,
      studentId,
      marksObtained: marks,
      remarks: remarks || undefined,
    };

    try {
      await submitResult(resultData).unwrap();
      toast.success('Result submitted successfully!');
      setEditingResults(prev => {
        const newState = { ...prev };
        delete newState[studentId];
        return newState;
      });
      setEditingRemarks(prev => {
        const newState = { ...prev };
        delete newState[studentId];
        return newState;
      });
      refetch();
    } catch (error) {
      toast.error('Failed to submit result');
      console.error('Error submitting result:', error);
    }
  };

  const handleUpdateResult = async (resultId: string, studentId: string, marks: number, remarks?: string) => {
    const updateData = {
      examId: selectedExam,
      studentId,
      marksObtained: marks,
      remarks: remarks || undefined,
    };

    try {
      await updateResult({ id: resultId, data: updateData }).unwrap();
      toast.success('Result updated successfully!');
      setEditingResults(prev => {
        const newState = { ...prev };
        delete newState[studentId];
        return newState;
      });
      setEditingRemarks(prev => {
        const newState = { ...prev };
        delete newState[studentId];
        return newState;
      });
      refetch();
    } catch (error) {
      toast.error('Failed to update result');
      console.error('Error updating result:', error);
    }
  };

  const startEditing = (studentId: string, currentMarks?: number, currentRemarks?: string) => {
    setEditingResults(prev => ({ ...prev, [studentId]: currentMarks || 0 }));
    setEditingRemarks(prev => ({ ...prev, [studentId]: currentRemarks || '' }));
  };

  const cancelEditing = (studentId: string) => {
    setEditingResults(prev => {
      const newState = { ...prev };
      delete newState[studentId];
      return newState;
    });
    setEditingRemarks(prev => {
      const newState = { ...prev };
      delete newState[studentId];
      return newState;
    });
  };

  // Calculate statistics
  const stats = {
    totalStudents: filteredStudents.length,
    graded: results.length,
    pending: filteredStudents.length - results.length,
    averageMarks: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.marksObtained, 0) / results.length) : 0,
    passRate: results.length > 0 ? Math.round((results.filter(r => r.status === 'pass').length / results.length) * 100) : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Exam Results</h1>
        <p className="text-gray-600">Enter and manage exam results for your classes</p>
      </div>

      {/* Exam Selection */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Exam
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="input"
            >
              <option value="">Choose an exam...</option>
              {exams.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.title} - {exam.subject} ({exam.class} - {exam.section})
                </option>
              ))}
            </select>
          </div>
          {selectedExamData && (
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                <p><strong>Date:</strong> {new Date(selectedExamData.date).toLocaleDateString()}</p>
                <p><strong>Total Marks:</strong> {selectedExamData.totalMarks}</p>
                <p><strong>Passing Marks:</strong> {selectedExamData.passingMarks}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedExam && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
                <div className="bg-blue-500 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Graded</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.graded}</p>
                </div>
                <div className="bg-green-500 p-3 rounded-lg">
                  <Check className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <div className="bg-orange-500 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Marks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageMarks}</p>
                </div>
                <div className="bg-purple-500 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.passRate}%</p>
                </div>
                <div className="bg-indigo-500 p-3 rounded-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="card">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search students by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Results Table */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Student Results</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Filter className="h-4 w-4" />
                <span>{filteredStudents.length} students</span>
              </div>
            </div>

            {studentsLoading || resultsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading students and results...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marks Obtained
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remarks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student: StudentLike) => {
                      const sid = student?._id || student?.studentId || student?.userId;
                      const result = sid ? resultsMap[sid] : undefined;
                      const isEditing = Object.prototype.hasOwnProperty.call(editingResults, student._id);
                      const currentMarks = isEditing ? editingResults[student._id] : result?.marksObtained || 0;
                      const grade = selectedExamData ? calculateGrade(currentMarks, selectedExamData.totalMarks) : '';
                      const status = selectedExamData ? getStatus(currentMarks, selectedExamData.passingMarks) : '';

                      return (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{getStudentName(student)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{getStudentRoll(student) || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editingResults[student._id]}
                                onChange={(e) => setEditingResults(prev => ({
                                  ...prev,
                                  [student._id]: parseInt(e.target.value) || 0
                                }))}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                min="0"
                                max={selectedExamData?.totalMarks}
                              />
                            ) : (
                              <div className="text-sm text-gray-900">
                                {result ? `${result.marksObtained}/${selectedExamData?.totalMarks}` : '-'}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              grade === 'A+' || grade === 'A' ? 'bg-green-100 text-green-800' :
                              grade === 'B+' || grade === 'B' ? 'bg-blue-100 text-blue-800' :
                              grade === 'C+' || grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                              grade === 'F' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {result || isEditing ? grade : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              status === 'pass' ? 'bg-green-100 text-green-800' :
                              status === 'fail' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {result || isEditing ? status : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingRemarks[student._id]}
                                onChange={(e) => setEditingRemarks(prev => ({
                                  ...prev,
                                  [student._id]: e.target.value
                                }))}
                                className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Optional remarks"
                              />
                            ) : (
                              <div className="text-sm text-gray-900 max-w-32 truncate">
                                {result?.remarks || '-'}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {isEditing ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    if (!sid) return;
                                    if (result) {
                                      handleUpdateResult(result._id, sid, editingResults[student._id], editingRemarks[student._id]);
                                    } else {
                                      handleSubmitResult(sid, editingResults[student._id], editingRemarks[student._id]);
                                    }
                                  }}
                                  disabled={isSubmitting || isUpdating}
                                  className="p-1 text-green-600 hover:text-green-900"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => cancelEditing(student._id)}
                                  className="p-1 text-red-600 hover:text-red-900"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEditing(student._id, result?.marksObtained, result?.remarks)}
                                className="p-1 text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ExamResults;
