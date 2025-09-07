import React from 'react';
import { 
  useGetClassesQuery, 
  useCreateClassMutation,
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useGetAssignmentsQuery,
  useCreateAssignmentMutation 
} from '../store/api/academicApi';
import { 
  useGetAttendanceQuery, 
  useMarkAttendanceMutation 
} from '../store/api/attendanceApi';
import { 
  useGetExamsQuery, 
  useCreateExamMutation,
  useGetResultsQuery,
  useSubmitResultMutation 
} from '../store/api/examApi';
import { 
  useGetFeesQuery, 
  useCreateFeeMutation, 
  usePayFeeMutation 
} from '../store/api/feeApi';

// Example component showing how to use RTK Query hooks
const RTKQueryUsageExample: React.FC = () => {
  // Academic API usage
  const { data: classes, isLoading: classesLoading, error: classesError } = useGetClassesQuery();
  const { data: subjects } = useGetSubjectsQuery('class-id-here');
  const { data: assignments } = useGetAssignmentsQuery({ classId: 'class-1' });
  
  const [createClass] = useCreateClassMutation();
  const [createSubject] = useCreateSubjectMutation();
  const [createAssignment] = useCreateAssignmentMutation();

  // Attendance API usage
  const { data: attendance } = useGetAttendanceQuery({ 
    date: '2024-01-01', 
    classId: 'class-1' 
  });
  const [markAttendance] = useMarkAttendanceMutation();

  // Exam API usage
  const { data: exams } = useGetExamsQuery({ classId: 'class-1' });
  const { data: results } = useGetResultsQuery({ examId: 'exam-1' });
  const [createExam] = useCreateExamMutation();
  const [submitResult] = useSubmitResultMutation();

  // Fee API usage
  const { data: fees } = useGetFeesQuery('student-id-here');
  const [createFee] = useCreateFeeMutation();
  const [payFee] = usePayFeeMutation();

  // Example handlers
  const handleCreateClass = async () => {
    try {
      await createClass({
        name: 'Class 10',
        grade: 10,
        academicYear: '2024-25'
      }).unwrap();
      console.log('Class created successfully');
    } catch (error) {
      console.error('Failed to create class:', error);
    }
  };

  const handleMarkAttendance = async () => {
    try {
      await markAttendance([
        {
          studentId: 'student-1',
          classId: 'class-1',
          date: new Date().toISOString(),
          status: 'present'
        }
      ]).unwrap();
      console.log('Attendance marked successfully');
    } catch (error) {
      console.error('Failed to mark attendance:', error);
    }
  };

  const handlePayFee = async () => {
    try {
      await payFee({
        feeId: 'fee-1',
        paymentData: {
          amount: 1000,
          method: 'online',
          transactionId: 'txn-123'
        }
      }).unwrap();
      console.log('Fee payment successful');
    } catch (error) {
      console.error('Failed to process payment:', error);
    }
  };

  if (classesLoading) return <div>Loading classes...</div>;
  if (classesError) return <div>Error loading classes</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">RTK Query Usage Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Classes</h2>
          <p>Total classes: {classes?.length || 0}</p>
          <button 
            onClick={handleCreateClass}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create New Class
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Subjects</h2>
          <p>Total subjects: {subjects?.length || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Assignments</h2>
          <p>Total assignments: {assignments?.length || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Attendance</h2>
          <p>Records: {attendance?.length || 0}</p>
          <button 
            onClick={handleMarkAttendance}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Mark Attendance
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Exams</h2>
          <p>Total exams: {exams?.length || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Fees</h2>
          <p>Total fees: {fees?.length || 0}</p>
          <button 
            onClick={handlePayFee}
            className="mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Pay Fee
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Key Benefits of RTK Query:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Automatic caching and background refetching</li>
          <li>Optimistic updates and error handling</li>
          <li>Automatic loading states</li>
          <li>Data normalization and deduplication</li>
          <li>TypeScript support out of the box</li>
          <li>Simplified API state management</li>
        </ul>
      </div>
    </div>
  );
};

export default RTKQueryUsageExample;
