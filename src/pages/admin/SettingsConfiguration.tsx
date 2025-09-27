import React from 'react';

const SettingsConfiguration: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings & Configuration</h2>
        <p className="text-gray-600">School profile, notifications, permissions, backup and security.</p>
      </div>
      <div className="p-4 bg-white rounded-lg shadow-sm border">
        <p className="text-sm text-gray-600">Configuration panels will be added here.</p>
      </div>
    </div>
  );
};

export default SettingsConfiguration;
