import React, { useMemo, useState } from 'react';
import {
  useCreateNoticeMutation,
  useDeleteNoticeMutation,
  useGetNoticesQuery,
  useUpdateNoticeMutation,
  type UpdateNoticeRequest,
  type CreateNoticeRequest,
  type Notice,
  useGetNoticeStatsQuery,
  useGetNoticePriorityQuery,
} from '../../store/api/noticeApi';
import toast from 'react-hot-toast';

const NoticeBoard: React.FC = () => {
  const [filters, setFilters] = useState<{ targetAudience?: string; type?: string; isActive?: boolean }>({});
  const { data: notices = [], isLoading, isError, refetch } = useGetNoticesQuery(filters);
  const [createNotice, { isLoading: creating }] = useCreateNoticeMutation();
  const [updateNotice, { isLoading: updating }] = useUpdateNoticeMutation();
  const [deleteNotice] = useDeleteNoticeMutation();

  // Admin: extra data
  const { data: stats } = useGetNoticeStatsQuery();
  const { data: priority = [] } = useGetNoticePriorityQuery();

  const [form, setForm] = useState<CreateNoticeRequest>({
    title: '',
    content: '',
    type: 'general',
    targetAudience: 'all',
    publishDate: new Date().toISOString().slice(0, 10),
    expiryDate: '',
    attachments: [],
  });

  // Edit modal state
  const [editing, setEditing] = useState<Notice | null>(null);
  const [editForm, setEditForm] = useState<UpdateNoticeRequest>({});

  const canSubmit = useMemo(() => form.title.trim().length > 0 && form.content.trim().length > 0, [form]);

  const handleCreate = async () => {
    if (!canSubmit) return toast.error('Title and content are required');
    try {
      await createNotice({ ...form, expiryDate: form.expiryDate || undefined }).unwrap();
      toast.success('Notice published');
      setForm({
        title: '',
        content: '',
        type: 'general',
        targetAudience: 'all',
        publishDate: new Date().toISOString().slice(0, 10),
        expiryDate: '',
        attachments: [],
      });
      void refetch();
    } catch (e: unknown) {
      const msg = (e as { data?: { message?: string } })?.data?.message || 'Failed to publish notice';
      toast.error(msg);
    }
  };

  const toggleActive = async (n: Notice) => {
    try {
      const nextActive = !n.isActive;
      await updateNotice({ id: n._id, data: { /* partial */ } }).unwrap().catch(() => Promise.resolve());
      // If backend needs explicit isActive update, try with that too
      await updateNotice({ id: n._id, data: { isActive: nextActive } }).unwrap();
      toast.success(nextActive ? 'Notice activated' : 'Notice deactivated');
      void refetch();
    } catch (e: unknown) {
      const msg = (e as { data?: { message?: string } })?.data?.message || 'Failed to update';
      toast.error(msg);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this notice?')) return;
    try {
      await deleteNotice(id).unwrap();
      toast.success('Notice deleted');
      void refetch();
    } catch (e: unknown) {
      const msg = (e as { data?: { message?: string } })?.data?.message || 'Failed to delete';
      toast.error(msg);
    }
  };

  const openEdit = (n: Notice) => {
    setEditing(n);
    setEditForm({
      title: n.title,
      content: n.content,
      type: n.type as UpdateNoticeRequest['type'],
      targetAudience: n.targetAudience as UpdateNoticeRequest['targetAudience'],
      publishDate: new Date(n.publishDate).toISOString().slice(0, 10),
      expiryDate: n.expiryDate ? new Date(n.expiryDate).toISOString().slice(0, 10) : undefined,
      attachments: n.attachments || [],
    });
  };

  const handleUpdate = async () => {
    if (!editing) return;
    const payload: UpdateNoticeRequest = {
      ...editForm,
      // ensure empty string expiryDate is sent as undefined
      expiryDate: editForm.expiryDate || undefined,
    };
    try {
      await updateNotice({ id: editing._id, data: payload }).unwrap();
      toast.success('Notice updated');
      setEditing(null);
      void refetch();
    } catch (e: unknown) {
      const msg = (e as { data?: { message?: string } })?.data?.message || 'Failed to update notice';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Notice Board / Circulars</h2>
        <p className="text-gray-600">Publish and manage notices for students, teachers, parents, and staff.</p>
      </div>

      {/* Stats & Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-2">Notice Stats</h3>
          {stats ? (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <div className="text-xs text-gray-500">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
                <div className="text-xs text-gray-500">Inactive</div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Loading...</p>
          )}
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border lg:col-span-2">
          <h3 className="font-semibold mb-2">Priority Notices</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm">Title</th>
                  <th className="px-4 py-2 text-left text-sm">Priority</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {priority.length > 0 ? priority.map((p) => (
                  <tr key={p._id}>
                    <td className="px-4 py-2">{p.title}</td>
                    <td className="px-4 py-2">{p.priority}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-center text-gray-500">No priority items.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Notice */}
      <div className="p-4 bg-white rounded-lg shadow-sm border space-y-3">
        <h3 className="font-semibold">Create Notice</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            className="border p-2 rounded"
            placeholder="Title"
          />
          <select
            value={form.type}
            onChange={(e) => setForm((s) => ({ ...s, type: e.target.value as CreateNoticeRequest['type'] }))}
            className="border p-2 rounded"
          >
            <option value="general">General</option>
            <option value="urgent">Urgent</option>
            <option value="event">Event</option>
            <option value="holiday">Holiday</option>
            <option value="exam">Exam</option>
          </select>
          <select
            value={form.targetAudience}
            onChange={(e) => setForm((s) => ({ ...s, targetAudience: e.target.value as CreateNoticeRequest['targetAudience'] }))}
            className="border p-2 rounded"
          >
            <option value="all">All</option>
            <option value="students">Students</option>
            <option value="teachers">Teachers</option>
            <option value="parents">Parents</option>
            <option value="staff">Staff</option>
          </select>
          <div className="flex gap-2">
            <input
              type="date"
              value={form.publishDate}
              onChange={(e) => setForm((s) => ({ ...s, publishDate: e.target.value }))}
              className="border p-2 rounded w-full"
            />
            <input
              type="date"
              value={form.expiryDate || ''}
              onChange={(e) => setForm((s) => ({ ...s, expiryDate: e.target.value }))}
              className="border p-2 rounded w-full"
              placeholder="Expiry (optional)"
            />
          </div>
        </div>
        <textarea
          value={form.content}
          onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))}
          className="border p-2 rounded w-full min-h-[100px]"
          placeholder="Write notice content..."
        />
        <div className="flex gap-2">
          <button
            onClick={handleCreate}
            disabled={!canSubmit || creating}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {creating ? 'Publishing...' : 'Publish Notice'}
          </button>
          <button
            onClick={() => setForm({
              title: '',
              content: '',
              type: 'general',
              targetAudience: 'all',
              publishDate: new Date().toISOString().slice(0, 10),
              expiryDate: '',
              attachments: [],
            })}
            className="border px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white rounded-lg shadow-sm border grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          value={filters.type || ''}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value || undefined }))}
          className="border p-2 rounded"
        >
          <option value="">All Types</option>
          <option value="general">General</option>
          <option value="urgent">Urgent</option>
          <option value="event">Event</option>
          <option value="holiday">Holiday</option>
          <option value="exam">Exam</option>
        </select>
        <select
          value={filters.targetAudience || ''}
          onChange={(e) => setFilters((f) => ({ ...f, targetAudience: e.target.value || undefined }))}
          className="border p-2 rounded"
        >
          <option value="">All Audience</option>
          <option value="all">All</option>
          <option value="students">Students</option>
          <option value="teachers">Teachers</option>
          <option value="parents">Parents</option>
          <option value="staff">Staff</option>
        </select>
        <select
          value={String(filters.isActive ?? '')}
          onChange={(e) => setFilters((f) => ({ ...f, isActive: e.target.value === '' ? undefined : e.target.value === 'true' }))}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button onClick={() => void refetch()} className="border px-4 py-2 rounded">Refresh</button>
      </div>

      {/* Notices List */}
      <div className="p-4 bg-white rounded-lg shadow-sm border">
        {isLoading && <p>Loading notices...</p>}
        {isError && <p className="text-red-600">Failed to load notices.</p>}
        {!isLoading && !isError && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Title</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Audience</th>
                <th className="px-6 py-3 text-left">Publish</th>
                <th className="px-6 py-3 text-left">Expiry</th>
                <th className="px-6 py-3 text-left">Active</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notices.length > 0 ? notices.map((n) => (
                <tr key={n._id}>
                  <td className="px-6 py-2">
                    <div className="font-medium">{n.title}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{n.content}</div>
                  </td>
                  <td className="px-6 py-2 capitalize">{n.type}</td>
                  <td className="px-6 py-2 capitalize">{n.targetAudience}</td>
                  <td className="px-6 py-2">{new Date(n.publishDate).toLocaleDateString()}</td>
                  <td className="px-6 py-2">{n.expiryDate ? new Date(n.expiryDate).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${n.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {n.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-2 space-x-2">
                    <button onClick={() => openEdit(n)} className="px-2 py-1 border rounded">
                      Edit
                    </button>
                    <button onClick={() => void toggleActive(n)} className="px-2 py-1 border rounded">
                      {n.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => remove(n._id)} className="px-2 py-1 border rounded text-red-600">
                      Delete
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No notices found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Edit Notice</h3>
              <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={editForm.title || ''}
                onChange={(e) => setEditForm((s) => ({ ...s, title: e.target.value }))}
                className="border p-2 rounded"
                placeholder="Title"
              />
              <select
                value={editForm.type || 'general'}
                onChange={(e) => setEditForm((s) => ({ ...s, type: e.target.value as UpdateNoticeRequest['type'] }))}
                className="border p-2 rounded"
              >
                <option value="general">General</option>
                <option value="urgent">Urgent</option>
                <option value="event">Event</option>
                <option value="holiday">Holiday</option>
                <option value="exam">Exam</option>
              </select>
              <select
                value={editForm.targetAudience || 'all'}
                onChange={(e) => setEditForm((s) => ({ ...s, targetAudience: e.target.value as UpdateNoticeRequest['targetAudience'] }))}
                className="border p-2 rounded"
              >
                <option value="all">All</option>
                <option value="students">Students</option>
                <option value="teachers">Teachers</option>
                <option value="parents">Parents</option>
                <option value="staff">Staff</option>
              </select>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={editForm.publishDate || ''}
                  onChange={(e) => setEditForm((s) => ({ ...s, publishDate: e.target.value }))}
                  className="border p-2 rounded w-full"
                />
                <input
                  type="date"
                  value={editForm.expiryDate || ''}
                  onChange={(e) => setEditForm((s) => ({ ...s, expiryDate: e.target.value }))}
                  className="border p-2 rounded w-full"
                  placeholder="Expiry (optional)"
                />
              </div>
            </div>
            <textarea
              value={editForm.content || ''}
              onChange={(e) => setEditForm((s) => ({ ...s, content: e.target.value }))}
              className="border p-2 rounded w-full min-h-[100px]"
              placeholder="Write notice content..."
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditing(null)} className="border px-4 py-2 rounded">Cancel</button>
              <button
                onClick={handleUpdate}
                disabled={updating || !editForm.title || !editForm.content}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
              >
                {updating ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
