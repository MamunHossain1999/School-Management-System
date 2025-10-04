/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Users, Clock, Check, X, Download, Save, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useGetClassesQuery, useGetSectionsQuery } from '../../store/api/academicApi';
import { useGetStudentsQuery } from '../../store/api/studentApi';
import { 
  useMarkAttendanceMutation, 
  useGetAttendanceRecordsQuery 
} from '../../store/api/attendanceApi';

interface StudentAttendance {
  id: string;
  name: string;
  rollNumber: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

const AttendanceManagement: React.FC = () => {
  const { data: classes, isLoading: isClassesLoading } = useGetClassesQuery();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  // Load sections for the selected class only to keep data consistent
  const { data: sections } = useGetSectionsQuery(selectedClass ? { classId: selectedClass } : undefined);
  const [markAttendance] = useMarkAttendanceMutation();
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Get students for selected class and section
  const { data: studentsResponse, isLoading: isStudentsLoading } = useGetStudentsQuery(
    selectedClass && selectedSection ? { class: selectedClass, section: selectedSection } : undefined,
    { skip: !selectedClass || !selectedSection }
  );

  // Get existing attendance for the selected date
  const { data: existingAttendance } = useGetAttendanceRecordsQuery(
    selectedClass && selectedSection && selectedDate 
      ? { classId: selectedClass, sectionId: selectedSection, date: selectedDate }
      : undefined,
    { skip: !selectedClass || !selectedSection || !selectedDate }
  );

  useEffect(() => {
    if (studentsResponse?.students && Array.isArray(studentsResponse.students)) {
      const attendanceMap = new Map();
      if (existingAttendance && Array.isArray(existingAttendance)) {
        existingAttendance.forEach((record: any) => {
          attendanceMap.set(record.student._id || record.student, {
            status: record.status,
            remarks: record.remarks
          });
        });
      }

      const studentList: StudentAttendance[] = studentsResponse.students.map((student: any) => {
        const existingRecord = attendanceMap.get(student._id);
        return {
          id: student._id,
          name: student.name || `${student.firstName} ${student.lastName}`,
          rollNumber: student.rollNumber || student.studentId || 'N/A',
          status: existingRecord?.status || 'present',
          remarks: existingRecord?.remarks || ''
        };
      });

      setStudents(studentList);
    } else {
      setStudents([]);
    }
  }, [studentsResponse, existingAttendance]);

  const handleStatusChange = (studentId: string, status: StudentAttendance['status']) => {
    setStudents(prev =>
      prev.map(student =>
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  const handleSubmitAttendance = async () => {
    if (!selectedClass || !selectedSection) {
      toast.error('Please select class and section');
      return;
    }
    // Open confirmation modal instead of direct submit
    setIsConfirmOpen(true);
  };

  const confirmMarkAttendance = async () => {
    if (!selectedClass || !selectedSection) return;
    setIsSubmitting(true);
    try {
      const attendanceData = {
        classId: selectedClass,
        sectionId: selectedSection,
        date: selectedDate,
        attendance: students.map(student => ({
          studentId: student.id,
          status: student.status,
        }))
      };

      await markAttendance(attendanceData).unwrap();
      toast.success('Attendance marked successfully');
      setIsConfirmOpen(false);
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      toast.error('Failed to mark attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'excused': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <Check className="h-4 w-4" />;
      case 'absent': return <X className="h-4 w-4" />;
      case 'late': return <Clock className="h-4 w-4" />;
      case 'excused': return <Users className="h-4 w-4" />;
      default: return null;
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const attendanceStats = {
    present: filteredStudents.filter(s => s.status === 'present').length,
    absent: filteredStudents.filter(s => s.status === 'absent').length,
    late: filteredStudents.filter(s => s.status === 'late').length,
    excused: filteredStudents.filter(s => s.status === 'excused').length,
    total: filteredStudents.length,
  };

  const attendancePercentage = filteredStudents.length > 0
    ? Math.round((attendanceStats.present / filteredStudents.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Mark and manage student attendance</p>
        </div>
        <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Class</option>
            {Array.isArray(classes) && classes.map((cls: any) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
          {isClassesLoading && <p className="text-sm text-gray-500">Loading classes...</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            disabled={!selectedClass}
          >
            <option value="">Select Section</option>
            {Array.isArray(sections) && sections.map((section: any) => (
              <option key={section.id || section._id} value={section.id || section._id}>
                Section {section.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Statistics + List */}
      {students.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold">{attendanceStats.total}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
              <div className="text-sm text-gray-600">Present</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
              <div className="text-sm text-gray-600">Absent</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</div>
              <div className="text-sm text-gray-600">Late</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-blue-600">{attendancePercentage}%</div>
              <div className="text-sm text-gray-600">Attendance Rate</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border space-y-3">
            {isStudentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="h-8 w-20 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              filteredStudents?.map(student => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">{student.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-500">Roll: {student.rollNumber}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {(['present', 'absent', 'late', 'excused'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(student.id, status)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg border text-sm font-medium ${
                        student.status === status
                          ? getStatusColor(status)
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {getStatusIcon(status)}
                      <span className="capitalize">{status}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))
            )}
            <div className="flex items-center justify-end mt-6 pt-4 border-t">
              <button
                onClick={handleSubmitAttendance}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>{isSubmitting ? 'Saving...' : 'Save Attendance'}</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Attendance</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">You are about to mark attendance for <strong>{selectedDate}</strong> — Class <strong>{selectedClass || 'N/A'}</strong>, Section <strong>{selectedSection || 'N/A'}</strong>.</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 rounded border text-center">
                  <div className="text-xl font-semibold">{attendanceStats.present}</div>
                  <div className="text-gray-600">Present</div>
                </div>
                <div className="p-3 bg-gray-50 rounded border text-center">
                  <div className="text-xl font-semibold">{attendanceStats.absent}</div>
                  <div className="text-gray-600">Absent</div>
                </div>
                <div className="p-3 bg-gray-50 rounded border text-center">
                  <div className="text-xl font-semibold">{attendanceStats.late}</div>
                  <div className="text-gray-600">Late</div>
                </div>
                <div className="p-3 bg-gray-50 rounded border text-center">
                  <div className="text-xl font-semibold">{attendanceStats.excused}</div>
                  <div className="text-gray-600">Excused</div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => !isSubmitting && setIsConfirmOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMarkAttendance}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving…' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
