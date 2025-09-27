import React from 'react';

const ParentChildProfile: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Child Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-2">Basic Information</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>Name: —</li>
            <li>Roll No: —</li>
            <li>Class: —</li>
            <li>Section: —</li>
            <li>Class Teacher: —</li>
          </ul>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-2">Admission & Contact</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>Admission No: —</li>
            <li>Admission Date: —</li>
            <li>Phone: —</li>
            <li>Email: —</li>
            <li>Address: —</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ParentChildProfile;
