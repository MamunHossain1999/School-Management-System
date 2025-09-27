import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Home,
  ClipboardList,
  Bell,
  GraduationCap,
  Calendar,
  UserPlus,
  DollarSign,
  FileCheck,
  Megaphone,
  Bookmark,
  Bed,
  Bus,
  BarChart3,
  Shield,
  BadgeCheck
} from 'lucide-react';
import type { RootState } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import ProfileDropdown from '../common/ProfileDropdown';
import toast from 'react-hot-toast';
import { useGetUnreadMessageCountQuery } from '../../store/api/noticeApi';
import { fetchUsers } from '../../store/slices/userSlice';
import { routes } from '../../routes';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { users } = useSelector((state: RootState) => state.user);

  // Fetch users count for sidebar badge
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Unread messages badge (communication)
  const { data: unreadData } = useGetUnreadMessageCountQuery();
  const unreadCount = typeof unreadData?.count === 'number' ? unreadData.count : 0;

  type AcademicTab = 'Classes' | 'Subjects' | 'Assignments';
  type MenuItem = {
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    tab?: AcademicTab;
  };

  const menuItems: readonly MenuItem[] = [
    { path: routes.admin.dashboard, icon: Home, label: 'Dashboard' },
    { path: routes.admin.users, icon: Users, label: 'User Management' },
    { path: routes.admin.academic, icon: BookOpen, label: 'Academic' },
    // Route Classes/Subjects/Assignments through Academic tabs for a unified UX
    { path: routes.admin.academic, tab: 'Classes', icon: GraduationCap, label: 'Classes' },
    { path: routes.admin.academic, tab: 'Subjects', icon: BookOpen, label: 'Subjects' },
    { path: routes.admin.classRoutine, icon: Calendar, label: 'Class Routine' },
    { path: routes.admin.academic, tab: 'Assignments', icon: FileText, label: 'Assignments' },
    { path: routes.admin.attendance, icon: ClipboardList, label: 'Attendance' },
    { path: routes.admin.admissions, icon: UserPlus, label: 'Admissions' },
    { path: routes.admin.studentProfiles, icon: Users, label: 'Student Profiles' },
    { path: routes.admin.idCardsCertificates, icon: BadgeCheck, label: 'ID Cards & Certificates' },
    { path: routes.admin.fees, icon: DollarSign, label: 'Fees' },
    { path: routes.admin.exams, icon: FileCheck, label: 'Exams' },
    { path: routes.admin.noticeBoard, icon: Megaphone, label: 'Notice Board' },
    { path: routes.admin.eventsCalendar, icon: Calendar, label: 'Events & Holidays' },
    { path: routes.admin.library, icon: Bookmark, label: 'Library' },
    { path: routes.admin.hostel, icon: Bed, label: 'Hostel' },
    { path: routes.admin.transport, icon: Bus, label: 'Transport' },
    { path: routes.admin.reports, icon: BarChart3, label: 'Reports' },
    { path: routes.admin.rolesPermissions, icon: Shield, label: 'Roles & Permissions' },
    { path: routes.admin.schoolInfo, icon: Settings, label: 'School Info' },
    { path: routes.admin.settings ?? '/admin/settings', icon: Settings, label: 'Settings' },
    { path: routes.admin.profile, icon: Settings, label: 'Profile' },
  ] as const;

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
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">EduCare Admin</span>
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
            to="/admin/profile"
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-semibold text-lg">
                {user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.name || 'Admin User'}
              </p>
              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
              <p className="text-xs text-blue-600 capitalize font-medium">
                {user?.role} • Click to view profile
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const searchParams = new URLSearchParams(location.search);
            const tabValue: AcademicTab | undefined = item.tab;
            const isAcademicTab = item.path === '/admin/academic' && Boolean(tabValue);
            const isActive = isAcademicTab
              ? (location.pathname === '/admin/academic' && searchParams.get('tab') === tabValue)
              : location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={tabValue ? `${item.path}?tab=${tabValue}` : item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium flex-1">{item.label}</span>
                {/* Users count badge next to User Management */}
                {item.path === '/admin/users' && Array.isArray(users) && users.length > 0 && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {users.length}
                  </span>
                )}
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
                Admin Dashboard
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
              <ProfileDropdown colorScheme="blue" />
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

export default AdminLayout;
