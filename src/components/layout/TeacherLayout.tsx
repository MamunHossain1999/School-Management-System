import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  BookOpen, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Home,
  ClipboardList,
  Bell,
  Calendar,
  Award,
  Bookmark,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import type { RootState } from '../../store';
import type { AppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import ProfileDropdown from '../common/ProfileDropdown';
import toast from 'react-hot-toast';
import { useGetUnreadMessageCountQuery } from '../../store/api/noticeApi';
import { routes } from '../../routes';

const TeacherLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: unreadData } = useGetUnreadMessageCountQuery();
  const unreadCount = typeof unreadData?.count === 'number' ? unreadData.count : 0;

  const menuItems = [
    { path: routes.teacher.dashboard, icon: Home, label: 'Dashboard' },
    { path: routes.teacher.classes, icon: BookOpen, label: 'Classes' },
    { path: routes.teacher.subjects, icon: BookOpen, label: 'Subjects' },
    { path: routes.teacher.syllabusResources, icon: Bookmark, label: 'Syllabus & Resources' },
    { path: routes.teacher.assignments, icon: FileText, label: 'Assignments' },
    { path: routes.teacher.attendance, icon: ClipboardList, label: 'Attendance' },
    { path: routes.teacher.exams, icon: Calendar, label: 'Exams' },
    { path: routes.teacher.resultEntry, icon: Award, label: 'Result Entry' },
    { path: routes.teacher.grades, icon: FileText, label: 'Grades' },
    { path: routes.teacher.reports, icon: BarChart3, label: 'Reports' },
    { path: routes.teacher.notices, icon: Bell, label: 'Notices' },
    { path: routes.teacher.events, icon: Calendar, label: 'Events' },
    { path: routes.teacher.communication ?? '/teacher/communication', icon: MessageSquare, label: 'Communication' },
    { path: routes.teacher.library, icon: Bookmark, label: 'Library' },
    { path: routes.teacher.profile, icon: Settings, label: 'Profile' },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser(dispatch);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex h-screen flex-col`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">EduCare Teacher</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <Link
            to="/teacher/profile"
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-semibold text-lg">
                {user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'T'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-green-600 transition-colors">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.name || 'Teacher'}
              </p>
              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
              <p className="text-xs text-green-600 capitalize font-medium">
                {user?.role} • Click to view profile
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700 border-r-2 border-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 flex flex-col h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Teacher Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] leading-none font-semibold rounded-full bg-red-500 text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              <ProfileDropdown colorScheme="green" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default TeacherLayout;
