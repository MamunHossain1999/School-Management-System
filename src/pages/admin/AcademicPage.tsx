import React, { useState } from 'react';
import ClassesPage from '../classAndSubject/ClassesPage';
import SubjectsPage from '../classAndSubject/SubjectsPage';
import AssignmentsPage from '../classAndSubject/AssignmentsPage';

const tabs = ['Classes', 'Subjects', 'Assignments'] as const;
type Tab = typeof tabs[number];

const AcademicPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Classes');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Classes':
        return <ClassesPage />;
      case 'Subjects':
        return <SubjectsPage />;
      case 'Assignments':
        return <AssignmentsPage />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default AcademicPage;
