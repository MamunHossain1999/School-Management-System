import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import type { RootState } from '../../store';
import type { AppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

interface ProfileDropdownProps {
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange';
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ colorScheme = 'blue' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const colorClasses = {
    blue: {
      avatar: 'bg-gradient-to-r from-blue-500 to-purple-500',
      dropdown: 'border-blue-200',
      profileLink: 'text-blue-600 hover:text-blue-700',
      logoutHover: 'hover:bg-red-50 hover:text-red-700'
    },
    green: {
      avatar: 'bg-gradient-to-r from-green-500 to-blue-500',
      dropdown: 'border-green-200',
      profileLink: 'text-green-600 hover:text-green-700',
      logoutHover: 'hover:bg-red-50 hover:text-red-700'
    },
    purple: {
      avatar: 'bg-gradient-to-r from-purple-500 to-pink-500',
      dropdown: 'border-purple-200',
      profileLink: 'text-purple-600 hover:text-purple-700',
      logoutHover: 'hover:bg-red-50 hover:text-red-700'
    },
    orange: {
      avatar: 'bg-gradient-to-r from-orange-500 to-red-500',
      dropdown: 'border-orange-200',
      profileLink: 'text-orange-600 hover:text-orange-700',
      logoutHover: 'hover:bg-red-50 hover:text-red-700'
    }
  };

  const colors = colorClasses[colorScheme];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser(dispatch);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  const getProfilePath = () => {
    switch (user?.role) {
      case 'admin': return '/admin/profile';
      case 'teacher': return '/teacher/profile';
      case 'student': return '/student/profile';
      case 'parent': return '/parent/profile';
      default: return '/profile';
    }
  };

  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.name || 'User';

  const avatarInitial = user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className={`w-8 h-8 ${colors.avatar} rounded-full flex items-center justify-center`}>
          <span className="text-white font-semibold text-sm">
            {avatarInitial}
          </span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900 truncate max-w-32">
            {displayName}
          </p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border ${colors.dropdown} z-[1000]`}>
          {/* Profile Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 ${colors.avatar} rounded-full flex items-center justify-center`}>
                <span className="text-white font-semibold text-lg">
                  {avatarInitial}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                <p className={`text-xs ${colors.profileLink} capitalize font-medium`}>
                  {user?.role}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to={getProfilePath()}
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">View Profile</span>
            </Link>
            
            <Link
              to={`${getProfilePath()}?tab=settings`}
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Account Settings</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 py-2">
            <button
              onClick={handleLogout}
              className={`flex items-center space-x-3 w-full px-4 py-3 text-gray-700 ${colors.logoutHover} transition-colors`}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
