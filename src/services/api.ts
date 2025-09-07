/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import Cookies from 'js-cookie';
import type { LoginCredentials, ApiResponse, User } from '../types';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      Cookies.remove('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
    // Mock API response for development
    return new Promise((resolve) => {
      setTimeout(() => {
        if (credentials.email === 'admin@school.com' && credentials.password === 'admin123') {
          resolve({
            success: true,
            data: {
              user: {
                id: '1',
                email: 'admin@school.com',
                name: 'Admin User',
                role: 'admin',
                isActive: true,
              },
              token: 'mock-jwt-token-admin'
            },
            message: 'Login successful'
          });
        } else if (credentials.email === 'teacher@school.com' && credentials.password === 'teacher123') {
          resolve({
            success: true,
            data: {
              user: {
                id: '2',
                email: 'teacher@school.com',
                name: 'John Teacher',
                role: 'teacher',
                isActive: true,
              },
              token: 'mock-jwt-token-teacher'
            },
            message: 'Login successful'
          });
        } else if (credentials.email === 'student@school.com' && credentials.password === 'student123') {
          resolve({
            success: true,
            data: {
              user: {
                id: '3',
                email: 'student@school.com',
                name: 'Jane Student',
                role: 'student',
                isActive: true,
              },
              token: 'mock-jwt-token-student'
            },
            message: 'Login successful'
          });
        } else if (credentials.email === 'parent@school.com' && credentials.password === 'parent123') {
          resolve({
            success: true,
            data: {
              user: {
                id: '4',
                email: 'parent@school.com',
                name: 'Parent User',
                role: 'parent',
                isActive: true,
              },
              token: 'mock-jwt-token-parent'
            },
            message: 'Login successful'
          });
        } else {
          resolve({
            success: false,
            data: null as any,
            message: 'Invalid credentials'
          });
        }
      }, 1000);
    });
  },

  register: async (userData: any): Promise<ApiResponse<User>> => {
    // Mock API response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { ...userData, id: Date.now().toString(), isActive: true },
          message: 'Registration successful'
        });
      }, 1000);
    });
  },

  logout: async (): Promise<ApiResponse<null>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: null,
          message: 'Logout successful'
        });
      }, 500);
    });
  },

  verifyToken: async (token: string): Promise<ApiResponse<{ user: User }>> => {
    // Mock token verification
    return new Promise((resolve) => {
      setTimeout(() => {
        if (token.startsWith('mock-jwt-token')) {
          const role = token.split('-').pop();
          resolve({
            success: true,
            data: {
              user: {
                id: '1',
                email: `${role}@school.com`,
                name: `${role} User`,
                role: role as any,
                isActive: true,
              }
            },
            message: 'Token valid'
          });
        } else {
          resolve({
            success: false,
            data: null as any,
            message: 'Invalid token'
          });
        }
      }, 500);
    });
  },
};

// User API
export const userAPI = {
  getUsers: async (role?: string): Promise<ApiResponse<User[]>> => {
    // Mock API response
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUsers: User[] = [
          { id: '1', email: 'admin@school.com', name: 'Admin User', role: 'admin', isActive: true },
          { id: '2', email: 'teacher1@school.com', name: 'John Teacher', role: 'teacher', isActive: true },
          { id: '3', email: 'student1@school.com', name: 'Jane Student', role: 'student', isActive: true },
          { id: '4', email: 'parent1@school.com', name: 'Parent User', role: 'parent', isActive: true },
        ];
        
        const filteredUsers = role ? mockUsers.filter(user => user.role === role) : mockUsers;
        resolve({
          success: true,
          data: filteredUsers,
          message: 'Users fetched successfully'
        });
      }, 500);
    });
  },

  createUser: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { ...userData, id: Date.now().toString(), isActive: true } as User,
          message: 'User created successfully'
        });
      }, 1000);
    });
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { ...userData, id } as User,
          message: 'User updated successfully'
        });
      }, 1000);
    });
  },

  deleteUser: async (id: string): Promise<ApiResponse<null>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: null,
          message: 'User deleted successfully'
        });
      }, 500);
    });
  },
};

