import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar,
  Users,

  Award,
  TrendingUp,
  FileText,
  BarChart3,
  PieChart,
  Download,
  Eye,
  Plus
} from 'lucide-react';
import { 
  useGetExamsQuery,
  type Exam
} from '../../store/api/examApi';

const ExamOverview: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState<'overview' | 'analytics'>('overview');

  // API hooks
  const { data: exams = [], isLoading } = useGetExamsQuery({
    classId: selectedClass || undefined,
    subjectId: selectedSubject || undefined,
  });

  // Filter exams based on search and filters
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.class.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = !selectedClass || exam.class === selectedClass;
    const matchesSubject = !selectedSubject || exam.subject === selectedSubject;
    
    // Status filter based on exam date
    let matchesStatus = true;
    if (selectedStatus) {
      const now = new Date();
      const examDate = new Date(exam.date);
      
      if (selectedStatus === 'upcoming' && examDate <= now) matchesStatus = false;
      if (selectedStatus === 'completed' && examDate >= now) matchesStatus = false;
      if (selectedStatus === 'today' && examDate.toDateString() !== now.toDateString()) matchesStatus = false;
    }
    
    return matchesSearch && matchesClass && matchesSubject && matchesStatus;
  });

  // Get unique values for filters
  const classes = Array.from(new Set(exams.map(exam => exam.class)));
  const subjects = Array.from(new Set(exams.map(exam => exam.subject)));

  // Calculate statistics
  const now = new Date();
  const stats = {
    totalExams: exams.length,
    upcomingExams: exams.filter(exam => new Date(exam.date) > now).length,
    todayExams: exams.filter(exam => new Date(exam.date).toDateString() === now.toDateString()).length,
    completedExams: exams.filter(exam => new Date(exam.date) < now).length,
    activeExams: exams.filter(exam => exam.isActive).length,
  };

  // Subject-wise exam distribution
  const subjectDistribution = exams.reduce((acc, exam) => {
    acc[exam.subject] = (acc[exam.subject] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Class-wise exam distribution
  const classDistribution = exams.reduce((acc, exam) => {
    acc[exam.class] = (acc[exam.class] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Monthly exam trends (mock data for demonstration)
  const monthlyTrends: Array<{ month: string; exams: number; students: number }> = [
    { month: 'Jan', exams: 12, students: 450 },
    { month: 'Feb', exams: 15, students: 520 },
    { month: 'Mar', exams: 18, students: 610 },
    { month: 'Apr', exams: 14, students: 480 },
    { month: 'May', exams: 20, students: 680 },
    { month: 'Jun', exams: 16, students: 550 },
  ];

  const getExamStatus = (exam: Exam) => {
    const examDate = new Date(exam.date);
    
    if (examDate < now) {
      return { status: 'completed', color: 'bg-green-100 text-green-800', label: 'Completed' };
    } else if (examDate.toDateString() === now.toDateString()) {
      return { status: 'today', color: 'bg-blue-100 text-blue-800', label: 'Today' };
    } else {
      return { status: 'upcoming', color: 'bg-yellow-100 text-yellow-800', label: 'Upcoming' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Overview</h1>
          <p className="text-gray-600">Monitor and manage all exams across the institution</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'overview' 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="h-4 w-4 inline mr-1" />
            Overview
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'analytics' 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-1" />
            Analytics
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Exam</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Exams</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalExams}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingExams}</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayExams}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedExams}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeExams}</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'overview' ? (
        <>
          {/* Filters */}
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
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
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="input"
              >
                <option value="">All Classes</option>
                {classes.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
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
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input"
              >
                <option value="">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="today">Today</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Exams List */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">All Exams</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Filter className="h-4 w-4" />
                  <span>{filteredExams.length} exams found</span>
                </div>
                <button className="btn-secondary flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading exams...</p>
              </div>
            ) : filteredExams.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No exams found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exam Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class & Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExams.map((exam) => {
                      const { color, label } = getExamStatus(exam);
                      return (
                        <tr key={exam._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                              <div className="text-sm text-gray-500">
                                Created by: {exam.createdBy}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{exam.class} - {exam.section}</div>
                            <div className="text-sm text-gray-500">{exam.subject}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(exam.date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {exam.startTime} - {exam.endTime}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              Total: {exam.totalMarks}
                            </div>
                            <div className="text-sm text-gray-500">
                              Passing: {exam.passingMarks}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                              {label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-primary-600 hover:text-primary-900 mr-3">
                              View Results
                            </button>
                            <button className="text-blue-600 hover:text-blue-900">
                              Edit
                            </button>
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
      ) : (
        /* Analytics View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Subject-wise Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(subjectDistribution).map(([subject, count]) => (
                <div key={subject} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{subject}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${(count / exams.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Class Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Class-wise Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(classDistribution).map(([className, count]) => (
                <div key={className} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{className}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / exams.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Monthly Exam Trends
            </h3>
            <div className="grid grid-cols-6 gap-4">
              {monthlyTrends.map((trend) => (
                <div key={trend.month} className="text-center">
                  <div className="mb-2">
                    <div 
                      className="bg-primary-600 rounded-t mx-auto" 
                      style={{ 
                        width: '20px', 
                        height: `${(trend.exams / 20) * 100}px`,
                        minHeight: '10px'
                      }}
                    ></div>
                    <div 
                      className="bg-blue-400 rounded-b mx-auto" 
                      style={{ 
                        width: '20px', 
                        height: `${(trend.students / 700) * 80}px`,
                        minHeight: '5px'
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600">{trend.month}</div>
                  <div className="text-xs font-medium text-gray-900">{trend.exams}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-4 mt-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-primary-600 rounded"></div>
                <span>Exams</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                <span>Students</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamOverview;
