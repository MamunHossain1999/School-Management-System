import React from 'react';

const FeesManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Fees & Payment Management</h2>
        <p className="text-gray-600">Set tuition fees, collect payments, generate invoices and track dues.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-1">Fee Setup</h3>
          <p className="text-sm text-gray-600">Configure fee structures.</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-1">Payment Collection</h3>
          <p className="text-sm text-gray-600">Collect and record payments.</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-1">Invoices & Receipts</h3>
          <p className="text-sm text-gray-600">Generate invoices and receipts.</p>
        </div>
      </div>
    </div>
  );
};

export default FeesManagement;
