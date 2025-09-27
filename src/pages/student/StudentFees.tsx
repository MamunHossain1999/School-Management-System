import React, { useState } from 'react';
import { 
  DollarSign, CreditCard, Calendar, Download, AlertTriangle, 
  CheckCircle, Clock, Filter, Search, Eye, Receipt, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  useGetStudentFeeSummaryQuery, useGetFeesQuery, useProcessPaymentMutation,
  useGetPaymentHistoryQuery, type FeeRecord, type PaymentRequest 
} from '../../store/api/feeApi';
import { useAppSelector } from '../../store/hooks';

const StudentFees: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [selectedFeeType, setSelectedFeeType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'details' | 'history'>('summary');

  // API queries
  const { data: feeSummary, isLoading: summaryLoading } = useGetStudentFeeSummaryQuery(user?._id || '');
  const { data: fees = [], isLoading: feesLoading } = useGetFeesQuery({ 
    studentId: user?._id 
  });
  const { data: paymentHistory = [] } = useGetPaymentHistoryQuery({ 
    studentId: user?._id 
  });

  // Mutations
  const [processPayment] = useProcessPaymentMutation();

  // Filter fees
  const filteredFees = fees.filter(fee => {
    const matchesFeeType = selectedFeeType === '' || fee.feeType === selectedFeeType;
    const matchesStatus = selectedStatus === '' || fee.status === selectedStatus;
    return matchesFeeType && matchesStatus;
  });

  const handlePayment = async (paymentData: PaymentRequest) => {
    if (!selectedFee) return;
    
    try {
      await processPayment({ 
        feeId: selectedFee._id, 
        paymentData 
      }).unwrap();
      toast.success('Payment processed successfully');
      setShowPaymentModal(false);
      setSelectedFee(null);
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-700 bg-green-100';
      case 'pending': return 'text-yellow-700 bg-yellow-100';
      case 'overdue': return 'text-red-700 bg-red-100';
      case 'partial': return 'text-blue-700 bg-blue-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getFeeTypeColor = (type: string) => {
    switch (type) {
      case 'tuition': return 'text-purple-700 bg-purple-100';
      case 'transport': return 'text-blue-700 bg-blue-100';
      case 'library': return 'text-green-700 bg-green-100';
      case 'exam': return 'text-orange-700 bg-orange-100';
      case 'other': return 'text-gray-700 bg-gray-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'partial': return <CreditCard className="h-4 w-4 text-blue-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Fees & Payments</h1>
          <p className="text-gray-600">Track your fee payments and payment history</p>
        </div>
        <div className="flex space-x-2">
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Download Receipt</span>
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'summary', label: 'Summary', icon: TrendingUp },
          { key: 'details', label: 'Fee Details', icon: Eye },
          { key: 'history', label: 'Payment History', icon: Receipt }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setViewMode(key as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === key 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Summary View */}
      {viewMode === 'summary' && (
        <>
          {/* Fee Summary Cards */}
          {summaryLoading ? (
            <div className="text-center py-8">Loading fee summary...</div>
          ) : feeSummary ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Fees</p>
                    <p className="text-2xl font-bold text-gray-900">৳{feeSummary.totalFees.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Paid Amount</p>
                    <p className="text-2xl font-bold text-green-600">৳{feeSummary.paidAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                    <p className="text-2xl font-bold text-yellow-600">৳{feeSummary.pendingAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
                    <p className="text-2xl font-bold text-red-600">৳{feeSummary.overdueAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center py-8">
              <p className="text-gray-500">No fee summary available</p>
            </div>
          )}

          {/* Recent Fees */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Recent Fee Records</h3>
            <div className="space-y-3">
              {fees.slice(0, 5).map((fee) => (
                <div key={fee._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(fee.status)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {fee.feeType.charAt(0).toUpperCase() + fee.feeType.slice(1)} Fee
                      </div>
                      <div className="text-sm text-gray-500">
                        Due: {new Date(fee.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">৳{fee.amount.toLocaleString()}</div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(fee.status)}`}>
                      {fee.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Details View */}
      {viewMode === 'details' && (
        <>
          {/* Filters */}
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fee Type</label>
                <select 
                  value={selectedFeeType} 
                  onChange={(e) => setSelectedFeeType(e.target.value)}
                  className="input-field"
                >
                  <option value="">All Types</option>
                  <option value="tuition">Tuition</option>
                  <option value="transport">Transport</option>
                  <option value="library">Library</option>
                  <option value="exam">Exam</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select 
                  value={selectedStatus} 
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input-field"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="partial">Partial</option>
                </select>
              </div>

              <div className="flex items-end">
                <button 
                  onClick={() => {
                    setSelectedFeeType('');
                    setSelectedStatus('');
                  }}
                  className="btn-secondary w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Fee Details Table */}
          <div className="card overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feesLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Loading fees...
                    </td>
                  </tr>
                ) : filteredFees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No fee records found
                    </td>
                  </tr>
                ) : (
                  filteredFees.map((fee) => (
                    <tr key={fee._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(fee.status)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFeeTypeColor(fee.feeType)}`}>
                            {fee.feeType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">৳{fee.amount.toLocaleString()}</div>
                        {fee.paidAmount && (
                          <div className="text-sm text-green-600">Paid: ৳{fee.paidAmount.toLocaleString()}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(fee.status)}`}>
                          {fee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {fee.status !== 'paid' && (
                          <button 
                            onClick={() => {
                              setSelectedFee(fee);
                              setShowPaymentModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                          >
                            <CreditCard className="h-4 w-4" />
                            <span>Pay Now</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Payment History View */}
      {viewMode === 'history' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Payment History</h3>
          <div className="space-y-3">
            {paymentHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No payment history found
              </div>
            ) : (
              paymentHistory.map((payment) => (
                <div key={payment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Payment Received</div>
                      <div className="text-sm text-gray-500">
                        {new Date(payment.paymentDate).toLocaleDateString()} • {payment.paymentMethod}
                      </div>
                      {payment.transactionId && (
                        <div className="text-xs text-gray-400">ID: {payment.transactionId}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">৳{payment.amount.toLocaleString()}</div>
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      View Receipt
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedFee && (
        <PaymentModal
          fee={selectedFee}
          onPayment={handlePayment}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedFee(null);
          }}
        />
      )}
    </div>
  );
};

// Payment Modal Component
interface PaymentModalProps {
  fee: FeeRecord;
  onPayment: (paymentData: PaymentRequest) => void;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ fee, onPayment, onClose }) => {
  const [paymentData, setPaymentData] = useState<PaymentRequest>({
    amount: fee.amount - (fee.paidAmount || 0),
    paymentMethod: 'online',
    transactionId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPayment(paymentData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Make Payment</h2>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Fee Details:</div>
          <div className="font-medium">{fee.feeType.charAt(0).toUpperCase() + fee.feeType.slice(1)} Fee</div>
          <div className="text-sm text-gray-600">
            Amount: ৳{fee.amount.toLocaleString()}
            {fee.paidAmount && ` (Paid: ৳${fee.paidAmount.toLocaleString()})`}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
            <input 
              type="number"
              value={paymentData.amount}
              onChange={(e) => setPaymentData(prev => ({ ...prev, amount: Number(e.target.value) }))}
              className="input-field"
              required
              min="1"
              max={fee.amount - (fee.paidAmount || 0)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select 
              value={paymentData.paymentMethod}
              onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
              className="input-field"
              required
            >
              <option value="online">Online Payment</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Credit/Debit Card</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID (Optional)</label>
            <input 
              type="text"
              value={paymentData.transactionId}
              onChange={(e) => setPaymentData(prev => ({ ...prev, transactionId: e.target.value }))}
              className="input-field"
              placeholder="Enter transaction ID if available"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Process Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentFees;
