import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Award, Edit, X, Check, Download, Search, Calculator,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  useGetExamsQuery, useGetResultsQuery, useUpdateResultMutation,
  type Exam 
} from '../../store/api/examApi';
import { useGetClassesQuery, useGetSubjectsQuery } from '../../store/api/academicApi';
import { useListUsersQuery } from '../../store/api/userApi';
import type { Student } from '../../types';

interface StudentGrade {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  subjects: Record<string, { marks: number; totalMarks: number; grade: string; resultId?: string }>;
  totalMarks: number;
  totalPossible: number;
  percentage: number;
  overallGrade: string;
  rank: number;
}

const GradeManagement: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCell, setEditingCell] = useState<{studentId: string, subject: string} | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [processedStudents, setProcessedStudents] = useState<StudentGrade[]>([]);

  // API queries
  const { data: classes = [], isLoading: classesLoading } = useGetClassesQuery();
  const { data: subjects = [], isLoading: subjectsLoading } = useGetSubjectsQuery({ classId: selectedClass }, { skip: !selectedClass });
  const { data: exams = [] } = useGetExamsQuery({ classId: selectedClass, isActive: true }, { skip: !selectedClass });
  const { data: studentsData } = useListUsersQuery({ role: 'student' });
  const students = useMemo(() => (studentsData?.users || []) as unknown as Student[], [studentsData?.users]);
  const { data: results = [] } = useGetResultsQuery({ classId: selectedClass });
  const [updateResult] = useUpdateResultMutation();

  // Grade calculation
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

  // Process students + results
  useEffect(() => {
    if (students.length && results.length && subjects.length) {
      const processed: StudentGrade[] = students.map(student => {
        const studentResults = results.filter(r => r.student === student._id);
        const studentSubjects: Record<string, { marks: number; totalMarks: number; grade: string; resultId?: string }> = {};
        let totalMarks = 0, totalPossible = 0;

        subjects.forEach(subject => {
          const subjectResult = studentResults.find(r => {
            const examSubject = typeof r.exam === 'string' ? r.exam : (r.exam as Exam)?.subject;
            return examSubject === subject.id || examSubject === subject.name;
          });

          const marks = subjectResult?.marksObtained || 0;
          const maxMarks = typeof subjectResult?.exam === 'object' ? (subjectResult.exam as Exam).totalMarks : 100;
          studentSubjects[subject.name] = { marks, totalMarks: maxMarks, grade: calculateGrade((marks / maxMarks) * 100), resultId: subjectResult?._id };
          totalMarks += marks;
          totalPossible += maxMarks;
        });

        const overallPercentage = totalPossible > 0 ? (totalMarks / totalPossible) * 100 : 0;

        return {
          id: student._id,
          name: `${student.firstName} ${student.lastName}`,
          rollNumber: student.rollNumber || 'N/A',
          email: student.email,
          subjects: studentSubjects,
          totalMarks,
          totalPossible,
          percentage: overallPercentage,
          overallGrade: calculateGrade(overallPercentage),
          rank: 0
        };
      }).sort((a, b) => b.percentage - a.percentage)
        .map((s, i) => ({ ...s, rank: i + 1 }));

      setProcessedStudents(processed);
    }
  }, [students, results, subjects]);

  const filteredStudents = processedStudents.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber.includes(searchTerm)
  );

  const handleEditStart = (studentId: string, subject: string, currentMarks: number) => {
    setEditingCell({ studentId, subject });
    setTempValue(currentMarks.toString());
  };

  const handleEditSave = async (studentId: string, subject: string) => {
    const marks = parseInt(tempValue);
    if (isNaN(marks) || marks < 0 || marks > 100) return toast.error('Enter valid marks (0-100)');

    try {
      const student = processedStudents.find(s => s.id === studentId);
      const subjectData = student?.subjects[subject];
      if (subjectData?.resultId) {
        await updateResult({ id: subjectData.resultId, data: { marksObtained: marks } }).unwrap();
        toast.success('Marks updated');
      }
    } catch {
      toast.error('Failed to update marks');
    }

    setProcessedStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updatedSubjects = { ...s.subjects, [subject]: { ...s.subjects[subject], marks, grade: calculateGrade((marks / s.subjects[subject].totalMarks) * 100) } };
        const totalMarks = Object.values(updatedSubjects).reduce((sum, sub) => sum + sub.marks, 0);
        const overallPercentage = (totalMarks / s.totalPossible) * 100;
        return { ...s, subjects: updatedSubjects, totalMarks, percentage: overallPercentage, overallGrade: calculateGrade(overallPercentage) };
      }
      return s;
    }));

    setEditingCell(null);
    setTempValue('');
  };

  const handleEditCancel = () => { setEditingCell(null); setTempValue(''); };

  const classStats = {
    totalStudents: filteredStudents.length,
    averagePercentage: filteredStudents.reduce((sum, s) => sum + s.percentage, 0) / (filteredStudents.length || 1),
    highestScore: Math.max(...filteredStudents.map(s => s.percentage), 0),
    lowestScore: Math.min(...filteredStudents.map(s => s.percentage), 0),
    passRate: (filteredStudents.filter(s => s.percentage >= 50).length / (filteredStudents.length || 1)) * 100
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grade Management</h1>
          <p className="text-gray-600">Manage and track student grades</p>
        </div>
        <div className="flex space-x-2">
          <button className="btn-secondary flex items-center space-x-2"><Calculator className="h-4 w-4" /><span>Calculator</span></button>
          <button className="btn-secondary flex items-center space-x-2"><Download className="h-4 w-4" /><span>Export</span></button>
        </div>
      </div>

      {/* Class Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {['Total Students','Class Avg','Highest','Lowest','Pass Rate'].map((label, i) => (
          <div key={i} className="card text-center">
            <div className="text-2xl font-bold text-gray-900">
              {i===0 ? classStats.totalStudents : i===1 ? classStats.averagePercentage.toFixed(1)+'%' : i===2 ? classStats.highestScore.toFixed(1)+'%' : i===3 ? classStats.lowestScore.toFixed(1)+'%' : classStats.passRate.toFixed(1)+'%'}
            </div>
            <div className="text-sm text-gray-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="input-field" disabled={classesLoading}>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Exam</label>
          <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)} className="input-field" disabled={!selectedClass}>
            <option value="">Select Exam</option>
            {exams.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="input-field" disabled={!selectedClass || subjectsLoading}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search..." className="input-field pl-10"/>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th>Student</th>
              {subjects.map(s=> <th key={s.id}>{s.name}</th>)}
              <th>Total</th><th>Grade</th><th>Rank</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.id}>
                <td>{student.name} <br /> Roll: {student.rollNumber}</td>
                {subjects.map(s => {
                  const sub = student.subjects[s.name];
                  return <td key={s.id} className="text-center">
                    {editingCell?.studentId===student.id && editingCell.subject===s.name ? (
                      <div className="flex items-center space-x-1">
                        <input type="number" value={tempValue} onChange={e=>setTempValue(e.target.value)} className="w-16 border px-1 py-0.5 rounded" />
                        <button onClick={()=>handleEditSave(student.id, s.name)}><Check className="h-4 w-4 text-green-600"/></button>
                        <button onClick={handleEditCancel}><X className="h-4 w-4 text-red-600"/></button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <button onClick={()=>handleEditStart(student.id, s.name, sub.marks)} className="hover:bg-gray-100 rounded px-2 py-1 w-full flex justify-center items-center space-x-1">
                          <span>{sub.marks}/{sub.totalMarks}</span> <Edit className="h-3 w-3 text-gray-400"/>
                        </button>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(sub.grade)}`}>{sub.grade}</span>
                      </div>
                    )}
                  </td>
                })}
                <td className="text-center">{student.totalMarks}/{student.totalPossible}<br/>{student.percentage.toFixed(1)}%</td>
                <td className={`text-center inline-flex px-2 py-1 rounded-full ${getGradeColor(student.overallGrade)}`}>{student.overallGrade}</td>
                <td className="text-center">{student.rank===1 && <Award className="h-4 w-4 text-yellow-500"/>} #{student.rank}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && <div className="card text-center py-12">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
        <h3>No Students Found</h3>
        <p>{searchTerm ? 'No students match your search.' : 'No students available.'}</p>
      </div>}
    </div>
  );
};

export default GradeManagement;
