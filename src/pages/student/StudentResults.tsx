import React from 'react';

const StudentResults: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Results</h2>
      <div className="p-4 bg-white rounded-lg shadow-sm border">
        <p className="text-gray-600">View your marks, grades and download report card/transcript.</p>
      </div>
    </div>
  );
};

export default StudentResults;
