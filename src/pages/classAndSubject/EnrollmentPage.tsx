/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
import {
  useEnrollStudentMutation,
  useGetClassesQuery,
  useGetSectionsQuery,
  useGetAllStudentUsersQuery,
} from '../../store/api/academicApi';
import toast from 'react-hot-toast';
import { DEFAULT_SCHOOL_ID } from '../../constants/defaults';

const EnrollmentPage: React.FC = () => {
  const { data: classes = [], isLoading: classesLoading } = useGetClassesQuery();
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  const { data: sections = [], isLoading: sectionsLoading } = useGetSectionsQuery(
    selectedClassId ? { classId: selectedClassId } : undefined
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  const { data: studentUsers = [], isLoading: studentsLoading } =
    useGetAllStudentUsersQuery();

  const [userId, setUserId] = useState('');
  const [enrollStudent, { isLoading: isEnrolling }] = useEnrollStudentMutation();

  useEffect(() => {
    setSelectedSectionId('');
  }, [selectedClassId]);

  const classOptions = useMemo(
    () =>
      classes.map((c: any) => ({
        id: c._id ?? c.id,
        name: c.name,
      })),
    [classes]
  );

  const sectionOptions = useMemo(
    () =>
      sections.map((s: any) => ({
        id: s._id ?? s.id,
        name: s.name,
      })),
    [sections]
  );

  const handleEnroll = async () => {
    if (!userId) return toast.error('Please select a student');

    try {
      const payload = {
        userId,
        classId: selectedClassId || undefined,
        sectionId: selectedSectionId || undefined,
        schoolId: DEFAULT_SCHOOL_ID,
      };

      await enrollStudent(payload).unwrap();
      toast.success('Student enrolled successfully');
      setUserId('');
      setSelectedClassId('');
      setSelectedSectionId('');
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || 'Failed to enroll student'
      );
    }
  };

  const isLoading = classesLoading || sectionsLoading || studentsLoading;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-blue-600">Loading enrollment data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Student Enrollment
        </h1>

        {/* Enrollment Form */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Enroll New Student</h2>
          {/* grid gap বাড়ানো হয়েছে */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Student
              </label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a student...</option>
                {studentUsers.length > 0 ? (
                  studentUsers.map((student: any) => (
                    <option
                      key={student._id || student.id}
                      value={student._id || student.id}
                    >
                      {student.firstName} {student.lastName} ({student.email})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No student users found
                  </option>
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose from existing student users
              </p>
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1 ">
                Class (Optional)
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Class</option>
                {classOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section (Optional)
              </label>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedClassId}
              >
                <option value="">Select Section</option>
                {sectionOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end ">
              <button
                onClick={handleEnroll}
                className="w-full px-4 py-2 bg-blue-600 mb-5 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                disabled={isEnrolling}
              >
                {isEnrolling ? 'Enrolling...' : 'Enroll Student'}
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Instructions:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Select a student from the dropdown list of existing users</li>
            <li>• Only users with "student" role will appear in the dropdown</li>
            <li>• Class and Section are optional - leave empty for general enrollment</li>
            <li>• Section selection is only available after selecting a class</li>
            <li>• The selected student will be enrolled in the chosen class/section</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentPage;
