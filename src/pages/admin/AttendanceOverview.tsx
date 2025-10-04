/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Filter,
  Search,
  BarChart3,
  PieChart,
} from 'lucide-react';
import {
  useGetAttendanceStatsQuery,
  useGetAttendanceSummaryQuery,
  useGetAttendanceRecordsQuery,
  useUpdateAttendanceRecordMutation,
  useDeleteAttendanceRecordMutation,
} from '../../store/api/attendanceApi';
import { useGetClassesQuery } from '../../store/api/academicApi';

const AttendanceOverview: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [dateRange, setDateRange] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [editModal, setEditModal] = useState<{ isOpen: boolean; record: any | null; status: 'present' | 'absent' | 'late' | 'excused'; remarks: string; isProcessing: boolean }>({ isOpen: false, record: null, status: 'present', remarks: '', isProcessing: false });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; record: any | null; isProcessing: boolean }>({ isOpen: false, record: null, isProcessing: false });

  // API queries
  const { data: classes } = useGetClassesQuery();
  const { data: attendanceStats, isLoading: statsLoading } = useGetAttendanceStatsQuery({ 
    date: dateRange === 'today' ? selectedDate : undefined 
  });
  
  const { data: attendanceSummary, isLoading: summaryLoading } = useGetAttendanceSummaryQuery({
    classId: selectedClass || undefined,
    sectionId: selectedSection || undefined,
    date: dateRange === 'today' ? selectedDate : undefined,
    startDate: dateRange === 'week' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
    endDate: dateRange === 'week' ? selectedDate : undefined,
  });

  const { data: attendanceRecords } = useGetAttendanceRecordsQuery({
    classId: selectedClass || undefined,
    date: selectedDate,
  });

  const [updateAttendanceRecord] = useUpdateAttendanceRecordMutation();
  const [deleteAttendanceRecord] = useDeleteAttendanceRecordMutation();

  // Filter records based on search
  const filteredRecords = attendanceRecords?.filter((record: any) =>
    record.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.student?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const overallStats = [
    {
      label: 'Total Students',
      value: attendanceStats?.totalStudents || 0,
      color: 'bg-blue-500',
      icon: Users,
      trend: '+5%',
      trendUp: true,
    },
    {
      label: 'Present Today',
      value: attendanceStats?.presentToday || 0,
      color: 'bg-green-500',
      icon: CheckCircle,
      trend: '+2%',
      trendUp: true,
    },
    {
      label: 'Absent Today',
      value: attendanceStats?.absentToday || 0,
      color: 'bg-red-500',
      icon: XCircle,
      trend: '-1%',
      trendUp: false,
    },
    {
      label: 'Late Today',
      value: attendanceStats?.lateToday || 0,
      color: 'bg-yellow-500',
      icon: Clock,
      trend: '0%',
      trendUp: true,
    },
  ];

  const attendanceRate = attendanceStats?.attendanceRate || 0;

  if (statsLoading || summaryLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Attendance Overview</h1>
          <p className="text-gray-600">Monitor attendance across all classes and students</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Classes</option>
              {Array.isArray(classes) && classes.map((cls: any) => (
                <option key={cls._id} value={cls._id}>
                  Class {cls.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedClass}
            >
              <option value="">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {overallStats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-1">
                  {stat.trendUp ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Rate Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Overall Attendance Rate</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Rate</span>
              <span className="text-2xl font-bold text-blue-600">{attendanceRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-gray-900">Target</div>
                <div className="text-gray-600">95%</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900">Difference</div>
                <div className={`${attendanceRate >= 95 ? 'text-green-600' : 'text-red-600'}`}>
                  {(attendanceRate - 95).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Trends</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {attendanceStats?.weeklyStats?.slice(0, 7).map((day: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ 
                        width: `${day.present + day.absent + day.late > 0 ? (day.present / (day.present + day.absent + day.late)) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {day.present + day.absent + day.late > 0 
                      ? Math.round((day.present / (day.present + day.absent + day.late)) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            )) || (
              <div className="text-center text-gray-500 py-4">
                No weekly data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Summary from attendanceSummary */}
      {attendanceSummary && attendanceSummary.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Attendance Summary</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {attendanceSummary.reduce((sum, item) => sum + (item.presentCount || 0), 0)}
              </div>
              <div className="text-sm text-green-700">Total Present</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {attendanceSummary.reduce((sum, item) => sum + (item.absentCount || 0), 0)}
              </div>
              <div className="text-sm text-red-700">Total Absent</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {attendanceSummary.reduce((sum, item) => sum + (item.lateCount || 0), 0)}
              </div>
              <div className="text-sm text-yellow-700">Total Late</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-600">Average Attendance Rate</div>
            <div className="text-xl font-bold text-blue-600">
              {attendanceSummary.length > 0 
                ? (attendanceSummary.reduce((sum, item) => sum + (item.attendancePercentage || 0), 0) / attendanceSummary.length).toFixed(1)
                : '0.0'}%
            </div>
          </div>
        </div>
      )}

      {/* Class-wise Summary */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Class-wise Attendance</h3>
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Present
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Absent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Late
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(Array.isArray(attendanceSummary) ? attendanceSummary : (attendanceStats?.classWiseStats || [])).map((classData: any, index: number) => {
                const totalStudents = classData.totalStudents || classData.total;
                const presentCount = classData.presentCount || classData.present;
                const rate = totalStudents > 0 ? (presentCount / totalStudents) * 100 : (classData.attendancePercentage || 0);
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Class {classData.class} - {classData.section}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {classData.totalStudents || classData.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {classData.presentCount || classData.present}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {classData.absentCount || classData.absent || ((classData.totalStudents || classData.total) - (classData.presentCount || classData.present))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                      {classData.lateCount || classData.late || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {rate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        rate >= 95
                          ? 'bg-green-100 text-green-800'
                          : rate >= 85
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {rate >= 95 ? 'Excellent' : rate >= 85 ? 'Good' : 'Needs Attention'}
                      </span>
                    </td>
                  </tr>
                );
              }) || (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No class data available for the selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Attendance Records */}
      {filteredRecords.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Attendance Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marked By
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.slice(0, 10).map((record: any) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-medium text-sm">
                            {record.student?.name?.charAt(0) || 'N'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.student?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Roll: {record.student?.rollNumber || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Class {record.class} - {record.section}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'present'
                          ? 'bg-green-100 text-green-800'
                          : record.status === 'late'
                          ? 'bg-yellow-100 text-yellow-800'
                          : record.status === 'excused'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.markedBy?.name || 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditModal({ isOpen: true, record, status: record.status, remarks: record.remarks || '', isProcessing: false })}
                          className="px-2 py-1 rounded-md border text-blue-600 hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, record, isProcessing: false })}
                          className="px-2 py-1 rounded-md border text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Attendance Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Edit Attendance</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editModal.status}
                  onChange={(e) => setEditModal(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <input
                  type="text"
                  value={editModal.remarks}
                  onChange={(e) => setEditModal(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => !editModal.isProcessing && setEditModal({ isOpen: false, record: null, status: 'present', remarks: '', isProcessing: false })}
                  disabled={editModal.isProcessing}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!editModal.record) return;
                    try {
                      setEditModal(prev => ({ ...prev, isProcessing: true }));
                      await updateAttendanceRecord({ id: editModal.record._id, status: editModal.status, remarks: editModal.remarks || undefined }).unwrap();
                    } catch (error) {
                      console.error('Failed to update attendance record', error);
                    } finally {
                      setEditModal({ isOpen: false, record: null, status: 'present', remarks: '', isProcessing: false });
                    }
                  }}
                  disabled={editModal.isProcessing}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
                >
                  {editModal.isProcessing ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Delete Attendance Record</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">Are you sure you want to delete the record for <strong>{deleteModal.record?.student?.name}</strong> dated <strong>{deleteModal.record ? new Date(deleteModal.record.date).toLocaleDateString() : ''}</strong>?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => !deleteModal.isProcessing && setDeleteModal({ isOpen: false, record: null, isProcessing: false })}
                  disabled={deleteModal.isProcessing}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!deleteModal.record) return;
                    try {
                      setDeleteModal(prev => ({ ...prev, isProcessing: true }));
                      await deleteAttendanceRecord(deleteModal.record._id).unwrap();
                    } catch (error) {
                      console.error('Failed to delete attendance record', error);
                    } finally {
                      setDeleteModal({ isOpen: false, record: null, isProcessing: false });
                    }
                  }}
                  disabled={deleteModal.isProcessing}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-60"
                >
                  {deleteModal.isProcessing ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceOverview;
