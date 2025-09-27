/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { 
  Users, 
  ClipboardCheck, 
  FileText, 
  Calendar,
  Clock,
  BookOpen,
  Award,
  MessageSquare
} from 'lucide-react';


import type { RootState } from '../../store';
import { useGetAssignmentsQuery } from '../../store/api/assignmentApi';
import { useGetTeacherScheduleQuery } from '../../store/api/teacherApi';


const TeacherDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const teacherId = (user as any)?._id || (user as any)?.id || '';
  
  // Use RTK Query hooks to fetch data
  const { data: assignments = [] } = useGetAssignmentsQuery({}, { skip: !teacherId });
  const { data: scheduleData } = useGetTeacherScheduleQuery(teacherId, { skip: !teacherId });

  const todayName = useMemo(() => {
    return new Date().toLocaleDateString(undefined, { weekday: 'long' }).toLowerCase();
  }, []);

  // Normalize schedule array for today if API returns array of schedules
  const todaySchedule = useMemo(() => {
    const raw = Array.isArray(scheduleData) ? scheduleData : [];
    // Expect items with shape { day: string, periods: [{ startTime, endTime, subject, class, section }] }
    const forToday = raw.find((s: any) => (s?.day || '').toLowerCase() === todayName);
    const periods = Array.isArray(forToday?.periods) ? forToday.periods : [];
    return periods.map((p: any) => ({
      time: `${p.startTime ?? ''} - ${p.endTime ?? ''}`.trim(),
      subject: p.subject ?? 'N/A',
      class: p.class && p.section ? `${p.class}-${p.section}` : (p.class ?? 'N/A'),
      room: p.room ?? '—',
    }));
  }, [scheduleData, todayName]);


  const stats = [
    {
      title: 'My Students',
      value: '—', // Requires a dedicated backend endpoint; can be added later
      icon: Users,
      color: 'bg-blue-500',
      description: 'Across all classes',
    },
    {
      title: 'Classes Today',
      value: todaySchedule.length,
      icon: BookOpen,
      color: 'bg-green-500',
      description: 'Scheduled for today',
    },
    {
      title: 'Assignments',
      value: assignments.length,
      icon: FileText,
      color: 'bg-purple-500',
      description: 'Active assignments',
    },
    {
      title: 'Attendance Rate',
      value: '—', // Hook up to attendance API analytics when available
      icon: ClipboardCheck,
      color: 'bg-orange-500',
      description: 'This week',
    },
  ];

  // recentActivities could be sourced from multiple APIs (assignments, attendance, exams, messages)
  // For now, keep placeholders; can be wired to real data later.

  const recentActivities = [
    {
      id: 1,
      message: 'Assignment submitted by 25 students in Class 10-A',
      time: '2 hours ago',
      type: 'assignment',
    },
    {
      id: 2,
      message: 'Attendance marked for Class 11-B',
      time: '3 hours ago',
      type: 'attendance',
    },
    {
      id: 3,
      message: 'New message from parent of John Doe',
      time: '5 hours ago',
      type: 'message',
    },
    {
      id: 4,
      message: 'Exam results uploaded for Mid-term Physics',
      time: '1 day ago',
      type: 'exam',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Good morning, {user?.name}!</h1>
        <p className="text-green-100">
          You have 6 classes scheduled for today. Ready to inspire young minds?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Today's Schedule
            </h2>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString()}
            </span>
          </div>
          <div className="space-y-3">
            {todaySchedule.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg">
                    <Clock className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.subject}</p>
                    <p className="text-sm text-gray-600">{item.class} • {item.room}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  {activity.type === 'assignment' && <FileText className="h-4 w-4 text-gray-600" />}
                  {activity.type === 'attendance' && <ClipboardCheck className="h-4 w-4 text-gray-600" />}
                  {activity.type === 'message' && <MessageSquare className="h-4 w-4 text-gray-600" />}
                  {activity.type === 'exam' && <Award className="h-4 w-4 text-gray-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <ClipboardCheck className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-900">Mark Attendance</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <FileText className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-900">Create Assignment</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <Award className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-900">Grade Exams</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            <MessageSquare className="h-8 w-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-orange-900">Send Message</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
