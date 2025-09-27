import React from 'react';

const ClassRoutine: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Class Routine / Time Table</h2>
        <p className="text-gray-600">Manage class routines and time tables for different classes and sections.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-2">Create Routine</h3>
          <p className="text-sm text-gray-600">Add class periods and assign subjects/teachers.</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-2">View Routines</h3>
          <p className="text-sm text-gray-600">Browse routines by class, section and day.</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-2">Export/Print</h3>
          <p className="text-sm text-gray-600">Export or print time tables for notice boards.</p>
        </div>
      </div>
    </div>
  );
};

export default ClassRoutine;
