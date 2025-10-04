/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Users,
} from 'lucide-react';
import { useGetStudentAttendanceQuery } from '../../store/api/attendanceApi';
import { useGetStudentsQuery } from '../../store/api/studentApi';

const ParentAttendance: React.FC = () => {
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [viewType, setViewType] = useState<'calendar' | 'list'>('calendar');

  // Load all active students for selection (in real app, backend should filter to parent's children)
  const { data: studentsData } = useGetStudentsQuery({ status: 'active', limit: 100 });
  const children = useMemo(() => (studentsData?.students ?? []), [studentsData]);

  // Calculate month date range
  const startDate = `${selectedMonth}-01`;
  const endDate = new Date(new Date(selectedMonth).getFullYear(), new Date(selectedMonth).getMonth() + 1, 0)
    .toISOString().split('T')[0];

  const { data: attendanceData, isLoading } = useGetStudentAttendanceQuery(
    selectedChildId ? { studentId: selectedChildId, startDate, endDate } : { studentId: '', startDate, endDate },
    { skip: !selectedChildId }
  );

  const records = useMemo(() => attendanceData || [], [attendanceData]);

  const summary = useMemo(() => {
    const totalDays = records.length;
    const presentDays = records.filter((r: any) => r.status === 'present').length;
    const absentDays = records.filter((r: any) => r.status === 'absent').length;
    const lateDays = records.filter((r: any) => r.status === 'late').length;
    const excusedDays = records.filter((r: any) => r.status === 'excused').length;
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
    return { totalDays, presentDays, absentDays, lateDays, excusedDays, attendancePercentage };
  }, [records]);

  // Calendar helpers
  const generateCalendarDays = () => {
    const year = new Date(selectedMonth).getFullYear();
    const month = new Date(selectedMonth).getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<any | null> = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const record = records.find((r: any) => r.date?.slice(0, 10) === dateStr);
      days.push({
        day,
        date: dateStr,
        record,
        isToday: dateStr === new Date().toISOString().split('T')[0],
      });
    }
    return days;
  };

  const calendarDays = useMemo(generateCalendarDays, [selectedMonth, records]);

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
      case 'present': return <CheckCircle className="h-4 w-4" />;
      case 'absent': return <XCircle className="h-4 w-4" />;
      case 'late': return <Clock className="h-4 w-4" />;
      case 'excused': return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Child Attendance</h1>
          <p className="text-gray-600">View and track your child's attendance</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Download Report</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Child</label>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a child</option>
              {children.map((c: any) => (
                <option key={c._id} value={c._id}>
                  {c.name || `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim()} (Roll: {c.rollNumber || 'N/A'})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value as 'calendar' | 'list')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="calendar">Calendar View</option>
              <option value="list">List View</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty state when no child selected */}
      {!selectedChildId && (
        <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Select a child to view attendance</h3>
          <p className="text-gray-600">Choose a child from the dropdown to see detailed attendance information.</p>
        </div>
      )}

      {/* Content */}
      {selectedChildId && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[{label:'Total Days', value: summary.totalDays, color:'bg-blue-500', icon: CalendarIcon},
              {label:'Present', value: summary.presentDays, color:'bg-green-500', icon: CheckCircle},
              {label:'Absent', value: summary.absentDays, color:'bg-red-500', icon: XCircle},
              {label:'Late', value: summary.lateDays, color:'bg-yellow-500', icon: Clock}].map((stat: any, idx: number) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Attendance Rate */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Attendance Rate</h3>
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Rate</span>
                <span className="text-2xl font-bold text-blue-600">{summary.attendancePercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${summary.attendancePercentage}%` }} />
              </div>
            </div>
          </div>

          {/* Calendar or List */}
          {viewType === 'calendar' ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Attendance Calendar - {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                  <div key={d} className="p-2 text-center text-sm font-medium text-gray-500">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => (
                  <div key={idx} className="aspect-square">
                    {day ? (
                      <div className={`w-full h-full p-1 rounded-lg border-2 flex flex-col items-center justify-center text-sm ${
                        day.isToday ? 'border-blue-500 bg-blue-50' : day.record ? getStatusColor(day.record.status) : 'border-gray-200 bg-gray-50'
                      }`}>
                        <span className="font-medium">{day.day}</span>
                        {day.record && (<div className="mt-1">{getStatusIcon(day.record.status)}</div>)}
                      </div>
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marked By</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading records...</td></tr>
                    ) : records.length > 0 ? (
                      records.map((record: any) => (
                        <tr key={record._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                              {getStatusIcon(record.status)}
                              <span className="ml-1 capitalize">{record.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.remarks || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.markedBy?.name || 'System'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No attendance records found for this child and month</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ParentAttendance;
