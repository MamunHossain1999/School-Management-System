/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ClassesPage from '../classAndSubject/ClassesPage';
import SubjectsPage from '../classAndSubject/SubjectsPage';
import AssignmentsPage from '../classAndSubject/AssignmentsPage';
import SectionsPage from '../classAndSubject/SectionsPage';
import EnrollmentPage from '../classAndSubject/EnrollmentPage';
import { useGetClassesQuery } from '../../store/api/academicApi';

const tabs = ['Classes', 'Subjects', 'Sections', 'Enrollments', 'Assignments'] as const;
type Tab = typeof tabs[number];

const AcademicPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as Tab | null;
  const classFromUrl = searchParams.get('classId') || '';

  const initialTab: Tab = useMemo(() => {
    if (tabFromUrl && tabs.includes(tabFromUrl as Tab)) {
      return tabFromUrl as Tab;
    }
    return 'Classes'; // Default to Classes tab
  }, [tabFromUrl]);
  
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [selectedClassId, setSelectedClassId] = useState<string>(classFromUrl);

  // সব ক্লাস লোড
  const { data: classes = [], isLoading: isClassesLoading } = useGetClassesQuery();

  // Set default tab in URL if no tab is present
  useEffect(() => {
    if (!tabFromUrl) {
      const params = new URLSearchParams(searchParams);
      params.set('tab', 'Classes');
      setSearchParams(params, { replace: true });
    }
  }, [tabFromUrl, searchParams, setSearchParams]);

  // Keep URL in sync when local state changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', activeTab);
    if (selectedClassId) params.set('classId', selectedClassId);
    else params.delete('classId');
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedClassId]);

  // If URL changes externally, reflect it in state
  useEffect(() => {
    if (tabFromUrl && tabs.includes(tabFromUrl as Tab) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl as Tab);
    }
    const newClass = searchParams.get('classId') || '';
    if (newClass !== selectedClassId) setSelectedClassId(newClass);
  }, [tabFromUrl, searchParams]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Classes':
        return <ClassesPage />;

      case 'Subjects':
        // classId undefined হলে সব সাললেক্ট, আর দিলে নির্দিষ্ট ক্লাসের সাললেক্ট
        return (
          <SubjectsPage classId={selectedClassId ? selectedClassId : undefined} />
        );

      case 'Sections':
        return (
          <SectionsPage classId={selectedClassId ? selectedClassId : undefined} />
        );

      case 'Enrollments':
        return <EnrollmentPage />;

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
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Subjects বা Sections ট্যাবে ক্লাস ফিল্টার */}
      {(activeTab === 'Subjects' || activeTab === 'Sections') && (
        <div className="mb-4 flex items-center space-x-3">
          <label className="text-sm text-gray-700">Filter by Class:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isClassesLoading}
          >
            <option value="">All Classes</option>
            {classes.map((c: any) => (
              <option key={c._id ?? c.id} value={c._id ?? c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Active Tab Content */}
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default AcademicPage;
