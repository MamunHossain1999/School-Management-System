import React from 'react';

const ParentAttendance: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Attendance Monitor</h2>
      <div className="p-4 bg-white rounded-lg shadow-sm border">
        <p className="text-gray-600">See daily and monthly attendance of your child. Report missing attendance to school.</p>
      </div>
    </div>
  );
};

export default ParentAttendance;
