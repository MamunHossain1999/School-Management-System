import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Users, 
  ClipboardCheck, 
  GraduationCap, 
  DollarSign,
  MessageSquare,
  Calendar,
  BookOpen,
  Award,
  Bell
} from 'lucide-react';

import { fetchFees } from '../../store/slices/feeSlice';
import { fetchNotices } from '../../store/slices/noticeSlice';
import type { AppDispatch, RootState } from '../../store';

const ParentDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  // const { fees } = useSelector((state: RootState) => state.fee); // TODO: Use fees data when implementing fee management
  const { notices } = useSelector((state: RootState) => state.notice);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchFees());
      dispatch(fetchNotices('parent'));
    }
  }, [dispatch, user?.id]);

  // Mock children data
  const children = [
    {
      id: '1',
      name: 'Sarah Johnson',
      class: 'Class 10-A',
      rollNumber: '2024001',
      attendanceRate: '96%',
      overallGrade: 'A-',
      pendingFees: '$150',
    },
    {
      id: '2',
      name: 'Michael Johnson',
      class: 'Class 8-B',
      rollNumber: '2024002',
      attendanceRate: '94%',
      overallGrade: 'B+',
      pendingFees: '$100',
    },
  ];

  const stats = [
    {
      title: 'My Children',
      value: children.length,
      icon: Users,
      color: 'bg-blue-500',
      description: 'Enrolled students',
    },
    {
      title: 'Avg Attendance',
      value: '95%',
      icon: ClipboardCheck,
      color: 'bg-green-500',
      description: 'This month',
    },
    {
      title: 'Pending Fees',
      value: '$250',
      icon: DollarSign,
      color: 'bg-orange-500',
      description: 'Total due',
    },
    {
      title: 'New Messages',
      value: 3,
      icon: MessageSquare,
      color: 'bg-purple-500',
      description: 'From teachers',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      message: 'Sarah scored A+ in Mathematics exam',
      time: '2 hours ago',
      type: 'grade',
      child: 'Sarah Johnson',
    },
    {
      id: 2,
      message: 'Michael was absent from Physics class',
      time: '1 day ago',
      type: 'attendance',
      child: 'Michael Johnson',
    },
    {
      id: 3,
      message: 'Fee payment reminder for Sarah',
      time: '2 days ago',
      type: 'fee',
      child: 'Sarah Johnson',
    },
    {
      id: 4,
      message: 'New assignment uploaded in English',
      time: '3 days ago',
      type: 'assignment',
      child: 'Sarah Johnson',
    },
  ];

  const upcomingEvents = [
    { date: '2024-01-15', event: 'Parent-Teacher Meeting', time: '10:00 AM' },
    { date: '2024-01-20', event: 'Science Fair', time: '2:00 PM' },
    { date: '2024-01-25', event: 'Sports Day', time: '9:00 AM' },
    { date: '2024-01-30', event: 'Annual Function', time: '6:00 PM' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h1>
        <p className="text-purple-100">
          Stay updated with your children's academic progress and school activities.
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

      {/* Children Overview */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          My Children
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children.map((child) => (
            <div key={child.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{child.name}</h3>
                <span className="text-sm text-gray-500">Roll: {child.rollNumber}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{child.class}</p>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">Attendance</p>
                  <p className="font-semibold text-green-600">{child.attendanceRate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Grade</p>
                  <p className="font-semibold text-blue-600">{child.overallGrade}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="font-semibold text-orange-600">{child.pendingFees}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  {activity.type === 'grade' && <Award className="h-4 w-4 text-gray-600" />}
                  {activity.type === 'attendance' && <ClipboardCheck className="h-4 w-4 text-gray-600" />}
                  {activity.type === 'fee' && <DollarSign className="h-4 w-4 text-gray-600" />}
                  {activity.type === 'assignment' && <BookOpen className="h-4 w-4 text-gray-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.child} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Upcoming Events
            </h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View Calendar
            </button>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{event.event}</p>
                  <p className="text-sm text-gray-600">{event.time}</p>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {new Date(event.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Notices */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Recent Notices
          </h2>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="space-y-3">
          {notices.slice(0, 3).map((notice) => (
            <div key={notice.id} className="border-l-4 border-primary-500 pl-4 py-2">
              <h3 className="font-medium text-gray-900">{notice.title}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notice.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(notice.publishedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
          {notices.length === 0 && (
            <p className="text-sm text-gray-500">No notices available</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <ClipboardCheck className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-900">View Attendance</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <GraduationCap className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-900">Check Results</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <DollarSign className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-900">Pay Fees</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            <MessageSquare className="h-8 w-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-orange-900">Send Message</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
