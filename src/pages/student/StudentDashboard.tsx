import React from 'react';
import { useSelector } from 'react-redux';
import { 
  ClipboardCheck, 
  FileText, 
  Calendar,
  GraduationCap,
  DollarSign,
  BookOpen,
  Award
} from 'lucide-react';
import type { RootState } from '../../store';
import { useGetFeesQuery } from '../../store/api/feeApi';


const StudentDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Use RTK Query to fetch fees data
  const { data: fees } = useGetFeesQuery(user?.id || '', {
    skip: !user?.id,
  });

  const upcomingAssignments = [
    {
      id: 1,
      title: 'Physics Lab Report',
      subject: 'Physics',
      dueDate: '2024-01-15',
      status: 'pending',
    },
    {
      id: 2,
      title: 'English Essay',
      subject: 'English',
      dueDate: '2024-01-18',
      status: 'pending',
    },
    {
      id: 3,
      title: 'Math Problem Set',
      subject: 'Mathematics',
      dueDate: '2024-01-20',
      status: 'pending',
    },
    {
      id: 4,
      title: 'History Research',
      subject: 'History',
      dueDate: '2024-01-22',
      status: 'pending',
    },
  ];

  // Calculate total pending fees
  const totalPendingFees = fees?.reduce((total, fee) => {
    return fee.status === 'pending' ? total + fee.amount : total;
  }, 0) || 0;

  const stats = [
    {
      title: 'Attendance Rate',
      value: '94%',
      icon: ClipboardCheck,
      color: 'bg-green-500',
      description: 'This month',
    },
    {
      title: 'Assignments',
      value: upcomingAssignments.length,
      icon: FileText,
      color: 'bg-blue-500',
      description: `${upcomingAssignments.filter(a => a.status === 'pending').length} pending`,
    },
    {
      title: 'Overall Grade',
      value: 'A-',
      icon: GraduationCap,
      color: 'bg-purple-500',
      description: 'Current semester',
    },
    {
      title: 'Pending Fees',
      value: `$${totalPendingFees}`,
      icon: DollarSign,
      color: 'bg-orange-500',
      description: 'Due this month',
    },
  ];

  const todaySchedule = [
    { time: '09:00 AM', subject: 'Mathematics', teacher: 'Mr. Johnson', room: 'Room 101' },
    { time: '10:30 AM', subject: 'Physics', teacher: 'Dr. Smith', room: 'Lab 2' },
    { time: '12:00 PM', subject: 'English', teacher: 'Ms. Davis', room: 'Room 205' },
    { time: '02:00 PM', subject: 'Chemistry', teacher: 'Dr. Wilson', room: 'Lab 1' },
    { time: '03:30 PM', subject: 'History', teacher: 'Mr. Brown', room: 'Room 301' },
  ];

  const recentGrades = [
    { subject: 'Mathematics', grade: 'A', exam: 'Mid-term', date: '2024-01-10' },
    { subject: 'Physics', grade: 'B+', exam: 'Quiz 3', date: '2024-01-08' },
    { subject: 'English', grade: 'A-', exam: 'Essay 2', date: '2024-01-05' },
    { subject: 'Chemistry', grade: 'A', exam: 'Lab Test', date: '2024-01-03' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100">
          You have 5 classes today and 3 assignments due this week. Keep up the great work!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Today's Classes
            </h2>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString()}
            </span>
          </div>
          <div className="space-y-3">
            {todaySchedule.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.subject}</p>
                    <p className="text-sm text-gray-600">{item.teacher} • {item.room}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Upcoming Assignments
            </h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {upcomingAssignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{assignment.title}</p>
                  <p className="text-sm text-gray-600">{assignment.subject}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Grades */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Recent Grades
            </h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentGrades.map((grade, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{grade.subject}</p>
                  <p className="text-sm text-gray-600">{grade.exam}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{grade.grade}</p>
                  <p className="text-xs text-gray-500">{new Date(grade.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-900">Submit Assignment</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <ClipboardCheck className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-900">View Attendance</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <GraduationCap className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-900">Check Results</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <DollarSign className="h-8 w-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-orange-900">Pay Fees</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
