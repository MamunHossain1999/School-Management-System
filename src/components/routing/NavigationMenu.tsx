import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Home, 
  Users, 
  BookOpen, 
  School, 
  Book, 
  FileText, 
  ClipboardCheck, 
  Award, 
  User, 
  Building 
} from 'lucide-react';
import type { RootState } from '../../store';
import { navigationItems } from '../../routes';

const iconMap = {
  Home,
  Users,
  BookOpen,
  School,
  Book,
  FileText,
  ClipboardCheck,
  Award,
  User,
  Building,
};

const NavigationMenu: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!user) return null;

  const menuItems = navigationItems[user.role as keyof typeof navigationItems] || [];

  return (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const IconComponent = iconMap[item.icon as keyof typeof iconMap];
        const isActive = location.pathname === item.path;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${isActive 
                ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-500' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            {IconComponent && (
              <IconComponent 
                className={`mr-3 h-5 w-5 ${isActive ? 'text-primary-500' : 'text-gray-400'}`} 
              />
            )}
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
};

export default NavigationMenu;
