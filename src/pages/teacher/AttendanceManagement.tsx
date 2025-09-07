import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Calendar, 
  Users, 
  Check, 
  X, 
  Clock, 
  Save,
  Filter,
  Download,
  Search
} from 'lucide-react';
import { RootState, AppDispatch } from '../../store';
import { markAttendance, fetchAttendance } from '../../store/slices/attendanceSlice';
import { fetchClasses } from '../../store/slices/academicSlice';
import toast from 'react-hot-toast';

interface StudentAttendance {
  id: string;
  name: string;
  rollNumber: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

const AttendanceManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { classes } = useSelector((state: RootState) => state.academic);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock student data
  const mockStudents: StudentAttendance[] = [
    { id: '1', name: 'John Smith', rollNumber: '001', status: 'present' },
    { id: '2', name: 'Emma Johnson', rollNumber: '002', status: 'present' },
    { id: '3', name: 'Michael Brown', rollNumber: '003', status: 'absent' },
    { id: '4', name: 'Sarah Davis', rollNumber: '004', status: 'present' },
    { id: '5', name: 'David Wilson', rollNumber: '005', status: 'late' },
    { id: '6', name: 'Lisa Anderson', rollNumber: '006', status: 'present' },
    { id: '7', name: 'James Taylor', rollNumber: '007', status: 'present' },
    { id: '8', name: 'Maria Garcia', rollNumber: '008', status: 'excused' },
    { id: '9', name: 'Robert Martinez', rollNumber: '009', status: 'present' },
    { id: '10', name: 'Jennifer Lee', rollNumber: '010', status: 'present' },
  ];

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      setStudents(mockStudents);
    }
  }, [selectedClass, selectedSection]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
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

    setIsSubmitting(true);
    try {
      const attendanceData = students.map(student => ({
        studentId: student.id,
        classId: selectedClass,
        sectionId: selectedSection,
        date: selectedDate,
        status: student.status,
        markedBy: user?.id || '',
      }));

      await dispatch(markAttendance(attendanceData)).unwrap();
      toast.success('Attendance marked successfully');
    } catch (error) {
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

  const attendanceStats = {
    present: students.filter(s => s.status === 'present').length,
    absent: students.filter(s => s.status === 'absent').length,
    late: students.filter(s => s.status === 'late').length,
    excused: students.filter(s => s.status === 'excused').length,
    total: students.length,
  };

  const attendancePercentage = students.length > 0 
    ? Math.round((attendanceStats.present / students.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Mark and manage student attendance</p>
        </div>
        <div className="flex space-x-2">
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input-field"
            >
              <option value="">Select Class</option>
              <option value="1">Class 10-A</option>
              <option value="2">Class 10-B</option>
              <option value="3">Class 11-A</option>
              <option value="4">Class 11-B</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="input-field"
              disabled={!selectedClass}
            >
              <option value="">Select Section</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                if (selectedClass && selectedSection) {
                  setStudents(mockStudents);
                }
              }}
              className="btn-primary w-full"
              disabled={!selectedClass || !selectedSection}
            >
              Load Students
            </button>
          </div>
        </div>
      </div>

      {students.length > 0 && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="card text-center">
              <div className="text-2xl font-bold text-gray-900">{attendanceStats.total}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
              <div className="text-sm text-gray-600">Present</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
              <div className="text-sm text-gray-600">Absent</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</div>
              <div className="text-sm text-gray-600">Late</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-primary-600">{attendancePercentage}%</div>
              <div className="text-sm text-gray-600">Attendance Rate</div>
            </div>
          </div>

          {/* Attendance List */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Mark Attendance - {new Date(selectedDate).toLocaleDateString()}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setStudents(prev => prev.map(s => ({ ...s, status: 'present' })));
                  }}
                  className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200"
                >
                  Mark All Present
                </button>
                <button
                  onClick={() => {
                    setStudents(prev => prev.map(s => ({ ...s, status: 'absent' })));
                  }}
                  className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full hover:bg-red-200"
                >
                  Mark All Absent
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {student.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">Roll: {student.rollNumber}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {(['present', 'absent', 'late', 'excused'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(student.id, status)}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
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
              ))}
            </div>

            <div className="flex items-center justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleSubmitAttendance}
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>{isSubmitting ? 'Saving...' : 'Save Attendance'}</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {students.length === 0 && selectedClass && selectedSection && (
        <div className="card text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
          <p className="text-gray-600">
            No students found for the selected class and section.
          </p>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
