// Route configuration for School Management System
export const routes = {
  // Public routes
  public: {
    home: '/',
    login: '/login',
    register: '/register',
    testSlider: '/test-slider',
    unauthorized: '/unauthorized',
  },

  // Admin routes
  admin: {
    base: '/admin',
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    academic: '/admin/academic',
    classes: '/admin/classes',
    subjects: '/admin/subjects',
    assignments: '/admin/assignments',
    attendance: '/admin/attendance',
    schoolInfo: '/admin/school-info',
    profile: '/admin/profile',
  },

  // Teacher routes
  teacher: {
    base: '/teacher',
    dashboard: '/teacher/dashboard',
    classes: '/teacher/classes',
    subjects: '/teacher/subjects',
    assignments: '/teacher/assignments',
    attendance: '/teacher/attendance',
    grades: '/teacher/grades',
    profile: '/teacher/profile',
  },

  // Student routes
  student: {
    base: '/student',
    dashboard: '/student/dashboard',
    classes: '/student/classes',
    subjects: '/student/subjects',
    assignments: '/student/assignments',
    attendance: '/student/attendance',
    grades: '/student/grades',
    profile: '/student/profile',
  },

  // Parent routes
  parent: {
    base: '/parent',
    dashboard: '/parent/dashboard',
    classes: '/parent/classes',
    subjects: '/parent/subjects',
    assignments: '/parent/assignments',
    attendance: '/parent/attendance',
    grades: '/parent/grades',
    profile: '/parent/profile',
  },
} as const;

// Helper function to get routes by role
export const getRoutesByRole = (role: string) => {
  switch (role) {
    case 'admin':
      return routes.admin;
    case 'teacher':
      return routes.teacher;
    case 'student':
      return routes.student;
    case 'parent':
      return routes.parent;
    default:
      return routes.public;
  }
};

// Navigation items for different roles
export const navigationItems = {
  admin: [
    { name: 'Dashboard', path: routes.admin.dashboard, icon: 'Home' },
    { name: 'User Management', path: routes.admin.users, icon: 'Users' },
    { name: 'Academic', path: routes.admin.academic, icon: 'BookOpen' },
    { name: 'Classes', path: routes.admin.classes, icon: 'School' },
    { name: 'Subjects', path: routes.admin.subjects, icon: 'Book' },
    { name: 'Assignments', path: routes.admin.assignments, icon: 'FileText' },
    { name: 'Attendance', path: routes.admin.attendance, icon: 'ClipboardCheck' },
    { name: 'School Info', path: routes.admin.schoolInfo, icon: 'Building' },
    { name: 'Profile', path: routes.admin.profile, icon: 'User' },
  ],
  teacher: [
    { name: 'Dashboard', path: routes.teacher.dashboard, icon: 'Home' },
    { name: 'Classes', path: routes.teacher.classes, icon: 'School' },
    { name: 'Subjects', path: routes.teacher.subjects, icon: 'Book' },
    { name: 'Assignments', path: routes.teacher.assignments, icon: 'FileText' },
    { name: 'Attendance', path: routes.teacher.attendance, icon: 'ClipboardCheck' },
    { name: 'Grades', path: routes.teacher.grades, icon: 'Award' },
    { name: 'Profile', path: routes.teacher.profile, icon: 'User' },
  ],
  student: [
    { name: 'Dashboard', path: routes.student.dashboard, icon: 'Home' },
    { name: 'Classes', path: routes.student.classes, icon: 'School' },
    { name: 'Subjects', path: routes.student.subjects, icon: 'Book' },
    { name: 'Assignments', path: routes.student.assignments, icon: 'FileText' },
    { name: 'Attendance', path: routes.student.attendance, icon: 'ClipboardCheck' },
    { name: 'Grades', path: routes.student.grades, icon: 'Award' },
    { name: 'Profile', path: routes.student.profile, icon: 'User' },
  ],
  parent: [
    { name: 'Dashboard', path: routes.parent.dashboard, icon: 'Home' },
    { name: 'Classes', path: routes.parent.classes, icon: 'School' },
    { name: 'Subjects', path: routes.parent.subjects, icon: 'Book' },
    { name: 'Assignments', path: routes.parent.assignments, icon: 'FileText' },
    { name: 'Attendance', path: routes.parent.attendance, icon: 'ClipboardCheck' },
    { name: 'Grades', path: routes.parent.grades, icon: 'Award' },
    { name: 'Profile', path: routes.parent.profile, icon: 'User' },
  ],
};

// Route permissions
export const routePermissions = {
  [routes.admin.base]: ['admin'],
  [routes.teacher.base]: ['teacher'],
  [routes.student.base]: ['student'],
  [routes.parent.base]: ['parent'],
} as const;

export default routes;