// Academic API
export const academicAPI = {
  getClasses: async (): Promise<ApiResponse<any[]>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            {
              id: '1',
              name: 'Class 1',
              grade: 1,
              sections: [
                { id: '1', name: 'A', classId: '1', capacity: 30, currentStrength: 25 },
                { id: '2', name: 'B', classId: '1', capacity: 30, currentStrength: 28 }
              ],
              subjects: ['math', 'english', 'science'],
              academicYear: '2024-25'
            }
          ],
          message: 'Classes fetched successfully'
        });
      }, 500);
    });
  },

  getSubjects: async (classId?: string): Promise<ApiResponse<any[]>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            { id: '1', name: 'Mathematics', code: 'MATH101', credits: 4, type: 'core' },
            { id: '2', name: 'English', code: 'ENG101', credits: 3, type: 'core' },
            { id: '3', name: 'Science', code: 'SCI101', credits: 4, type: 'core' }
          ],
          message: 'Subjects fetched successfully'
        });
      }, 500);
    });
  },

  getAssignments: async (filters?: any): Promise<ApiResponse<any[]>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [],
          message: 'Assignments fetched successfully'
        });
      }, 500);
    });
  },

  createClass: async (classData: any): Promise<ApiResponse<any>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { ...classData, id: Date.now().toString() },
          message: 'Class created successfully'
        });
      }, 1000);
    });
  },

  createSubject: async (subjectData: any): Promise<ApiResponse<any>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { ...subjectData, id: Date.now().toString() },
          message: 'Subject created successfully'
        });
      }, 1000);
    });
  },

  createAssignment: async (assignmentData: any): Promise<ApiResponse<any>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { ...assignmentData, id: Date.now().toString() },
          message: 'Assignment created successfully'
        });
      }, 1000);
    });
  },
};

// Attendance API
export const attendanceAPI = {
  getAttendance: async (filters: any): Promise<ApiResponse<any[]>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [],
          message: 'Attendance fetched successfully'
        });
      }, 500);
    });
  },

  markAttendance: async (attendanceData: any[]): Promise<ApiResponse<any[]>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: attendanceData.map(item => ({ ...item, id: Date.now().toString() })),
          message: 'Attendance marked successfully'
        });
      }, 1000);
    });
  },
};

// Exam API
export const examAPI = {
  getExams: async (filters?: any): Promise<ApiResponse<any[]>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [],
          message: 'Exams fetched successfully'
        });
      }, 500);
    });
  },

  createExam: async (examData: any): Promise<ApiResponse<any>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { ...examData, id: Date.now().toString() },
          message: 'Exam created successfully'
        });
      }, 1000);
    });
  },

  getResults: async (filters: any): Promise<ApiResponse<any[]>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [],
          message: 'Results fetched successfully'
        });
      }, 500);
    });
  },

  submitResult: async (resultData: any): Promise<ApiResponse<any>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { ...resultData, id: Date.now().toString() },
          message: 'Result submitted successfully'
        });
      }, 1000);
    });
  },
};

// Notice API
export const noticeAPI = {
  getNotices: async (userRole?: string): Promise<ApiResponse<any[]>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            {
              id: '1',
              title: 'Welcome to New Academic Year',
              content: 'Welcome all students and parents to the new academic year 2024-25.',
              type: 'general',
              targetAudience: ['student', 'parent'],
              publishedBy: 'admin',
              publishedAt: new Date().toISOString()
            }
          ],
          message: 'Notices fetched successfully'
        });
      }, 500);
    });
  },

  createNotice: async (noticeData: any): Promise<ApiResponse<any>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { ...noticeData, id: Date.now().toString(), publishedAt: new Date().toISOString() },
          message: 'Notice created successfully'
        });
      }, 1000);
    });
  },
};

// Fee API
export const feeAPI = {
  getFees: async (studentId?: string): Promise<ApiResponse<any[]>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [],
          message: 'Fees fetched successfully'
        });
      }, 500);
    });
  },

  createFee: async (feeData: any): Promise<ApiResponse<any>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { ...feeData, id: Date.now().toString() },
          message: 'Fee created successfully'
        });
      }, 1000);
    });
  },

  payFee: async (feeId: string, paymentData: any): Promise<ApiResponse<any>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { id: feeId, ...paymentData, status: 'paid', paidDate: new Date().toISOString() },
          message: 'Payment processed successfully'
        });
      }, 1500);
    });
  },
};

export default api;
