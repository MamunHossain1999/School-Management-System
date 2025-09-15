import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import { initializeAuth } from "./store/slices/authSlice";
import type { AppDispatch } from "./store";
import AdminLayout from "./components/layout/AdminLayout";
import TeacherLayout from "./components/layout/TeacherLayout";
import StudentLayout from "./components/layout/StudentLayout";
import ParentLayout from "./components/layout/ParentLayout";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import ParentDashboard from "./pages/parent/ParentDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import TeacherProfile from "./pages/teacher/TeacherProfile";
import StudentProfile from "./pages/student/StudentProfile";
import ParentProfile from "./pages/parent/ParentProfile";
import TestSlider from "./pages/TestSlider";
import UserManagement from "./pages/admin/UserManagement";
import AdminAcademi from "./pages/admin/AcademicPage";
import SchoolInfo from "./pages/admin/SchoolInfo";
import AttendanceManagement from "./pages/teacher/AttendanceManagement";
import AssignmentManagement from "./pages/teacher/AssignmentManagement";
import GradeManagement from "./pages/teacher/GradeManagement";
import ClassesPage from "./pages/classAndSubject/ClassesPage";
import SubjectsPage from "./pages/classAndSubject/SubjectsPage";
import AssignmentsPage from "./pages/classAndSubject/AssignmentsPage";


function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    console.log('🚀 App component mounted, initializing auth state...');
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/test-slider" element={<TestSlider />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="academic" element={<AdminAcademi />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="school-info" element={<SchoolInfo />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Teacher Routes */}
        <Route
          path="/teacher/*"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="assignments" element={<AssignmentManagement />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="grades" element={<GradeManagement />} />
          <Route path="profile" element={<TeacherProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Student Routes */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="grades" element={<GradeManagement />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Parent Routes */}
        <Route
          path="/parent/*"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<ParentDashboard />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="grades" element={<GradeManagement />} />
          <Route path="profile" element={<ParentProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Unauthorized page */}
        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  403
                </h1>
                <p className="text-gray-600 mb-4">
                  You don't have permission to access this page.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="btn-primary"
                >
                  Go Back
                </button>
              </div>
            </div>
          }
        />

        {/* 404 page */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  404
                </h1>
                <p className="text-gray-600 mb-4">
                  The page you're looking for doesn't exist.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="btn-primary"
                >
                  Go Back
                </button>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
