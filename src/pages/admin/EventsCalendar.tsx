import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, Clock, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'meeting' | 'exam' | 'holiday' | 'sports' | 'cultural';
  attendees?: string[];
  createdAt: string;
}

const EventsCalendar: React.FC = () => {
  // Mock events data - in real app this would come from API
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Annual Sports Day',
      description: 'School annual sports competition for all grades',
      date: '2024-12-15',
      time: '09:00',
      location: 'School Playground',
      type: 'sports',
      attendees: ['students', 'teachers', 'parents'],
      createdAt: '2024-11-01'
    },
    {
      id: '2',
      title: 'Parent-Teacher Meeting',
      description: 'Monthly parent-teacher conference',
      date: '2024-12-20',
      time: '14:00',
      location: 'Main Hall',
      type: 'meeting',
      attendees: ['teachers', 'parents'],
      createdAt: '2024-11-05'
    },
    {
      id: '3',
      title: 'Winter Break',
      description: 'School winter vacation',
      date: '2024-12-25',
      time: '00:00',
      location: 'School',
      type: 'holiday',
      attendees: ['students', 'teachers'],
      createdAt: '2024-10-15'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'meeting' as Event['type']
  });

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800';
      case 'exam':
        return 'bg-red-100 text-red-800';
      case 'holiday':
        return 'bg-green-100 text-green-800';
      case 'sports':
        return 'bg-orange-100 text-orange-800';
      case 'cultural':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateEvent = () => {
    if (!eventForm.title.trim() || !eventForm.date || !eventForm.time) {
      toast.error('Title, date, and time are required');
      return;
    }

    const newEvent: Event = {
      id: Date.now().toString(),
      title: eventForm.title.trim(),
      description: eventForm.description.trim(),
      date: eventForm.date,
      time: eventForm.time,
      location: eventForm.location.trim(),
      type: eventForm.type,
      attendees: ['students', 'teachers'],
      createdAt: new Date().toISOString()
    };

    setEvents(prev => [...prev, newEvent]);
    toast.success('Event created successfully');
    setShowCreateModal(false);
    resetForm();
  };

  const handleUpdateEvent = () => {
    if (!editingEvent || !eventForm.title.trim() || !eventForm.date || !eventForm.time) {
      toast.error('Title, date, and time are required');
      return;
    }

    setEvents(prev => prev.map(event => 
      event.id === editingEvent.id 
        ? {
            ...event,
            title: eventForm.title.trim(),
            description: eventForm.description.trim(),
            date: eventForm.date,
            time: eventForm.time,
            location: eventForm.location.trim(),
            type: eventForm.type
          }
        : event
    ));

    toast.success('Event updated successfully');
    setEditingEvent(null);
    resetForm();
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast.success('Event deleted successfully');
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      type: event.type
    });
  };

  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      type: 'meeting'
    });
  };

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Check for pending event from dashboard
  useEffect(() => {
    const pendingEventData = localStorage.getItem('pendingEvent');
    if (pendingEventData) {
      try {
        const eventData = JSON.parse(pendingEventData);
        const newEvent: Event = {
          id: Date.now().toString(),
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          time: eventData.time,
          location: eventData.location,
          type: eventData.type,
          attendees: ['students', 'teachers'],
          createdAt: new Date().toISOString()
        };
        
        setEvents(prev => [...prev, newEvent]);
        localStorage.removeItem('pendingEvent');
        toast.success('Event created successfully from dashboard!');
      } catch (error) {
        console.error('Error parsing pending event:', error);
        localStorage.removeItem('pendingEvent');
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Events & Holiday Calendar</h2>
          <p className="text-gray-600">Manage events, holidays and important dates.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-md p-5 border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(event.type)}`}>
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </span>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEditEvent(event)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-3">{event.description}</p>
            
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{event.time}</span>
              </div>
              {event.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              )}
              {event.attendees && (
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{event.attendees.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No events scheduled yet.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-2 text-blue-600 hover:text-blue-700"
          >
            Create your first event
          </button>
        </div>
      )}

      {/* Create/Edit Event Modal */}
      {(showCreateModal || editingEvent) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingEvent ? 'Edit Event' : 'Create Event'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingEvent(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
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
                  onChange={(e) => setEventForm(prev => ({ ...prev, type: e.target.value as Event['type'] }))}
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
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingEvent ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsCalendar;
