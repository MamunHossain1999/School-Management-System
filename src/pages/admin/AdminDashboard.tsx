/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Bell,
  Award,
  X
} from 'lucide-react';
import { useGetNoticesQuery, useCreateNoticeMutation } from '../../store/api/noticeApi';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchUsers } from '../../store/slices/userSlice';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Auth state to avoid fetching before token is ready
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  // Modal states for Quick Actions
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  
  // Notice form state
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    type: 'general' as 'general' | 'important' | 'event' | 'holiday' | 'exam',
    targetAudience: 'all' as 'all' | 'students' | 'teachers' | 'parents' | 'staff',
    publishDate: new Date().toISOString().slice(0, 10),
    expiryDate: ''
  });
  
  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'meeting' as 'meeting' | 'exam' | 'holiday' | 'sports' | 'cultural'
  });

  // Notices (skip until authenticated to prevent 401 and then fetch once ready)
  const { data: noticesData, isLoading: noticesLoading, isError, error } = useGetNoticesQuery(
    {},
    { skip: !isAuthenticated, refetchOnFocus: true, refetchOnReconnect: true }
  );
  const [createNotice, { isLoading: isCreatingNotice }] = useCreateNoticeMutation();
  const notices = useMemo(() => {
    console.log('AdminDashboard Notices Debug:', {
      noticesLoading,
      isError,
      error,
      noticesData,
      noticesDataType: typeof noticesData,
      isArray: Array.isArray(noticesData)
    });
    
    // Support both array and wrapped API responses like { data: Notice[] }
    if (Array.isArray(noticesData)) {
      console.log('Notices found as direct array:', noticesData);
      return noticesData;
    }
    if (noticesData && typeof noticesData === 'object' && 'data' in (noticesData as any)) {
      const inner = (noticesData as any).data;
      console.log('Notices found in data property:', inner);
      return Array.isArray(inner) ? inner : [];
    }
    console.log('No notices found, returning empty array');
    return [];
  }, [noticesData, noticesLoading, isError, error]);

  // Users (students, teachers, parents) for stats
  const dispatch = useDispatch<AppDispatch>();
  const { users, students, teachers, parents, isLoading: usersLoading, error: usersError } = useSelector(
    (state: RootState) => state.user
  );

  useEffect(() => {
    // Fetch users once on mount
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    console.log('Notices Data:', notices);
  }, [notices]);

  // Quick Action Handlers
  const handleAddUser = () => {
    navigate('/admin/users/create');
  };

  const handleAddClass = () => {
    navigate('/admin/classes');
  };

  const handleSendNotice = () => {
    setShowNoticeModal(true);
  };

  const handleScheduleEvent = () => {
    setShowEventModal(true);
  };

  const handleCreateNotice = async () => {
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      await createNotice({
        title: noticeForm.title.trim(),
        content: noticeForm.content.trim(),
        type: noticeForm.type,
        targetAudience: noticeForm.targetAudience,
        publishDate: noticeForm.publishDate,
        expiryDate: noticeForm.expiryDate || undefined,
        attachments: []
      }).unwrap();
      
      toast.success('Notice published successfully');
      setShowNoticeModal(false);
      setNoticeForm({
        title: '',
        content: '',
        type: 'general',
        targetAudience: 'all',
        publishDate: new Date().toISOString().slice(0, 10),
        expiryDate: ''
      });
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to publish notice');
    }
  };

  const handleCreateEvent = () => {
    if (!eventForm.title.trim() || !eventForm.date || !eventForm.time) {
      toast.error('Title, date, and time are required');
      return;
    }

    // Store event data in localStorage to pass to EventsCalendar
    const eventData = {
      title: eventForm.title.trim(),
      description: eventForm.description.trim(),
      date: eventForm.date,
      time: eventForm.time,
      location: eventForm.location.trim(),
      type: eventForm.type
    };
    
    localStorage.setItem('pendingEvent', JSON.stringify(eventData));
    toast.success('Redirecting to Events Calendar...');
    
    setShowEventModal(false);
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      type: 'meeting'
    });
    
    // Navigate to events calendar
    navigate('/admin/events-calendar');
  };

  if (isError) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load notices.</p>
          <p className="text-gray-500 text-sm">{(error as any)?.status || ''} {(error as any)?.error || (error as any)?.data?.message || ''}</p>
        </div>
      </div>
    );
  }

  // Stats derived from users array
  const totalStudents = students?.length ?? users.filter((u: any) => u.role === 'student').length;
  const totalTeachers = teachers?.length ?? users.filter((u: any) => u.role === 'teacher').length;
  const totalParents = parents?.length ?? users.filter((u: any) => u.role === 'parent').length;
  const activeClasses = 10; // যদি API থাকে, এখানে dynamic করা যাবে

  const stats = [
    { title: 'Total Students', value: totalStudents, icon: GraduationCap, color: 'bg-blue-500', change: '+12%' },
    { title: 'Total Teachers', value: totalTeachers, icon: Users, color: 'bg-green-500', change: '+3%' },
    { title: 'Total Parents', value: totalParents, icon: Users, color: 'bg-purple-500', change: '+8%' },
    { title: 'Active Classes', value: activeClasses, icon: BookOpen, color: 'bg-orange-500', change: '+2%' },
  ];

  const recentActivities = [
    { id: 1, type: 'user', message: 'New student John Doe registered', time: '2 hours ago', icon: Users },
    { id: 2, type: 'exam', message: 'Mid-term exams scheduled for next week', time: '4 hours ago', icon: Award },
    { id: 3, type: 'notice', message: 'New notice published: Holiday announcement', time: '6 hours ago', icon: Bell },
    { id: 4, type: 'fee', message: 'Fee payment reminder sent to 150 students', time: '1 day ago', icon: DollarSign },
  ];

  if (noticesLoading || usersLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load users.</p>
          <p className="text-gray-500 text-sm">{String(usersError)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, Admin!</h1>
        <p className="text-indigo-100 text-sm md:text-base">
          Here's what's happening at your school today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-5 flex justify-between items-center transition hover:shadow-lg">
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" /> {stat.change}
              </p>
            </div>
            <div className={`${stat.color} p-3 rounded-xl flex items-center justify-center`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            <button 
              onClick={() => navigate('/admin/users')}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="bg-gray-100 p-2 rounded-lg flex-shrink-0">
                  <activity.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Notices */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Notices</h2>
            <button 
              onClick={() => navigate('/admin/notices')}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {notices.slice(0, 4).map((notice: any) => (
              <div key={notice._id ?? notice.id} className="border-l-4 border-indigo-500 pl-4">
                <h3 className="text-sm font-medium text-gray-900">{notice.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{notice.publishDate ? new Date(notice.publishDate).toLocaleDateString() : ''}</p>
              </div>
            ))}
            {notices.length === 0 && <p className="text-sm text-gray-500">No notices available</p>}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Add User Button */}
          <button 
            onClick={handleAddUser}
            className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors group"
            title="Add New User"
          >
            <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Add User
          </button>
          
          {/* Add Class Button */}
          <button 
            onClick={handleAddClass}
            className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-colors group"
            title="Add New Class"
          >
            <BookOpen className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Add Class
          </button>
          
          {/* Send Notice Button */}
          <button 
            onClick={handleSendNotice}
            className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 transition-colors group"
            title="Send Notice"
          >
            <Bell className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Send Notice
          </button>
          
          {/* Schedule Event Button */}
          <button 
            onClick={handleScheduleEvent}
            className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 transition-colors group"
            title="Schedule Event"
          >
            <Calendar className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Schedule Event
          </button>
        </div>
      </div>

      {/* Notice Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Send Notice</h3>
              </div>
              <button 
                onClick={() => setShowNoticeModal(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notice title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={noticeForm.type}
                  onChange={(e) => setNoticeForm(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="important">Important</option>
                  <option value="event">Event</option>
                  <option value="holiday">Holiday</option>
                  <option value="exam">Exam</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select
                  value={noticeForm.targetAudience}
                  onChange={(e) => setNoticeForm(prev => ({ ...prev, targetAudience: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="students">Students</option>
                  <option value="teachers">Teachers</option>
                  <option value="parents">Parents</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Notice content"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowNoticeModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNotice}
                  disabled={isCreatingNotice || !noticeForm.title || !noticeForm.content}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isCreatingNotice ? 'Sending...' : 'Send Notice'}
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Schedule Event</h3>
              </div>
              <button 
                onClick={() => setShowEventModal(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Event title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="meeting">Meeting</option>
                  <option value="exam">Exam</option>
                  <option value="holiday">Holiday</option>
                  <option value="sports">Sports</option>
                  <option value="cultural">Cultural</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Event location"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Event description"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Schedule
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
