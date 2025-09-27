import React, { useMemo, useState, useEffect } from 'react';
import { useGetNoticesQuery, useMarkNoticeViewedMutation, type Notice } from '../../store/api/noticeApi';

export type Audience = 'all' | 'students' | 'teachers' | 'parents' | 'staff';

interface NoticesListProps {
  title?: string;
  audience?: Audience; // if provided, include 'all' + this audience
  onlyActive?: boolean; // show only active by default
}

const NoticesList: React.FC<NoticesListProps> = ({ title = 'Notices', audience, onlyActive = true }) => {
  // Server-side filter if audience provided; otherwise fetch all
  const { data: notices = [], isLoading, isError, refetch } = useGetNoticesQuery(onlyActive ? { isActive: true } : {});

  const normalize = (v?: string): Audience | undefined => {
    const s = (v || '').toLowerCase();
    if (s === 'all') return 'all';
    if (s === 'student' || s === 'students') return 'students';
    if (s === 'teacher' || s === 'teachers') return 'teachers';
    if (s === 'parent' || s === 'parents') return 'parents';
    if (s === 'staff' || s === 'staffs') return 'staff';
    return undefined;
  };

  const sorted = useMemo(() => {
    let list = [...notices];
    // Filter by audience: always include 'all'
    if (audience) {
      const want = normalize(audience);
      list = list.filter((n) => {
        const t = normalize(n.targetAudience as string);
        return t === 'all' || (want && t === want);
      });
    }
    // Show active first or only active? Keep both but sort active to top
    list.sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    });
    return list;
  }, [notices, audience]);

  const [selected, setSelected] = useState<Notice | null>(null);
  const [markViewed] = useMarkNoticeViewedMutation();

  useEffect(() => {
    if (selected?._id) {
      // fire and forget, safe if endpoint allows multiple
      void markViewed(selected._id).catch(() => undefined);
    }
  }, [selected, markViewed]);

  const renderRow = (n: Notice) => (
    <tr key={n._id}>
      <td className="px-6 py-2 cursor-pointer" onClick={() => setSelected(n)}>
        <div className="font-medium text-blue-700 hover:underline">{n.title}</div>
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
    </tr>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{Array.isArray(notices) ? `${notices.length} total` : ''}</span>
          <button onClick={() => void refetch()} className="border px-3 py-1.5 rounded">Refresh</button>
        </div>
      </div>
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
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sorted.length > 0 ? (
                sorted.map(renderRow)
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-gray-500">
                    No notices found.
                    {Array.isArray(notices) && notices.length > 0 && audience ? (
                      <div className="text-xs text-gray-400 mt-1">Try removing audience filter or check if any notice targets "{audience}".</div>
                    ) : null}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{selected.title}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="text-sm text-gray-500">
              <span className="capitalize">{selected.type}</span> • <span className="capitalize">{selected.targetAudience}</span> • {new Date(selected.publishDate).toLocaleDateString()} {selected.expiryDate ? `• Expires: ${new Date(selected.expiryDate).toLocaleDateString()}` : ''}
            </div>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{selected.content}</p>
            </div>
            {Array.isArray(selected.attachments) && selected.attachments.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Attachments</h4>
                <ul className="list-disc pl-6 text-sm">
                  {selected.attachments.map((a, i) => (
                    <li key={i} className="break-all"><a href={a} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{a}</a></li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end">
              <button onClick={() => setSelected(null)} className="border px-4 py-2 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticesList;
