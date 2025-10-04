/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, AlertTriangle, Download, 
  Search,  Edit, Trash2, Plus, CreditCard,

} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  useGetFeesQuery, useCreateFeeMutation, useUpdateFeeMutation, 
  useDeleteFeeMutation, useGenerateFeeReportQuery, useGetOverdueFeesQuery,
  type FeeRecord, type CreateFeeRequest 
} from '../../store/api/feeApi';
import { useGetClassesQuery } from '../../store/api/academicApi';
import { useListUsersQuery } from '../../store/api/userApi';

const FeeOverview: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // API queries
  const { data: fees = [], isLoading: feesLoading, refetch } = useGetFeesQuery({
    classId: selectedClass || undefined,
    status: selectedStatus || undefined
  });
  const { data: classes = [] } = useGetClassesQuery();
  const { data: studentsData } = useListUsersQuery({ role: 'student' });
  const students = studentsData?.users || [];
  const { data: overdues = [] } = useGetOverdueFeesQuery();
  const { data: report } = useGenerateFeeReportQuery({
    classId: selectedClass || undefined,
    startDate: dateRange.start || undefined,
    endDate: dateRange.end || undefined
  });

  // Mutations
  const [createFee] = useCreateFeeMutation();
  const [updateFee] = useUpdateFeeMutation();
  const [deleteFee] = useDeleteFeeMutation();

  // Statistics
  const stats = {
    totalFees: fees.length,
    totalAmount: fees.reduce((sum, fee) => sum + fee.amount, 0),
    paidAmount: fees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0),
    pendingAmount: fees.filter(f => f.status === 'pending').reduce((sum, fee) => sum + fee.amount, 0),
    overdueCount: overdues.length,
    collectionRate: fees.length > 0 ? (fees.filter(f => f.status === 'paid').length / fees.length) * 100 : 0
  };

  // Filter fees
  const filteredFees = fees.filter(fee => {
    const matchesSearch = searchTerm === '' || 
      fee.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.feeType.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

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

  const handleUpdateFee = async (id: string, data: Partial<CreateFeeRequest>) => {
    try {
      await updateFee({ id, data }).unwrap();
      toast.success('Fee record updated successfully');
      setEditingFee(null);
      refetch();
    } catch {
      toast.error('Failed to update fee record');
    }
  };

  const handleDeleteFee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee record?')) return;
    
    try {
      await deleteFee(id).unwrap();
      toast.success('Fee record deleted successfully');
      refetch();
    } catch {
      toast.error('Failed to delete fee record');
    }
  };

  const handleExportReport = () => {
    if (!report) {
      toast.error('No report data available');
      return;
    }

    try {
      // Create a downloadable CSV file from the report data
      const csvContent = generateCSVContent();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `fee-report-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Report exported successfully');
      }
    } catch {
      toast.error('Failed to export report');
    }
  };

  const generateCSVContent = () => {
    // Generate CSV headers
    const headers = ['Student Name', 'Roll Number', 'Class', 'Fee Type', 'Amount', 'Paid Amount', 'Status', 'Due Date'];
    
    // Generate CSV rows from fees data
    const rows = filteredFees.map(fee => {
      const student = students.find((s: any) => s._id === fee.student);
      const studentClass = classes.find((c: any) => (c._id || c.id) === fee.class);
      
      return [
        student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
        student?.rollNumber || 'N/A',
        studentClass?.name || 'Unknown Class',
        fee.feeType,
        fee.amount.toString(),
        (fee.paidAmount || 0).toString(),
        fee.status,
        new Date(fee.dueDate).toLocaleDateString()
      ];
    });

    // Combine headers and rows
    const csvArray = [headers, ...rows];
    
    // Convert to CSV string
    return csvArray.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management Overview</h1>
          <p className="text-gray-600">Monitor and manage school fee collections</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Fee</span>
          </button>
          <button 
            onClick={handleExportReport}
            disabled={!report}
            className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Fees</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFees}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
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
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Collected</p>
              <p className="text-2xl font-bold text-green-600">৳{stats.paidAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdueCount}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.collectionRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Collection Rate</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-orange-600">৳{stats.pendingAmount.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Pending Amount</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600">{classes.length}</div>
          <div className="text-sm text-gray-600">Active Classes</div>
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
              {classes.map((cls: any) => (
                <option key={cls._id || cls.id} value={cls._id || cls.id}>{cls.name}</option>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search fees..."
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
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Roll: {student?.rollNumber || 'N/A'}
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
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(fee.status)}`}>
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setEditingFee(fee)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteFee(fee._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Fee Modal */}
      {(showCreateModal || editingFee) && (
        <FeeModal
          fee={editingFee}
          students={students}
          classes={classes}
          onSave={editingFee ? 
            (data) => handleUpdateFee(editingFee._id, data) : 
            handleCreateFee
          }
          onClose={() => {
            setShowCreateModal(false);
            setEditingFee(null);
          }}
        />
      )}
    </div>
  );
};

// Fee Modal Component
interface FeeModalProps {
  fee?: FeeRecord | null;
  students: any[];
  classes: any[];
  onSave: (data: CreateFeeRequest) => void;
  onClose: () => void;
}

const FeeModal: React.FC<FeeModalProps> = ({ fee, students, classes, onSave, onClose }) => {
  const [formData, setFormData] = useState<CreateFeeRequest>({
    studentId: fee?.student || '',
    classId: fee?.class || '',
    feeType: fee?.feeType || 'tuition',
    amount: fee?.amount || 0,
    dueDate: fee?.dueDate ? new Date(fee.dueDate).toISOString().split('T')[0] : '',
    description: fee?.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          {fee ? 'Edit Fee Record' : 'Create Fee Record'}
        </h2>
        
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
              {fee ? 'Update' : 'Create'} Fee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeeOverview;
