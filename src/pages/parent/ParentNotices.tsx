import React from 'react';
import NoticesList from '../../components/common/NoticesList';

const ParentNotices: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Notices</h2>
      <NoticesList title="All Notices" audience="parents" onlyActive={false} />
    </div>
  );
};

export default ParentNotices;
