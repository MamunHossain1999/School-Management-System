import React from 'react';

const ParentExamSchedule: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Exam Schedule</h2>
      <div className="p-4 bg-white rounded-lg shadow-sm border">
        <p className="text-gray-600">View upcoming exam schedule for your child.</p>
      </div>
    </div>
  );
};

export default ParentExamSchedule;
