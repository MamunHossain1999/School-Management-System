import React from 'react';

const RolesPermissions: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Roles & Permissions</h2>
        <p className="text-gray-600">Set roles like Teacher, Accountant, Librarian and manage permissions.</p>
      </div>
      <div className="p-4 bg-white rounded-lg shadow-sm border">
        <p className="text-sm text-gray-600">Role/permission mapping UI will be implemented.</p>
      </div>
    </div>
  );
};

export default RolesPermissions;
