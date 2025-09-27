import React from 'react';

const AttendanceAdmin: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
        <p className="text-gray-600">View and record attendance of students, teachers and staff.</p>
      </div>
      <div className="p-4 bg-white rounded-lg shadow-sm border">
        <p className="text-sm text-gray-600">Attendance summary and actions will be here.</p>
      </div>
    </div>
  );
};

export default AttendanceAdmin;
