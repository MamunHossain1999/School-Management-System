import React, { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  useGetExamsQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
  type Exam,
  type CreateExamRequest,
  useGenerateReportCardMutation,
  type ReportCard,
} from '../../store/api/examApi';
import {
  useGetClassesQuery,
  useGetSectionsQuery,
  useGetSubjectsQuery,
} from '../../store/api/academicApi';
import type { Class, Section, Subject } from '../../types';

type FormState = CreateExamRequest & { id?: string };

const defaultForm: FormState = {
  title: '',
  subject: '',
  class: '',
  section: '',
  date: '',
  startTime: '',
  endTime: '',
  totalMarks: 100,
  passingMarks: 40,
  instructions: '',
};

const ExamsManagement: React.FC = () => {
  // Helper to support both id and _id from backend
  const getEntityId = (e: { id?: string } | undefined | null): string => {
    if (!e) return '';
    const anyE = e as unknown as { _id?: string; id?: string; name?: string };
    return anyE._id || anyE.id || anyE.name || '';
  };

  // Form state
  const [form, setForm] = useState<FormState>(defaultForm);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  // APIs
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(form.class ? { classId: form.class } : undefined);
  const { data: subjects = [] } = useGetSubjectsQuery();
  const { data: exams = [], isLoading, refetch } = useGetExamsQuery({
    classId: filterClass || undefined,
    subjectId: filterSubject || undefined,
  });
  const [createExam, { isLoading: creating }] = useCreateExamMutation();
  const [updateExam, { isLoading: updating }] = useUpdateExamMutation();
  const [deleteExam, { isLoading: deleting }] = useDeleteExamMutation();
  const [generateReportCard, { isLoading: generatingReport }] = useGenerateReportCardMutation();
  const [reportCard, setReportCard] = useState<ReportCard | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const editing = Boolean(form.id);

  const filteredExams = useMemo(() => {
    const q = search.toLowerCase();
    return exams.filter((e) =>
      e.title.toLowerCase().includes(q) ||
      e.subject.toLowerCase().includes(q) ||
      e.class.toLowerCase().includes(q) ||
      e.section.toLowerCase().includes(q)
    );
  }, [exams, search]);

  const validate = (state: FormState) => {
    if (!state.title.trim()) return 'Title is required';
    if (!state.class) return 'Class is required';
    if (!state.section) return 'Section is required';
    if (!state.subject) return 'Subject is required';
    if (!state.date) return 'Date is required';
    if (!state.startTime) return 'Start time is required';
    if (!state.endTime) return 'End time is required';
    if (state.totalMarks <= 0) return 'Total marks must be greater than 0';
    if (state.passingMarks < 0 || state.passingMarks > state.totalMarks) return 'Passing marks must be between 0 and total marks';
    return '';
  };

  const resetForm = () => setForm(defaultForm);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(form);
    if (err) return toast.error(err);
    try {
      if (editing && form.id) {
        const { id, ...data } = form;
        await updateExam({ id, data }).unwrap();
        toast.success('Exam updated');
      } else {
        const createData: CreateExamRequest = {
          title: form.title,
          class: form.class,
          section: form.section,
          subject: form.subject,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          totalMarks: form.totalMarks,
          passingMarks: form.passingMarks,
          instructions: form.instructions || undefined,
        };
        await createExam(createData).unwrap();
        toast.success('Exam created');
      }
      resetForm();
      refetch();
    } catch {
      toast.error('Operation failed');
    }
  };

  const onEdit = (exam: Exam) => {
    setForm({
      id: exam._id,
      title: exam.title,
      class: exam.class,
      section: exam.section,
      subject: exam.subject,
      date: exam.date.split('T')[0],
      startTime: exam.startTime,
      endTime: exam.endTime,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      instructions: exam.instructions || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this exam?')) return;
    try {
      await deleteExam(id).unwrap();
      toast.success('Exam deleted');
      refetch();
    } catch {
      toast.error('Delete failed');
    }
  };

  // Simple report card generation (by student id)
  const [reportStudentId, setReportStudentId] = useState('');
  const [reportTerm, setReportTerm] = useState('');
  const [reportYear, setReportYear] = useState('');
  const generateReport = async () => {
    if (!reportStudentId || !reportTerm || !reportYear) {
      return toast.error('Student, term and academic year are required');
    }
    try {
      const data = await generateReportCard({ studentId: reportStudentId, term: reportTerm, academicYear: reportYear }).unwrap();
      setReportCard(data);
      setReportOpen(true);
      toast.success('Report card generated');
    } catch {
      toast.error('Failed to generate report card');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Examination Management</h2>
        <p className="text-gray-600">Create exams, set schedules and manage results.</p>
      </div>

      {/* Create / Edit Form */}
      <form onSubmit={onSubmit} className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              placeholder="Mid Term Exam"
            />
          </div>
          <div>
            <label className="label">Class</label>
            <select
              className="input"
              value={form.class}
              onChange={(e) => setForm((s) => ({ ...s, class: e.target.value, section: '' }))}
            >
              <option value="">Select class</option>
              {classes.map((c: Class) => (
                <option key={getEntityId(c)} value={getEntityId(c)}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Section</label>
            <select
              className="input"
              value={form.section}
              onChange={(e) => setForm((s) => ({ ...s, section: e.target.value }))}
              disabled={!form.class}
            >
              <option value="">Select section</option>
              {sections.map((s: Section) => (
                <option key={getEntityId(s)} value={getEntityId(s)}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Subject</label>
            <select
              className="input"
              value={form.subject}
              onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))}
            >
              <option value="">Select subject</option>
              {subjects.map((sub: Subject) => (
                <option key={getEntityId(sub)} value={getEntityId(sub)}>{sub.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Start Time</label>
            <input
              type="time"
              className="input"
              value={form.startTime}
              onChange={(e) => setForm((s) => ({ ...s, startTime: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">End Time</label>
            <input
              type="time"
              className="input"
              value={form.endTime}
              onChange={(e) => setForm((s) => ({ ...s, endTime: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Total Marks</label>
            <input
              type="number"
              className="input"
              value={form.totalMarks}
              onChange={(e) => setForm((s) => ({ ...s, totalMarks: parseInt(e.target.value) || 0 }))}
              min={1}
            />
          </div>
          <div>
            <label className="label">Passing Marks</label>
            <input
              type="number"
              className="input"
              value={form.passingMarks}
              onChange={(e) => setForm((s) => ({ ...s, passingMarks: parseInt(e.target.value) || 0 }))}
              min={0}
              max={form.totalMarks}
            />
          </div>
          <div className="md:col-span-3">
            <label className="label">Instructions</label>
            <textarea
              className="input h-24"
              value={form.instructions}
              onChange={(e) => setForm((s) => ({ ...s, instructions: e.target.value }))}
              placeholder="Write any instructions for the exam..."
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={creating || updating}>
            {editing ? (updating ? 'Updating...' : 'Update Exam') : (creating ? 'Creating...' : 'Create Exam')}
          </button>
          {editing && (
            <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
          )}
        </div>
      </form>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input className="input" placeholder="Search exams..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="input" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
            <option value="">All Classes</option>
            {classes.map((c: Class) => (
              <option key={getEntityId(c)} value={getEntityId(c)}>{c.name}</option>
            ))}
          </select>
          <select className="input" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
            <option value="">All Subjects</option>
            {subjects.map((s: Subject) => (
              <option key={getEntityId(s)} value={getEntityId(s)}>{s.name}</option>
            ))}
          </select>
          <div></div>
        </div>
      </div>

      {/* Exams Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">All Exams</h3>
          <span className="text-sm text-gray-500">{filteredExams.length} exams</span>
        </div>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading exams...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No exams found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExams.map((e) => (
                  <tr key={e._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{e.title}</div>
                      <div className="text-xs text-gray-500">Created: {new Date(e.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{e.class} - {e.section}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{e.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{e.startTime} - {e.endTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{e.passingMarks}/{e.totalMarks}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button className="text-blue-600 hover:text-blue-900 mr-3" onClick={() => onEdit(e)}>Edit</button>
                      <button className="text-red-600 hover:text-red-900" onClick={() => onDelete(e._id)} disabled={deleting}>
                        {deleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Card Quick Generator */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Report Card</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input className="input" placeholder="Student ID" value={reportStudentId} onChange={(e) => setReportStudentId(e.target.value)} />
          <input className="input" placeholder="Term (e.g., Term 1)" value={reportTerm} onChange={(e) => setReportTerm(e.target.value)} />
          <input className="input" placeholder="Academic Year (e.g., 2024-2025)" value={reportYear} onChange={(e) => setReportYear(e.target.value)} />
          <button className="btn-primary" onClick={generateReport} disabled={generatingReport}>{generatingReport ? 'Generating...' : 'Generate'}</button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Tip: Integrate a student selector later for better UX.</p>
      </div>

      {/* Report Card Preview Modal */}
      {reportOpen && reportCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setReportOpen(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto p-6 print:w-full print:max-w-none">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Report Card Preview</h3>
              <div className="space-x-2">
                <button className="btn-secondary" onClick={() => window.print()}>Print</button>
                <button className="btn" onClick={() => setReportOpen(false)}>Close</button>
              </div>
            </div>

            <div id="report-card" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Student</p>
                  <p className="text-base font-semibold text-gray-900">{reportCard.student}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Class</p>
                  <p className="text-base font-semibold text-gray-900">{reportCard.class} - {reportCard.section}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Term / Year</p>
                  <p className="text-base font-semibold text-gray-900">{reportCard.term} • {reportCard.academicYear}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Generated</p>
                  <p className="text-base font-semibold text-gray-900">{new Date(reportCard.generatedAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Obtained</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportCard.subjects.map((s) => (
                      <tr key={s.subject}>
                        <td className="px-4 py-2 text-sm text-gray-900">{s.subject}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{s.totalMarks}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{s.obtainedMarks}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{s.percentage}%</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{s.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Total / Obtained</p>
                  <p className="text-base font-semibold text-gray-900">{reportCard.obtainedMarks}/{reportCard.totalMarks}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Overall %</p>
                  <p className="text-base font-semibold text-gray-900">{reportCard.percentage}%</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Overall Grade</p>
                  <p className="text-base font-semibold text-gray-900">{reportCard.overallGrade}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Rank</p>
                  <p className="text-base font-semibold text-gray-900">{reportCard.rank}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Attendance</p>
                  <p className="text-base font-semibold text-gray-900">{reportCard.attendance.presentDays}/{reportCard.attendance.totalDays} • {reportCard.attendance.percentage}%</p>
                </div>
                {reportCard.remarks && (
                  <div className="p-3 bg-gray-50 rounded md:col-span-1">
                    <p className="text-sm text-gray-600">Remarks</p>
                    <p className="text-base text-gray-900">{reportCard.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsManagement;
