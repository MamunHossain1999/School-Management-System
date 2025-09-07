import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Award,
  Edit,
  Save,
  X,
  Check,
  Filter,
  Download,
  Search,
  Calculator
} from 'lucide-react';
import { RootState, AppDispatch } from '../../store';
import { fetchResults, updateResult } from '../../store/slices/examSlice';
import toast from 'react-hot-toast';

interface StudentGrade {
  id: string;
  name: string;
  rollNumber: string;
  subjects: {
    [key: string]: {
      marks: number;
      totalMarks: number;
      grade: string;
    };
  };
  totalMarks: number;
  totalPossible: number;
  percentage: number;
  overallGrade: string;
  rank: number;
}

const GradeManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCell, setEditingCell] = useState<{studentId: string, subject: string} | null>(null);
  const [tempValue, setTempValue] = useState('');

  // Mock data
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology'];
  const exams = [
    { id: '1', name: 'Mid Term Exam', date: '2024-01-15' },
    { id: '2', name: 'Final Exam', date: '2024-03-15' },
    { id: '3', name: 'Unit Test 1', date: '2024-01-05' },
  ];

  const [students, setStudents] = useState<StudentGrade[]>([
    {
      id: '1',
      name: 'John Smith',
      rollNumber: '001',
      subjects: {
        Mathematics: { marks: 85, totalMarks: 100, grade: 'A' },
        Physics: { marks: 78, totalMarks: 100, grade: 'B+' },
        Chemistry: { marks: 92, totalMarks: 100, grade: 'A+' },
        English: { marks: 88, totalMarks: 100, grade: 'A' },
        Biology: { marks: 81, totalMarks: 100, grade: 'A-' },
      },
      totalMarks: 424,
      totalPossible: 500,
      percentage: 84.8,
      overallGrade: 'A',
      rank: 2
    },
    {
      id: '2',
      name: 'Emma Johnson',
      rollNumber: '002',
      subjects: {
        Mathematics: { marks: 95, totalMarks: 100, grade: 'A+' },
        Physics: { marks: 89, totalMarks: 100, grade: 'A' },
        Chemistry: { marks: 94, totalMarks: 100, grade: 'A+' },
        English: { marks: 91, totalMarks: 100, grade: 'A+' },
        Biology: { marks: 87, totalMarks: 100, grade: 'A' },
      },
      totalMarks: 456,
      totalPossible: 500,
      percentage: 91.2,
      overallGrade: 'A+',
      rank: 1
    },
    {
      id: '3',
      name: 'Michael Brown',
      rollNumber: '003',
      subjects: {
        Mathematics: { marks: 72, totalMarks: 100, grade: 'B' },
        Physics: { marks: 68, totalMarks: 100, grade: 'B-' },
        Chemistry: { marks: 75, totalMarks: 100, grade: 'B+' },
        English: { marks: 79, totalMarks: 100, grade: 'B+' },
        Biology: { marks: 73, totalMarks: 100, grade: 'B' },
      },
      totalMarks: 367,
      totalPossible: 500,
      percentage: 73.4,
      overallGrade: 'B',
      rank: 3
    },
  ]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.includes(searchTerm)
  );

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'text-green-700 bg-green-100';
      case 'A': return 'text-green-600 bg-green-50';
      case 'A-': return 'text-blue-600 bg-blue-50';
      case 'B+': return 'text-blue-500 bg-blue-50';
      case 'B': return 'text-yellow-600 bg-yellow-50';
      case 'B-': return 'text-yellow-500 bg-yellow-50';
      case 'C+': return 'text-orange-600 bg-orange-50';
      case 'C': return 'text-orange-500 bg-orange-50';
      case 'D': return 'text-red-500 bg-red-50';
      case 'F': return 'text-red-700 bg-red-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const calculateGrade = (percentage: number) => {
    if (percentage >= 95) return 'A+';
    if (percentage >= 90) return 'A';
    if (percentage >= 85) return 'A-';
    if (percentage >= 80) return 'B+';
    if (percentage >= 75) return 'B';
    if (percentage >= 70) return 'B-';
    if (percentage >= 65) return 'C+';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const handleEditStart = (studentId: string, subject: string, currentMarks: number) => {
    setEditingCell({ studentId, subject });
    setTempValue(currentMarks.toString());
  };

  const handleEditSave = (studentId: string, subject: string) => {
    const marks = parseInt(tempValue);
    if (isNaN(marks) || marks < 0 || marks > 100) {
      toast.error('Please enter valid marks (0-100)');
      return;
    }

    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        const updatedSubjects = {
          ...student.subjects,
          [subject]: {
            ...student.subjects[subject],
            marks,
            grade: calculateGrade((marks / student.subjects[subject].totalMarks) * 100)
          }
        };

        const totalMarks = Object.values(updatedSubjects).reduce((sum, sub) => sum + sub.marks, 0);
        const percentage = (totalMarks / student.totalPossible) * 100;

        return {
          ...student,
          subjects: updatedSubjects,
          totalMarks,
          percentage,
          overallGrade: calculateGrade(percentage)
        };
      }
      return student;
    }));

    setEditingCell(null);
    setTempValue('');
    toast.success('Marks updated successfully');
  };

  const handleEditCancel = () => {
    setEditingCell(null);
    setTempValue('');
  };

  const classStats = {
    totalStudents: students.length,
    averagePercentage: students.reduce((sum, student) => sum + student.percentage, 0) / students.length,
    highestScore: Math.max(...students.map(s => s.percentage)),
    lowestScore: Math.min(...students.map(s => s.percentage)),
    passRate: (students.filter(s => s.percentage >= 50).length / students.length) * 100
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grade Management</h1>
          <p className="text-gray-600">Manage and track student grades and performance</p>
        </div>
        <div className="flex space-x-2">
          <button className="btn-secondary flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Grade Calculator</span>
          </button>
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Class Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{classStats.totalStudents}</div>
          <div className="text-sm text-gray-600">Total Students</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{classStats.averagePercentage.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Class Average</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{classStats.highestScore.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Highest Score</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">{classStats.lowestScore.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Lowest Score</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">{classStats.passRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Pass Rate</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input-field"
            >
              <option value="">Select Class</option>
              <option value="10A">Class 10-A</option>
              <option value="10B">Class 10-B</option>
              <option value="11A">Class 11-A</option>
              <option value="11B">Class 11-B</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exam</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="input-field"
            >
              <option value="">Select Exam</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject Filter</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input-field"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                {subjects.map(subject => (
                  <th key={subject} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {subject}
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary-600 font-medium text-sm">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">Roll: {student.rollNumber}</div>
                      </div>
                    </div>
                  </td>
                  
                  {subjects.map(subject => (
                    <td key={subject} className="px-6 py-4 whitespace-nowrap text-center">
                      {editingCell?.studentId === student.id && editingCell?.subject === subject ? (
                        <div className="flex items-center justify-center space-x-1">
                          <input
                            type="number"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                            min="0"
                            max="100"
                            autoFocus
                          />
                          <button
                            onClick={() => handleEditSave(student.id, subject)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <button
                            onClick={() => handleEditStart(student.id, subject, student.subjects[subject].marks)}
                            className="flex items-center justify-center space-x-1 hover:bg-gray-100 rounded px-2 py-1 w-full"
                          >
                            <span className="text-sm font-medium">
                              {student.subjects[subject].marks}/{student.subjects[subject].totalMarks}
                            </span>
                            <Edit className="h-3 w-3 text-gray-400" />
                          </button>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(student.subjects[subject].grade)}`}>
                            {student.subjects[subject].grade}
                          </span>
                        </div>
                      )}
                    </td>
                  ))}
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {student.totalMarks}/{student.totalPossible}
                      </div>
                      <div className="text-sm text-gray-600">
                        {student.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getGradeColor(student.overallGrade)}`}>
                      {student.overallGrade}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center">
                      {student.rank === 1 && <Award className="h-4 w-4 text-yellow-500 mr-1" />}
                      <span className="text-sm font-medium text-gray-900">#{student.rank}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="card text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'No students match your search criteria.' : 'No students available for grading.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default GradeManagement;
