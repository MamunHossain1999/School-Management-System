import React from 'react';

const ResultEntry: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Result Entry</h2>
      <div className="p-4 bg-white rounded-lg shadow-sm border">
        <p className="text-gray-600">Enter marks and grades for your subject's exams. Review and submit results.</p>
      </div>
    </div>
  );
};

export default ResultEntry;
