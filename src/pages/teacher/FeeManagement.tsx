import React, { useState } from 'react';
import { 
  DollarSign, Users, AlertTriangle, Search, Filter, 
  Eye, Download, CreditCard, CheckCircle, Clock, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  useGetFeesQuery, useCreateFeeMutation, useProcessPaymentMutation,
  type FeeRecord, type CreateFeeRequest, type PaymentRequest 
} from '../../store/api/feeApi';
import { useGetClassesQuery } from '../../store/api/academicApi';
import { useListUsersQuery } from '../../store/api/userApi';
import { useAppSelector } from '../../store/hooks';

const FeeManagement: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);

  // API queries
  const { data: fees = [], isLoading: feesLoading, refetch } = useGetFeesQuery({
    classId: selectedClass || undefined,
    status: selectedStatus || undefined
  });
  const { data: classes = [] } = useGetClassesQuery();
  const { data: studentsData } = useListUsersQuery({ role: 'student' });
  const students = studentsData?.users || [];

  // Mutations
  const [createFee] = useCreateFeeMutation();
  const [processPayment] = useProcessPaymentMutation();

  // Filter fees based on teacher's assigned classes (if applicable)
  const filteredFees = fees.filter(fee => {
    const student = students.find(s => s._id === fee.student);
    const matchesSearch = searchTerm === '' || 
      student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.rollNumber?.includes(searchTerm) ||
      fee.feeType.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Statistics
  const stats = {
    totalStudents: new Set(filteredFees.map(f => f.student)).size,
    totalFees: filteredFees.length,
    paidFees: filteredFees.filter(f => f.status === 'paid').length,
    pendingFees: filteredFees.filter(f => f.status === 'pending').length,
    overdueFees: filteredFees.filter(f => f.status === 'overdue').length,
    totalAmount: filteredFees.reduce((sum, fee) => sum + fee.amount, 0),
    collectedAmount: filteredFees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0)
  };

  const handleCreateFee = async (feeData: CreateFeeRequest) => {
    try {
      await createFee(feeData).unwrap();
      toast.success('Fee record created successfully');
      setShowCreateModal(false);
      refetch();
    } catch {
      toast.error('Failed to create fee record');
    }
  };

  const handleProcessPayment = async (paymentData: PaymentRequest) => {
    if (!selectedFee) return;
    
    try {
      await processPayment({ 
        feeId: selectedFee._id, 
        paymentData 
      }).unwrap();
      toast.success('Payment processed successfully');
      setShowPaymentModal(false);
      setSelectedFee(null);
      refetch();
    } catch {
      toast.error('Failed to process payment');
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
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600">Manage student fees and process payments</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Fee</span>
          </button>
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">৳{stats.totalAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Collected</p>
              <p className="text-2xl font-bold text-green-600">৳{stats.collectedAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdueFees}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Fee Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600">{stats.paidFees}</div>
          <div className="text-sm text-gray-600">Paid Fees</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-yellow-600">{stats.pendingFees}</div>
          <div className="text-sm text-gray-600">Pending Fees</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-red-600">{stats.overdueFees}</div>
          <div className="text-sm text-gray-600">Overdue Fees</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input-field"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name, roll number, or fee type..."
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fee Records Table */}
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
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
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Loading fees...
                </td>
              </tr>
            ) : filteredFees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No fee records found
                </td>
              </tr>
            ) : (
              filteredFees.map((fee) => {
                const student = students.find(s => s._id === fee.student);
                return (
                  <tr key={fee._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Roll: {student?.rollNumber || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFeeTypeColor(fee.feeType)}`}>
                        {fee.feeType}
                      </span>
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
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(fee.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(fee.status)}`}>
                          {fee.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {/* View details */}}
                          className="text-blue-600 hover:text-blue-900"
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
                            className="text-green-600 hover:text-green-900"
                            title="Process Payment"
                          >
                            <CreditCard className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Fee Modal */}
      {showCreateModal && (
        <CreateFeeModal
          students={students}
          classes={classes}
          onSave={handleCreateFee}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedFee && (
        <PaymentModal
          fee={selectedFee}
          student={students.find(s => s._id === selectedFee.student)}
          onPayment={handleProcessPayment}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedFee(null);
          }}
        />
      )}
    </div>
  );
};

// Create Fee Modal Component
interface CreateFeeModalProps {
  students: any[];
  classes: any[];
  onSave: (data: CreateFeeRequest) => void;
  onClose: () => void;
}

const CreateFeeModal: React.FC<CreateFeeModalProps> = ({ students, classes, onSave, onClose }) => {
  const [formData, setFormData] = useState<CreateFeeRequest>({
    studentId: '',
    classId: '',
    feeType: 'tuition',
    amount: 0,
    dueDate: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Create Fee Record</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
            <select 
              value={formData.studentId}
              onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
              className="input-field"
              required
            >
              <option value="">Select Student</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.firstName} {student.lastName} - {student.rollNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select 
              value={formData.classId}
              onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))}
              className="input-field"
              required
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fee Type</label>
            <select 
              value={formData.feeType}
              onChange={(e) => setFormData(prev => ({ ...prev, feeType: e.target.value as any }))}
              className="input-field"
              required
            >
              <option value="tuition">Tuition</option>
              <option value="transport">Transport</option>
              <option value="library">Library</option>
              <option value="exam">Exam</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input 
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
              className="input-field"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
            <input 
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input-field"
              rows={3}
              placeholder="Optional description..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Fee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Payment Modal Component
interface PaymentModalProps {
  fee: FeeRecord;
  student?: any;
  onPayment: (paymentData: PaymentRequest) => void;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ fee, student, onPayment, onClose }) => {
  const [paymentData, setPaymentData] = useState<PaymentRequest>({
    amount: fee.amount - (fee.paidAmount || 0),
    paymentMethod: 'cash',
    transactionId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPayment(paymentData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Process Payment</h2>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Student:</div>
          <div className="font-medium">
            {student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
          </div>
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
              <option value="cash">Cash</option>
              <option value="card">Credit/Debit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="online">Online Payment</option>
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

export default FeeManagement;
