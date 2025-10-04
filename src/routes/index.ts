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
    sections: '/admin/sections',
    assignments: '/admin/assignments',
    attendance: '/admin/attendance',
    communication: '/admin/communication',
    classRoutine: '/admin/class-routine',
    admissions: '/admin/admissions',
    studentProfiles: '/admin/student-profiles',
    idCardsCertificates: '/admin/id-cards-certificates',
    fees: '/admin/fees',
    exams: '/admin/exams',
    noticeBoard: '/admin/notices',
    eventsCalendar: '/admin/events-calendar',
    library: '/admin/library',
    hostel: '/admin/hostel',
    transport: '/admin/transport',
    reports: '/admin/reports',
    rolesPermissions: '/admin/roles-permissions',
    schoolInfo: '/admin/school-info',
    settings: '/admin/settings',
    profile: '/admin/profile',
  },

  // Teacher routes
  teacher: {
    base: '/teacher',
    dashboard: '/teacher/dashboard',
    classes: '/teacher/classes',
    subjects: '/teacher/subjects',
    assignments: '/teacher/assignments',
    assignmentGrading: '/teacher/assignments/grading',
    attendance: '/teacher/attendance',
    grades: '/teacher/grades',
    syllabusResources: '/teacher/syllabus-resources',
    exams: '/teacher/exams',
    resultEntry: '/teacher/result-entry',
    reports: '/teacher/reports',
    notices: '/teacher/notices',
    events: '/teacher/events',
    communication: '/teacher/communication',
    library: '/teacher/library',
    profile: '/teacher/profile',
  },

  // Student routes
  student: {
    base: '/student',
    dashboard: '/student/dashboard',
    classes: '/student/classes',
    subjects: '/student/subjects',
    classRoutine: '/student/class-routine',
    assignments: '/student/assignments',
    attendance: '/student/attendance',
    fees: '/student/fees',
    exams: '/student/exams',
    results: '/student/results',
    notices: '/student/notices',
    events: '/student/events',
    library: '/student/library',
    resources: '/student/resources',
    communication: '/student/communication',
    transport: '/student/transport',
    hostel: '/student/hostel',
    grades: '/student/grades', // kept for compatibility
    profile: '/student/profile',
  },

  // Parent routes
  parent: {
    base: '/parent',
    dashboard: '/parent/dashboard',
    childProfile: '/parent/child-profile',
    classes: '/parent/classes',
    subjects: '/parent/subjects',
    assignments: '/parent/assignments',
    attendance: '/parent/attendance',
    exams: '/parent/exams',
    results: '/parent/results',
    fees: '/parent/fees',
    notices: '/parent/notices',
    events: '/parent/events',
    communication: '/parent/communication',
    transport: '/parent/transport',
    hostel: '/parent/hostel',
    grades: '/parent/grades', // kept for compatibility
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
    { name: 'Class Routine', path: routes.admin.classRoutine, icon: 'Calendar' },
    { name: 'Assignments', path: routes.admin.assignments, icon: 'FileText' },
    { name: 'Attendance', path: routes.admin.attendance, icon: 'ClipboardCheck' },
    { name: 'Communication', path: routes.admin.communication, icon: 'MessageSquare' },
    { name: 'Admissions', path: routes.admin.admissions, icon: 'UserPlus' },
    { name: 'Student Profiles', path: routes.admin.studentProfiles, icon: 'Users' },
    { name: 'ID Cards & Certificates', path: routes.admin.idCardsCertificates, icon: 'IdCard' },
    { name: 'Fees', path: routes.admin.fees, icon: 'DollarSign' },
    { name: 'Exams', path: routes.admin.exams, icon: 'FileCheck' },
    { name: 'Notice Board', path: routes.admin.noticeBoard, icon: 'Megaphone' },
    { name: 'Events', path: routes.admin.eventsCalendar, icon: 'Calendar' },
    { name: 'Library', path: routes.admin.library, icon: 'Library' },
    { name: 'Hostel', path: routes.admin.hostel, icon: 'Bed' },
    { name: 'Transport', path: routes.admin.transport, icon: 'Bus' },
    { name: 'Reports', path: routes.admin.reports, icon: 'BarChart3' },
    { name: 'Roles & Permissions', path: routes.admin.rolesPermissions, icon: 'Shield' },
    { name: 'Settings', path: routes.admin.settings, icon: 'Settings' },
    { name: 'School Info', path: routes.admin.schoolInfo, icon: 'Building' },
    { name: 'Profile', path: routes.admin.profile, icon: 'User' },
  ],
  teacher: [
    { name: 'Dashboard', path: routes.teacher.dashboard, icon: 'Home' },
    { name: 'Classes', path: routes.teacher.classes, icon: 'School' },
    { name: 'Subjects', path: routes.teacher.subjects, icon: 'Book' },
    { name: 'Assignments', path: routes.teacher.assignments, icon: 'FileText' },
    { name: 'Assignment Grading', path: routes.teacher.assignmentGrading, icon: 'CheckSquare' },
    { name: 'Attendance', path: routes.teacher.attendance, icon: 'ClipboardCheck' },
    { name: 'Fee Management', path: '/teacher/fees', icon: 'DollarSign' },
    { name: 'Exams', path: routes.teacher.exams, icon: 'FileCheck' },
    { name: 'Result Entry', path: routes.teacher.resultEntry, icon: 'Edit' },
    { name: 'Grades', path: routes.teacher.grades, icon: 'Award' },
    { name: 'Profile', path: routes.teacher.profile, icon: 'User' },
  ],
  student: [
    { name: 'Dashboard', path: routes.student.dashboard, icon: 'Home' },
    { name: 'Classes', path: routes.student.classes, icon: 'School' },
    { name: 'Subjects', path: routes.student.subjects, icon: 'Book' },
    { name: 'Assignments', path: routes.student.assignments, icon: 'FileText' },
    { name: 'Attendance', path: routes.student.attendance, icon: 'ClipboardCheck' },
    { name: 'Fees & Payments', path: routes.student.fees, icon: 'DollarSign' },
    { name: 'Exam Results', path: routes.student.results, icon: 'FileCheck' },
    { name: 'Grades', path: routes.student.grades, icon: 'Award' },
    { name: 'Profile', path: routes.student.profile, icon: 'User' },
  ],
  parent: [
    { name: 'Dashboard', path: routes.parent.dashboard, icon: 'Home' },
    { name: 'Classes', path: routes.parent.classes, icon: 'School' },
    { name: 'Subjects', path: routes.parent.subjects, icon: 'Book' },
    { name: 'Assignments', path: routes.parent.assignments, icon: 'FileText' },
    { name: 'Attendance', path: routes.parent.attendance, icon: 'ClipboardCheck' },
    { name: 'Fees & Payments', path: routes.parent.fees, icon: 'DollarSign' },
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
