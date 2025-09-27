// Parent-specific pages
import ParentChildProfile from "./pages/parent/ParentChildProfile";
import ParentAttendance from "./pages/parent/ParentAttendance";
import ParentExamSchedule from "./pages/parent/ParentExamSchedule";
import ParentResults from "./pages/parent/ParentResults";
import ParentFees from "./pages/parent/ParentFees";
import ParentNotices from "./pages/parent/ParentNotices";
// Reuse StudentEventsCalendar for parents for now
import StudentEventsCalendar from "./pages/student/StudentEventsCalendar";
// Reuse StudentAssignments for parents for now
import StudentAssignments from "./pages/student/StudentAssignments";
// Reuse StudentCommunication for parents for now
import StudentCommunication from "./pages/student/StudentCommunication";
// Reuse StudentTransport/Hostel for parents for now
import StudentTransport from "./pages/student/StudentTransport";
import StudentHostel from "./pages/student/StudentHostel";
// Student-specific pages
import StudentClassRoutine from "./pages/student/StudentClassRoutine";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentFees from "./pages/student/StudentFees";
import StudentExamsSchedule from "./pages/student/StudentExamsSchedule";
import StudentNotices from "./pages/student/StudentNotices";
import StudentLibrary from "./pages/student/StudentLibrary";
import StudentResources from "./pages/student/StudentResources";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";

