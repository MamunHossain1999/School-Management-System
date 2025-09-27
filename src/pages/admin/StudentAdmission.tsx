import React from 'react';

const StudentAdmission: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Student Admission</h2>
        <p className="text-gray-600">Admit new students and assign them to classes/sections.</p>
      </div>
      <div className="p-4 bg-white rounded-lg shadow-sm border">
        <p className="text-sm text-gray-600">Admission form will appear here.</p>
      </div>
    </div>
  );
};

export default StudentAdmission;
