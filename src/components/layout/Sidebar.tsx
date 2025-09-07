import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Home, 
  Users, 
  BookOpen, 
  Calendar, 
  ClipboardCheck, 
  FileText, 
  DollarSign, 
  MessageSquare, 
  Settings, 
  LogOut,
  School,
  GraduationCap,
  UserCheck,
  Bell,
  BarChart3,
  Book,
  Bus,
  Building
} from 'lucide-react';
import type { RootState, AppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const getMenuItems = () => {
    const baseItems = [
      { icon: Home, label: 'Dashboard', path: `/${user?.role}/dashboard` },
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseItems,
          { icon: Users, label: 'User Management', path: '/admin/users' },
          { icon: School, label: 'School Info', path: '/admin/school' },
          { icon: BookOpen, label: 'Classes & Subjects', path: '/admin/academic' },
          { icon: Calendar, label: 'Academic Calendar', path: '/admin/calendar' },
          { icon: ClipboardCheck, label: 'Attendance Reports', path: '/admin/attendance' },
          { icon: FileText, label: 'Exam Management', path: '/admin/exams' },
          { icon: DollarSign, label: 'Fee Management', path: '/admin/fees' },
          { icon: Bell, label: 'Notices', path: '/admin/notices' },
          { icon: BarChart3, label: 'Reports & Analytics', path: '/admin/reports' },
          { icon: Bus, label: 'Transport', path: '/admin/transport' },
          { icon: Building, label: 'Hostel', path: '/admin/hostel' },
          { icon: Book, label: 'Library', path: '/admin/library' },
        ];

      case 'teacher':
        return [
          ...baseItems,
          { icon: Users, label: 'My Students', path: '/teacher/students' },
          { icon: ClipboardCheck, label: 'Attendance', path: '/teacher/attendance' },
          { icon: FileText, label: 'Assignments', path: '/teacher/assignments' },
          { icon: GraduationCap, label: 'Exams & Results', path: '/teacher/exams' },
          { icon: Calendar, label: 'Class Schedule', path: '/teacher/schedule' },
          { icon: MessageSquare, label: 'Messages', path: '/teacher/messages' },
          { icon: Bell, label: 'Notices', path: '/teacher/notices' },
        ];

      case 'student':
        return [
          ...baseItems,
          { icon: UserCheck, label: 'My Profile', path: '/student/profile' },
          { icon: ClipboardCheck, label: 'Attendance', path: '/student/attendance' },
          { icon: Calendar, label: 'Class Schedule', path: '/student/schedule' },
          { icon: FileText, label: 'Assignments', path: '/student/assignments' },
          { icon: GraduationCap, label: 'Results', path: '/student/results' },
          { icon: DollarSign, label: 'Fees', path: '/student/fees' },
          { icon: Bell, label: 'Notices', path: '/student/notices' },
          { icon: Book, label: 'Library', path: '/student/library' },
        ];

      case 'parent':
        return [
          ...baseItems,
          { icon: Users, label: 'My Children', path: '/parent/children' },
          { icon: ClipboardCheck, label: 'Attendance', path: '/parent/attendance' },
          { icon: GraduationCap, label: 'Results', path: '/parent/results' },
          { icon: DollarSign, label: 'Fees', path: '/parent/fees' },
          { icon: MessageSquare, label: 'Messages', path: '/parent/messages' },
          { icon: Bell, label: 'Notices', path: '/parent/notices' },
          { icon: Calendar, label: 'Events', path: '/parent/events' },
        ];

      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="bg-primary-600 p-2 rounded-lg">
              <School className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">SMS</h1>
              <p className="text-xs text-gray-500 capitalize">{user?.role} Panel</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 p-2 rounded-full">
              <Users className="h-5 w-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
              onClick={() => {
                if (window.innerWidth < 1024) {
                  onClose();
                }
              }}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <NavLink
            to={`/${user?.role}/settings`}
            className="sidebar-item mb-2"
            onClick={() => {
              if (window.innerWidth < 1024) {
                onClose();
              }
            }}
          >
            <Settings className="h-5 w-5 mr-3" />
            <span>Settings</span>
          </NavLink>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