import type { AppDispatch } from "./store";
import { initializeAuth } from "./store/slices/authSlice";
import AdminLayout from "./components/layout/AdminLayout";
import TeacherLayout from "./components/layout/TeacherLayout";
import StudentLayout from "./components/layout/StudentLayout";
import ParentLayout from "./components/layout/ParentLayout";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AttendanceOverview from "./pages/admin/AttendanceOverview";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import ParentDashboard from "./pages/parent/ParentDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminCommunication from "./pages/admin/AdminCommunication";
import TeacherProfile from "./pages/teacher/TeacherProfile";
import StudentProfile from "./pages/student/StudentProfile";
import ParentProfile from "./pages/parent/ParentProfile";
import TestSlider from "./pages/TestSlider";
import UserManagement from "./pages/admin/UserManagement";
import UserEdit from "./pages/admin/UserEdit";
import UserView from "./pages/admin/UserView";
import UserCreate from "./pages/admin/UserCreate";
import AdminAcademi from "./pages/admin/AcademicPage";
import SchoolInfo from "./pages/admin/SchoolInfo";
import AttendanceManagement from "./pages/teacher/AttendanceManagement";
import AssignmentManagement from "./pages/teacher/AssignmentManagement";
import AssignmentGrading from "./pages/teacher/AssignmentGrading";
import GradeManagement from "./pages/teacher/GradeManagement";
import SyllabusResources from "./pages/teacher/SyllabusResources";
import TeacherReports from "./pages/teacher/TeacherReports";
import TeacherNotices from "./pages/teacher/TeacherNotices";
import TeacherEventsCalendar from "./pages/teacher/TeacherEventsCalendar";
import TeacherCommunication from "./pages/teacher/TeacherCommunication";
import TeacherLibrary from "./pages/teacher/TeacherLibrary";
import ClassesPage from "./pages/classAndSubject/ClassesPage";
import SubjectsPage from "./pages/classAndSubject/SubjectsPage";
import AssignmentOverview from "./pages/admin/AssignmentOverview";
import ClassRoutine from "./pages/admin/ClassRoutine";
import StudentAdmission from "./pages/admin/StudentAdmission";
import StudentProfiles from "./pages/admin/StudentProfiles";
import IdCardsCertificates from "./pages/admin/IdCardsCertificates";
import FeeOverview from "./pages/admin/FeeOverview";
import ExamOverview from "./pages/admin/ExamOverview";
import ExamManagement from "./pages/teacher/ExamManagement";
import ExamResults from "./pages/teacher/ExamResults";
import FeeManagement from "./pages/teacher/FeeManagement";
import StudentExamResults from "./pages/student/StudentExamResults";
import NoticeBoard from "./pages/admin/NoticeBoard";
import EventsCalendar from "./pages/admin/EventsCalendar";
import LibraryManagement from "./pages/admin/LibraryManagement";
import HostelManagement from "./pages/admin/HostelManagement";
import TransportManagement from "./pages/admin/TransportManagement";
import ReportsAnalytics from "./pages/admin/ReportsAnalytics";
import SettingsConfiguration from "./pages/admin/SettingsConfiguration";
import RolesPermissions from "./pages/admin/RolesPermissions";
import TeachersPage from "./pages/admin/TeachersPage";


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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="users/create" element={<UserCreate />} />
          <Route path="users/:id" element={<UserView />} />
          <Route path="users/:id/edit" element={<UserEdit />} />
          <Route path="academic" element={<AdminAcademi />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="assignments" element={<AssignmentOverview />} />
          <Route path="attendance" element={<AttendanceOverview />} />
          <Route path="communication" element={<AdminCommunication />} />
          <Route path="class-routine" element={<ClassRoutine />} />
          <Route path="admissions" element={<StudentAdmission />} />
          <Route path="student-profiles" element={<StudentProfiles />} />
          <Route path="id-cards-certificates" element={<IdCardsCertificates />} />
          <Route path="fees" element={<FeeOverview />} />
          <Route path="exams" element={<ExamOverview />} />
          <Route path="notices" element={<NoticeBoard />} />
          <Route path="events-calendar" element={<EventsCalendar />} />
          <Route path="library" element={<LibraryManagement />} />
          <Route path="hostel" element={<HostelManagement />} />
          <Route path="transport" element={<TransportManagement />} />
          <Route path="reports" element={<ReportsAnalytics />} />
          <Route path="roles-permissions" element={<RolesPermissions />} />
          <Route path="settings" element={<SettingsConfiguration />} />
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
          <Route path="assignments/grading" element={<AssignmentGrading />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="fees" element={<FeeManagement />} />
          <Route path="grades" element={<GradeManagement />} />
          <Route path="syllabus-resources" element={<SyllabusResources />} />
          <Route path="exams" element={<ExamManagement />} />
          <Route path="result-entry" element={<ExamResults />} />
          <Route path="reports" element={<TeacherReports />} />
          <Route path="notices" element={<TeacherNotices />} />
          <Route path="events" element={<TeacherEventsCalendar />} />
          <Route path="communication" element={<TeacherCommunication />} />
          <Route path="library" element={<TeacherLibrary />} />
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
          <Route path="class-routine" element={<StudentClassRoutine />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="fees" element={<StudentFees />} />
          <Route path="exams" element={<StudentExamsSchedule />} />
          <Route path="results" element={<StudentExamResults />} />
          <Route path="notices" element={<StudentNotices />} />
          <Route path="events" element={<StudentEventsCalendar />} />
          <Route path="library" element={<StudentLibrary />} />
          <Route path="resources" element={<StudentResources />} />
          <Route path="communication" element={<StudentCommunication />} />
          <Route path="transport" element={<StudentTransport />} />
          <Route path="hostel" element={<StudentHostel />} />
          {/* Keeping generic grades route for compatibility */}
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
          <Route path="child-profile" element={<ParentChildProfile />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="attendance" element={<ParentAttendance />} />
          <Route path="exams" element={<ParentExamSchedule />} />
          <Route path="results" element={<ParentResults />} />
          <Route path="fees" element={<ParentFees />} />
          <Route path="notices" element={<ParentNotices />} />
          <Route path="events" element={<StudentEventsCalendar />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="communication" element={<StudentCommunication />} />
          <Route path="transport" element={<StudentTransport />} />
          <Route path="hostel" element={<StudentHostel />} />
          {/* Keep generic grades for compatibility if used elsewhere */}
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
