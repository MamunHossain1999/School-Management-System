import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Bell,
  Award
} from 'lucide-react';

import type { AppDispatch, RootState } from '../../store';
import { fetchUsers } from '../../store/slices/userSlice';
import { fetchNotices } from '../../store/slices/noticeSlice';

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { students, teachers, parents } = useSelector((state: RootState) => state.user);
  const { notices } = useSelector((state: RootState) => state.notice);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchNotices());
  }, [dispatch]);

  const stats = [
    {
      title: 'Total Students',
      value: students.length,
      icon: GraduationCap,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Total Teachers',
      value: teachers.length,
      icon: Users,
      color: 'bg-green-500',
      change: '+3%',
    },
    {
      title: 'Total Parents',
      value: parents.length,
      icon: Users,
      color: 'bg-purple-500',
      change: '+8%',
    },
    {
      title: 'Active Classes',
      value: 12,
      icon: BookOpen,
      color: 'bg-orange-500',
      change: '+2%',
    },
  ];

  const recentActivities = [
    { id: 1, type: 'user', message: 'New student John Doe registered', time: '2 hours ago', icon: Users },
    { id: 2, type: 'exam', message: 'Mid-term exams scheduled for next week', time: '4 hours ago', icon: Award },
    { id: 3, type: 'notice', message: 'New notice published: Holiday announcement', time: '6 hours ago', icon: Bell },
    { id: 4, type: 'fee', message: 'Fee payment reminder sent to 150 students', time: '1 day ago', icon: DollarSign },
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, Admin!</h1>
        <p className="text-indigo-100 text-sm md:text-base">
          Here's what's happening at your school today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-5 flex justify-between items-center transition hover:shadow-lg">
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" /> {stat.change}
              </p>
            </div>
            <div className={`${stat.color} p-3 rounded-xl flex items-center justify-center`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="bg-gray-100 p-2 rounded-lg flex-shrink-0">
                  <activity.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Notices */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Notices</h2>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {notices.slice(0, 4).map((notice) => (
              <div key={notice.id} className="border-l-4 border-indigo-500 pl-4">
                <h3 className="text-sm font-medium text-gray-900">{notice.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{new Date(notice.publishedAt).toLocaleDateString()}</p>
              </div>
            ))}
            {notices.length === 0 && <p className="text-sm text-gray-500">No notices available</p>}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
            <Users className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-900">Add User</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
            <BookOpen className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-900">Add Class</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
            <Bell className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-900">Send Notice</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors">
            <Calendar className="h-8 w-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-orange-900">Schedule Event</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
