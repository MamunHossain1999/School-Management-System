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
  GraduationCap,
  ClipboardList,
  Bell,
  Calendar,
  DollarSign,
  FileCheck,
  Award,
  Bookmark,
  MessageSquare,
  Bus,
  Bed
} from 'lucide-react';
import type { RootState } from '../../store';
import type { AppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import ProfileDropdown from '../common/ProfileDropdown';
import toast from 'react-hot-toast';
import { routes } from '../../routes';

const StudentLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

const menuItems = [
  { path: routes.student.dashboard, icon: Home, label: 'Dashboard' },
  { path: routes.student.classes, icon: GraduationCap, label: 'Classes' },
  { path: routes.student.subjects, icon: BookOpen, label: 'Subjects' },
  { path: routes.student.classRoutine, icon: Calendar, label: 'Class Routine' },
  { path: routes.student.assignments, icon: FileText, label: 'Assignments' },
  { path: routes.student.attendance, icon: ClipboardList, label: 'Attendance' },
  { path: routes.student.fees, icon: DollarSign, label: 'Fees & Payments' },
  { path: routes.student.exams, icon: FileCheck, label: 'Exam Schedule' },
  { path: routes.student.results, icon: Award, label: 'Results' },
  { path: routes.student.notices, icon: Bell, label: 'Notices' },
  { path: routes.student.events, icon: Calendar, label: 'Events & Holidays' },
  { path: routes.student.library, icon: Bookmark, label: 'Library' },
  { path: routes.student.resources, icon: BookOpen, label: 'Resources' },
  { path: routes.student.communication, icon: MessageSquare, label: 'Communication' },
  { path: routes.student.transport, icon: Bus, label: 'Transport' },
  { path: routes.student.hostel, icon: Bed, label: 'Hostel' },
  { path: routes.student.profile, icon: Settings, label: 'Profile' },
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
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">EduCare Student</span>
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
            to="/student/profile"
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-semibold text-lg">
                {user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'S'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.name || 'Student'}
              </p>
              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
              <p className="text-xs text-purple-600 capitalize font-medium">
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
                    ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-700'
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
                Student Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100">
                <Bell className="w-5 h-5" />
              </button>
              <ProfileDropdown colorScheme="purple" />
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

export default StudentLayout;
