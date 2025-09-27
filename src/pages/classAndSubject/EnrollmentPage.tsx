/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
import { useEnrollStudentMutation, useGetClassesQuery, useGetSectionsQuery, useGetAcademicStudentsQuery } from '../../store/api/academicApi';
import toast from 'react-hot-toast';

const EnrollmentPage: React.FC = () => {
  const { data: classes = [], isLoading: classesLoading, isError: classesError } = useGetClassesQuery();
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  // Load sections for selected class (optional)
  const { data: sections = [], isLoading: sectionsLoading, isError: sectionsError } = useGetSectionsQuery(selectedClassId ? { classId: selectedClassId } : undefined);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  // Get enrolled students for display
  const { data: enrolledStudents = [] } = useGetAcademicStudentsQuery(selectedClassId ? { classId: selectedClassId, sectionId: selectedSectionId } : undefined);

  const [userId, setUserId] = useState('');
  const [enrollStudent, { isLoading: isEnrolling }] = useEnrollStudentMutation();

  const isLoading = classesLoading || sectionsLoading;

  useEffect(() => {
    // reset section when class changes
    setSelectedSectionId('');
  }, [selectedClassId]);

  const classOptions = useMemo(() => classes.map((c: any) => ({
    id: c._id ?? c.id,
    name: c.name,
  })), [classes]);

  const sectionOptions = useMemo(() => sections.map((s: any) => ({
    id: s._id ?? s.id,
    name: s.name,
  })), [sections]);

  const handleEnroll = async () => {
    if (!userId.trim()) return toast.error('Valid user ID is required');
    try {
      const payload = {
        userId: userId.trim(),
        classId: selectedClassId || undefined,
        sectionId: selectedSectionId || undefined,
      };
      
      await enrollStudent(payload).unwrap();
      toast.success('Student enrolled successfully');
      setUserId('');
      setSelectedClassId('');
      setSelectedSectionId('');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to enroll student');
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Enroll Student</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <input
          type="text"
          placeholder="User ID (student)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border p-2 rounded"
        />

        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Optional: Select Class</option>
          {classOptions.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={selectedSectionId}
          onChange={(e) => setSelectedSectionId(e.target.value)}
          className="border p-2 rounded"
          disabled={!selectedClassId}
        >
          <option value="">Optional: Select Section</option>
          {sectionOptions.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <button
          onClick={handleEnroll}
          className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-60"
          disabled={isEnrolling}
        >
          {isEnrolling ? 'Enrolling...' : 'Enroll'}
        </button>
      </div>
    </div>
  );
};

export default EnrollmentPage;
