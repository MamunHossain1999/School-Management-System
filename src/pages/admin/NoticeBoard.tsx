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
import { Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
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
  
  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<Notice | null>(null);

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

  const handleDeleteClick = (notice: Notice) => {
    setDeleteConfirm(notice);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await deleteNotice(deleteConfirm._id).unwrap();
      toast.success('Notice deleted successfully');
      setDeleteConfirm(null);
      void refetch();
    } catch (e: unknown) {
      const msg = (e as { data?: { message?: string } })?.data?.message || 'Failed to delete notice';
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
            <option value="important">Important</option>
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
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {/* Edit Button */}
                      <button 
                        onClick={() => openEdit(n)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                        title="Edit Notice"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      
                      {/* Toggle Active/Inactive Button */}
                      <button 
                        onClick={() => void toggleActive(n)}
                        className={`inline-flex items-center px-3 py-1.5 text-sm font-medium border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${
                          n.isActive 
                            ? 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-300 focus:ring-orange-500' 
                            : 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 focus:ring-green-500'
                        }`}
                        title={n.isActive ? 'Deactivate Notice' : 'Activate Notice'}
                      >
                        {n.isActive ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            Activate
                          </>
                        )}
                      </button>
                      
                      {/* Delete Button */}
                      <button 
                        onClick={() => handleDeleteClick(n)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
                        title="Delete Notice"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center space-x-3">
                <Edit2 className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Edit Notice</h3>
              </div>
              <button 
                onClick={() => setEditing(null)} 
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
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
                <option value="important">Important</option>
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
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white">
              <div className="flex items-center space-x-3">
                <Trash2 className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Delete Notice</h3>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Are you sure you want to delete this notice?
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  <strong>"{deleteConfirm.title}"</strong>
                </p>
                <p className="text-sm text-gray-500">
                  This action cannot be undone. The notice will be permanently removed from the system.
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
                >
                  Delete Notice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
