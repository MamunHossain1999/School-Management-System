import React from 'react';

const TeacherExams: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Exams Management</h2>
      <div className="p-4 bg-white rounded-lg shadow-sm border">
        <p className="text-gray-600">Create or view exam schedules for your subjects (if permitted). Upload question papers or manage exam details.</p>
      </div>
    </div>
  );
};

export default TeacherExams;
