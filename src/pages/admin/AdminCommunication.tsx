import React from "react";

const AdminCommunication: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Communication Center</h2>
        <p className="text-gray-600">
          Manage announcements, messages, and communications between admins, teachers, students, and parents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-2">Create Announcement</h3>
          <p className="text-sm text-gray-600">Compose and publish notices to selected roles or classes.</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-2">Inbox</h3>
          <p className="text-sm text-gray-600">View recent messages and conversations.</p>
        </div>
      </div>

      <div className="p-4 bg-white rounded-lg shadow-sm border">
        <h3 className="font-semibold mb-2">Recent Activity</h3>
        <p className="text-sm text-gray-600">Communication logs and delivery status will appear here.</p>
      </div>
    </div>
  );
};

export default AdminCommunication;
