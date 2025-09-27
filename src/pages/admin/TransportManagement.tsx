import React from 'react';

const TransportManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Transport Management</h2>
        <p className="text-gray-600">Manage buses, routes and transport allocations.</p>
      </div>
      <div className="p-4 bg-white rounded-lg shadow-sm border">
        <p className="text-sm text-gray-600">Routes and vehicle setup will be included.</p>
      </div>
    </div>
  );
};

export default TransportManagement;
