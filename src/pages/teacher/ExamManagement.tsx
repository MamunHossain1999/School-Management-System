import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  Users,
  FileText,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { 
  useGetExamsQuery, 
  useCreateExamMutation, 
  useUpdateExamMutation, 
  useDeleteExamMutation,
  type Exam,
  type CreateExamRequest 
} from '../../store/api/examApi';
import { toast } from 'react-hot-toast';

const ExamManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // API hooks
  const { data: exams = [], isLoading, refetch } = useGetExamsQuery({
    classId: selectedClass || undefined,
    subjectId: selectedSubject || undefined,
  });
  const [createExam, { isLoading: isCreating }] = useCreateExamMutation();
  const [updateExam, { isLoading: isUpdating }] = useUpdateExamMutation();
  const [deleteExam] = useDeleteExamMutation();

  // Filter exams based on search term
  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateExam = async (examData: CreateExamRequest) => {
    try {
      await createExam(examData).unwrap();
      toast.success('Exam created successfully!');
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      toast.error('Failed to create exam');
      console.error('Error creating exam:', error);
    }
  };

  const handleUpdateExam = async (examData: CreateExamRequest) => {
    if (!editingExam) return;
    
    try {
      await updateExam({ id: editingExam._id, data: examData }).unwrap();
      toast.success('Exam updated successfully!');
      setEditingExam(null);
      refetch();
    } catch (error) {
      toast.error('Failed to update exam');
      console.error('Error updating exam:', error);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await deleteExam(examId).unwrap();
        toast.success('Exam deleted successfully!');
        refetch();
      } catch (error) {
        toast.error('Failed to delete exam');
        console.error('Error deleting exam:', error);
      }
    }
  };

  const getExamStatus = (exam: Exam) => {
    const now = new Date();
    const examDate = new Date(exam.date);
    
    if (examDate < now) {
      return { status: 'completed', color: 'bg-green-100 text-green-800' };
    } else if (examDate.toDateString() === now.toDateString()) {
      return { status: 'today', color: 'bg-blue-100 text-blue-800' };
    } else {
      return { status: 'upcoming', color: 'bg-yellow-100 text-yellow-800' };
    }
  };

  // Calculate statistics
  const stats = {
    total: exams.length,
    upcoming: exams.filter(exam => new Date(exam.date) > new Date()).length,
    today: exams.filter(exam => new Date(exam.date).toDateString() === new Date().toDateString()).length,
    completed: exams.filter(exam => new Date(exam.date) < new Date()).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
          <p className="text-gray-600">Create and manage exams for your classes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Exam</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Exams</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="input"
          >
            <option value="">All Classes</option>
            <option value="class-1">Class 1</option>
            <option value="class-2">Class 2</option>
            <option value="class-3">Class 3</option>
            <option value="class-4">Class 4</option>
            <option value="class-5">Class 5</option>
          </select>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="input"
          >
            <option value="">All Subjects</option>
            <option value="mathematics">Mathematics</option>
            <option value="english">English</option>
            <option value="science">Science</option>
            <option value="social-studies">Social Studies</option>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
          </select>
        </div>
      </div>

      {/* Exams List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Exams</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            <span>{filteredExams.length} exams found</span>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading exams...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No exams found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary mt-4"
            >
              Create First Exam
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExams.map((exam) => {
              const { status, color } = getExamStatus(exam);
              return (
                <div key={exam._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                          {status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4" />
                          <span>{exam.subject}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{exam.class} - {exam.section}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(exam.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{exam.startTime} - {exam.endTime}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Total Marks:</span> {exam.totalMarks} | 
                        <span className="font-medium ml-2">Passing Marks:</span> {exam.passingMarks}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingExam(exam)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingExam) && (
        <ExamModal
          exam={editingExam}
          onSubmit={editingExam ? handleUpdateExam : handleCreateExam}
          onClose={() => {
            setShowCreateModal(false);
            setEditingExam(null);
          }}
          isLoading={isCreating || isUpdating}
        />
      )}
    </div>
  );
};

// Exam Modal Component
interface ExamModalProps {
  exam?: Exam | null;
  onSubmit: (data: CreateExamRequest) => void;
  onClose: () => void;
  isLoading: boolean;
}

const ExamModal: React.FC<ExamModalProps> = ({ exam, onSubmit, onClose, isLoading }) => {
  const [formData, setFormData] = useState<CreateExamRequest>({
    title: exam?.title || '',
    subject: exam?.subject || '',
    class: exam?.class || '',
    section: exam?.section || '',
    date: exam?.date ? exam.date.split('T')[0] : '',
    startTime: exam?.startTime || '',
    endTime: exam?.endTime || '',
    totalMarks: exam?.totalMarks || 100,
    passingMarks: exam?.passingMarks || 40,
    instructions: exam?.instructions || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalMarks' || name === 'passingMarks' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {exam ? 'Edit Exam' : 'Create New Exam'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select Subject</option>
                  <option value="mathematics">Mathematics</option>
                  <option value="english">English</option>
                  <option value="science">Science</option>
                  <option value="social-studies">Social Studies</option>
                  <option value="physics">Physics</option>
                  <option value="chemistry">Chemistry</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class *
                </label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select Class</option>
                  <option value="class-1">Class 1</option>
                  <option value="class-2">Class 2</option>
                  <option value="class-3">Class 3</option>
                  <option value="class-4">Class 4</option>
                  <option value="class-5">Class 5</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section *
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select Section</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Marks *
                </label>
                <input
                  type="number"
                  name="totalMarks"
                  value={formData.totalMarks}
                  onChange={handleChange}
                  className="input"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passing Marks *
                </label>
                <input
                  type="number"
                  name="passingMarks"
                  value={formData.passingMarks}
                  onChange={handleChange}
                  className="input"
                  min="1"
                  max={formData.totalMarks}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows={3}
                className="input"
                placeholder="Enter exam instructions..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : (exam ? 'Update Exam' : 'Create Exam')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExamManagement;
