export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  avatar?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  joiningDate?: string;
  isActive: boolean;
}

export interface Student extends User {
  role: 'student';
  rollNumber: string;
  classId: string;
  sectionId: string;
  parentId?: string;
  admissionDate: string;
  bloodGroup?: string;
  emergencyContact?: string;
}

export interface Teacher extends User {
  role: 'teacher';
  employeeId: string;
  subjects: string[];
  classes: string[];
  qualification: string;
  experience: number;
  salary?: number;
}

export interface Parent extends User {
  role: 'parent';
  children: string[]; // student IDs
  occupation?: string;
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
  department?: string;
}

export interface Class {
  id: string;
  name: string;
  grade: number;
  sections: Section[];
  subjects: string[];
  classTeacherId?: string;
  academicYear: string;
}

export interface Section {
  id: string;
  name: string;
  classId: string;
  capacity: number;
  currentStrength: number;
  classTeacherId?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  type: 'core' | 'elective' | 'extra';
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  sectionId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  markedBy: string;
  remarks?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  sectionId: string;
  teacherId: string;
  dueDate: string;
  totalMarks: number;
  attachments?: string[];
  createdAt: string;
}

export interface Exam {
  id: string;
  name: string;
  type: 'unit' | 'midterm' | 'final' | 'quiz';
  subjectId: string;
  classId: string;
  sectionId: string;
  date: string;
  duration: number; // in minutes
  totalMarks: number;
  passingMarks: number;
  instructions?: string;
}

export interface Result {
  id: string;
  studentId: string;
  examId: string;
  marksObtained: number;
  grade: string;
  remarks?: string;
  evaluatedBy: string;
  evaluatedAt: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'academic' | 'event';
  targetAudience: ('admin' | 'teacher' | 'student' | 'parent')[];
  publishedBy: string;
  publishedAt: string;
  expiresAt?: string;
  attachments?: string[];
}

export interface Fee {
  id: string;
  studentId: string;
  type: 'admission' | 'tuition' | 'exam' | 'transport' | 'library' | 'other';
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paidAmount?: number;
  paidDate?: string;
  paymentMethod?: string;
  transactionId?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
}

export interface RegisterData extends Omit<User, 'id' | 'isActive'> {
  password: string;
  confirmPassword: string;
  terms?: boolean;
  // Student-specific fields
  rollNumber?: string;
  classId?: string;
  sectionId?: string;
  parentId?: string;
  admissionDate?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  // Teacher-specific fields
  employeeId?: string;
  subjects?: string[];
  classes?: string[];
  qualification?: string;
  experience?: number;
  salary?: number;
  // Parent-specific fields
  children?: string[];
  occupation?: string;
  // Admin-specific fields
  permissions?: string[];
  department?: string;
}
