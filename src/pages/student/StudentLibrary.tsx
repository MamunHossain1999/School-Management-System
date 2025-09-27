import React from 'react';

const StudentLibrary: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Library</h2>
      <div className="p-4 bg-white rounded-lg shadow-sm border">
        <p className="text-gray-600">See your issued books and due dates.</p>
      </div>
    </div>
  );
};

export default StudentLibrary;
