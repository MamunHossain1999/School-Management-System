/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { 
  DollarSign, CreditCard, Download, AlertTriangle, 
  CheckCircle, Clock, Eye, Receipt, User, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  useGetStudentFeeSummaryQuery, useGetFeesQuery, useProcessPaymentMutation,
  useGetPaymentHistoryQuery, type FeeRecord, type PaymentRequest 
} from '../../store/api/feeApi';
import { useListUsersQuery } from '../../store/api/userApi';
import { useAppSelector } from '../../store/hooks';

const ParentFees: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [selectedChild, setSelectedChild] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);

  // Get children (students) for this parent
  const { data: studentsData } = useListUsersQuery({ role: 'student' });
  const children = studentsData?.users?.filter(student => 
    student.parentId === user?._id || student.parent === user?._id
  ) || [];

  // Use first child as default if none selected
  const currentChildId = selectedChild || children[0]?._id || '';

  // API queries for selected child
  const { data: feeSummary, isLoading: summaryLoading } = useGetStudentFeeSummaryQuery(
    currentChildId, 
    { skip: !currentChildId }
  );
  const { data: fees = [], isLoading: feesLoading } = useGetFeesQuery({ 
    studentId: currentChildId 
  }, { skip: !currentChildId });
  const { data: paymentHistory = [] } = useGetPaymentHistoryQuery({ 
    studentId: currentChildId 
  }, { skip: !currentChildId });

  // Mutations
  const [processPayment] = useProcessPaymentMutation();

  const currentChild = children.find(child => child._id === currentChildId);

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
    } catch {
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

  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Child's Fees & Payments</h1>
        <div className="card text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Children Found</h3>
          <p className="text-gray-600">No student records are associated with your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Child's Fees & Payments</h1>
          <p className="text-gray-600">Monitor and pay your child's school fees</p>
        </div>
        <div className="flex space-x-2">
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Download Receipt</span>
          </button>
        </div>
      </div>

      {/* Child Selection */}
      {children.length > 1 && (
        <div className="card">
          <div className="flex items-center space-x-4">
            <User className="h-5 w-5 text-gray-400" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Child</label>
              <select 
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="input-field max-w-xs"
              >
                {children.map(child => (
                  <option key={child._id} value={child._id}>
                    {child.firstName} {child.lastName} - Class {child.class} - Roll: {child.rollNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Current Child Info */}
      {currentChild && (
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {currentChild.firstName} {currentChild.lastName}
              </h3>
              <p className="text-gray-600">
                Class: {currentChild.class} • Roll: {currentChild.rollNumber} • ID: {currentChild._id}
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* Fee Records */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Fee Records</h3>
        <div className="overflow-x-auto">
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
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No fee records found
                  </td>
                </tr>
              ) : (
                fees.map((fee) => (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {new Date(fee.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(fee.status)}`}>
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {/* View details */}}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {fee.status !== 'paid' && (
                          <button 
                            onClick={() => {
                              setSelectedFee(fee);
                              setShowPaymentModal(true);
                            }}
                            className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                            title="Pay Now"
                          >
                            <CreditCard className="h-4 w-4" />
                            <span>Pay</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Payment History</h3>
        <div className="space-y-3">
          {paymentHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No payment history found
            </div>
          ) : (
            paymentHistory.slice(0, 5).map((payment) => (
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
                  <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                    <Receipt className="h-3 w-3" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedFee && (
        <PaymentModal
          fee={selectedFee}
          childName={currentChild ? `${currentChild.firstName} ${currentChild.lastName}` : 'Unknown'}
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
  childName: string;
  onPayment: (paymentData: PaymentRequest) => void;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ fee, childName, onPayment, onClose }) => {
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
          <div className="text-sm text-gray-600">Payment for:</div>
          <div className="font-medium">{childName}</div>
          <div className="text-sm text-gray-600 mt-1">
            Fee Type: {fee.feeType.charAt(0).toUpperCase() + fee.feeType.slice(1)}
          </div>
          <div className="text-sm text-gray-600">
            Total Amount: ৳{fee.amount.toLocaleString()}
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

export default ParentFees;
