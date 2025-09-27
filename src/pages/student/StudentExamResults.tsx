/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar,
  BookOpen,
  Award,
  TrendingUp,
  Download,
  Eye,
  BarChart3,
  PieChart
} from 'lucide-react';
import { 
  useGetMyResultsQuery
} from '../../store/api/examApi';

const StudentExamResults: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');

  // API hooks
  const { data: results = [], isLoading } = useGetMyResultsQuery({});

  // Helper function to get academic term from date
  const getAcademicTerm = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    
    if (month >= 1 && month <= 4) return 'First Term';
    if (month >= 5 && month <= 8) return 'Second Term';
    return 'Third Term';
  };

  // Filter results based on search and filters
  const filteredResults = results.filter(result => {
    const exam = typeof result.exam === 'object' ? result.exam : null;
    if (!exam) return false;

    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || exam.subject === selectedSubject;
    const examTerm = getAcademicTerm(exam.date);
    const matchesTerm = !selectedTerm || examTerm === selectedTerm;
    
    return matchesSearch && matchesSubject && matchesTerm;
  });

  // Get unique subjects for filter
  const subjects = Array.from(new Set(results.map(result => {
    const exam = typeof result.exam === 'object' ? result.exam : null;
    return exam?.subject;
  }).filter(Boolean)));

  // Get unique terms for filter (based on exam dates)
  const terms = Array.from(new Set(
    results
      .map(result => {
        const exam = typeof result.exam === 'object' ? result.exam : null;
        return exam ? getAcademicTerm(exam.date) : null;
      })
      .filter(Boolean) as string[]
  ));

  // Calculate statistics
  const stats = {
    totalExams: results.length,
    averageMarks: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.marksObtained, 0) / results.length) : 0,
    averagePercentage: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length) : 0,
    passedExams: results.filter(r => r.status === 'pass').length,
    highestMarks: results.length > 0 ? Math.max(...results.map(r => r.marksObtained)) : 0,
    lowestMarks: results.length > 0 ? Math.min(...results.map(r => r.marksObtained)) : 0,
  };

  // Grade distribution for chart
  const gradeDistribution = results.reduce((acc, result) => {
    acc[result.grade] = (acc[result.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Subject-wise performance
  const subjectPerformance = results.reduce((acc, result) => {
    const exam = typeof result.exam === 'object' ? result.exam : null;
    if (!exam) return acc;
    
    if (!acc[exam.subject]) {
      acc[exam.subject] = {
        totalMarks: 0,
        totalExams: 0,
        totalObtained: 0,
        averagePercentage: 0,
      };
    }
    
    acc[exam.subject].totalExams += 1;
    acc[exam.subject].totalObtained += result.marksObtained;
    acc[exam.subject].totalMarks += exam.totalMarks;
    acc[exam.subject].averagePercentage = Math.round((acc[exam.subject].totalObtained / acc[exam.subject].totalMarks) * 100);
    
    return acc;
  }, {} as Record<string, any>);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B+':
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C+':
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'F':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      case 'absent':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Exam Results</h1>
          <p className="text-gray-600">View your exam performance and academic progress</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'list' 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="h-4 w-4 inline mr-1" />
            List View
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'chart' 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-1" />
            Analytics
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Exams</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalExams}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average %</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averagePercentage}%</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Passed Exams</p>
              <p className="text-2xl font-bold text-gray-900">{stats.passedExams}</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Highest Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.highestMarks}</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <>
          {/* Filters */}
          <div className="card">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search exams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="input"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="input"
              >
                <option value="">All Terms</option>
                {terms.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
              <button className="btn-secondary flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export Results</span>
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Exam Results</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Filter className="h-4 w-4" />
                <span>{filteredResults.length} results found</span>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading results...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No exam results found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResults.map((result) => {
                  const exam = typeof result.exam === 'object' ? result.exam : null;
                  if (!exam) return null;

                  return (
                    <div key={result._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                          <p className="text-sm text-gray-600">{exam.subject} • {exam.class} - {exam.section} • {getAcademicTerm(exam.date)}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {result.marksObtained}/{exam.totalMarks}
                          </div>
                          <div className="text-sm text-gray-600">{result.percentage}%</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {new Date(exam.date).toLocaleDateString()}
                            </span>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(result.grade)}`}>
                            Grade: {result.grade}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                            {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                          </span>
                        </div>
                        {result.remarks && (
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            <strong>Remarks:</strong> {result.remarks}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Analytics View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grade Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Grade Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(gradeDistribution).map(([grade, count]) => (
                <div key={grade} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(grade)}`}>
                      {grade}
                    </span>
                    <span className="text-sm text-gray-600">Grade {grade}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${(count / results.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject-wise Performance */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Subject Performance
            </h3>
            <div className="space-y-4">
              {Object.entries(subjectPerformance).map(([subject, performance]) => (
                <div key={subject}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{subject}</span>
                    <span className="text-sm text-gray-600">{performance.averagePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${performance.averagePercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {performance.totalExams} exams • {performance.totalObtained}/{performance.totalMarks} marks
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Trends */}
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Recent Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.averagePercentage}%</div>
                <div className="text-sm text-green-600">Average Score</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{Math.round((stats.passedExams / stats.totalExams) * 100)}%</div>
                <div className="text-sm text-blue-600">Pass Rate</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.highestMarks}</div>
                <div className="text-sm text-purple-600">Best Score</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentExamResults;
