/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { useGetMyAttendanceQuery } from '../../store/api/attendanceApi';

const StudentAttendance: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [viewType, setViewType] = useState<'calendar' | 'list'>('calendar');

  // Calculate date range for the selected month
  const startDate = `${selectedMonth}-01`;
  const endDate = new Date(new Date(selectedMonth).getFullYear(), new Date(selectedMonth).getMonth() + 1, 0)
    .toISOString().split('T')[0];

  const { data: attendanceData, isLoading } = useGetMyAttendanceQuery({
    startDate,
    endDate,
  });

  const records = attendanceData?.records || [];
  const summary = attendanceData?.summary || {
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    excusedDays: 0,
    attendancePercentage: 0,
  };

  // Generate calendar days for the selected month
  const generateCalendarDays = () => {
    const year = new Date(selectedMonth).getFullYear();
    const month = new Date(selectedMonth).getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const record = records.find((r: any) => r.date === dateStr);
      days.push({
        day,
        date: dateStr,
        record,
        isToday: dateStr === new Date().toISOString().split('T')[0],
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

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

  const stats = [
    {
      label: 'Total Days',
      value: summary.totalDays,
      color: 'bg-blue-500',
      icon: Calendar,
    },
    {
      label: 'Present',
      value: summary.presentDays,
      color: 'bg-green-500',
      icon: CheckCircle,
    },
    {
      label: 'Absent',
      value: summary.absentDays,
      color: 'bg-red-500',
      icon: XCircle,
    },
    {
      label: 'Late',
      value: summary.lateDays,
      color: 'bg-yellow-500',
      icon: Clock,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-600">Track your daily attendance and performance</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
              <select
                value={viewType}
                onChange={(e) => setViewType(e.target.value as 'calendar' | 'list')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="calendar">Calendar View</option>
                <option value="list">List View</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
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

      {/* Attendance Percentage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Attendance Rate</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Rate</span>
              <span className="text-2xl font-bold text-blue-600">
                {summary.attendancePercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${summary.attendancePercentage}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-gray-900">Target</div>
                <div className="text-gray-600">95%</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900">Status</div>
                <div className={`${summary.attendancePercentage >= 95 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.attendancePercentage >= 95 ? 'Good' : 'Needs Improvement'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Breakdown</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Present</span>
              </div>
              <span className="font-medium">{summary.presentDays} days</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Absent</span>
              </div>
              <span className="font-medium">{summary.absentDays} days</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Late</span>
              </div>
              <span className="font-medium">{summary.lateDays} days</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Excused</span>
              </div>
              <span className="font-medium">{summary.excusedDays} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar or List View */}
      {viewType === 'calendar' ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Attendance Calendar - {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayData, index) => (
              <div key={index} className="aspect-square">
                {dayData ? (
                  <div
                    className={`w-full h-full p-1 rounded-lg border-2 flex flex-col items-center justify-center text-sm ${
                      dayData.isToday
                        ? 'border-blue-500 bg-blue-50'
                        : dayData.record
                        ? getStatusColor(dayData.record.status)
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{dayData.day}</span>
                    {dayData.record && (
                      <div className="mt-1">
                        {getStatusIcon(dayData.record.status)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full"></div>
                )}
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
              <span>Present</span>
            </div>
            <div className="flex items-center">
              <XCircle className="h-4 w-4 text-red-600 mr-1" />
              <span>Absent</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-yellow-600 mr-1" />
              <span>Late</span>
            </div>
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-blue-600 mr-1" />
              <span>Excused</span>
            </div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remarks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marked By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.length > 0 ? (
                  records.map((record: any) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                          <span className="ml-1 capitalize">{record.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.remarks || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.markedBy?.name || 'System'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No attendance records found for this month
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
