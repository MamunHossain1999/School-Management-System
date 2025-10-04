import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import {
  useGetBooksQuery,
  useBorrowBookMutation,
  useGetBorrowedBooksQuery,
  useReturnBookMutation,
  type Book,
} from '../../store/api/libraryApi';

type TabKey = 'browse' | 'myborrows';

const TeacherLibrary: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('browse');
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Library & Resources</h2>
        <div className="flex gap-2 border rounded-lg overflow-hidden">
          <button className={`px-4 py-2 text-sm ${activeTab==='browse'?'bg-blue-600 text-white':'bg-white'}`} onClick={()=>setActiveTab('browse')}>Browse Books</button>
          <button className={`px-4 py-2 text-sm ${activeTab==='myborrows'?'bg-blue-600 text-white':'bg-white'}`} onClick={()=>setActiveTab('myborrows')}>My Borrows</button>
        </div>
      </div>

      {activeTab === 'browse' && <BrowseBooks />}
      {activeTab === 'myborrows' && <MyBorrows />}
      {returnModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold">Return Book</h3>
              <button onClick={() => setReturnModal({ open: false, borrowId: null })} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-700">Mark this book as returned{returnModal.bookTitle ? <>: <span className="font-semibold">"{returnModal.bookTitle}"</span></> : ''}?</p>
              <div className="flex justify-end gap-2 pt-2">
                <button className="btn btn-ghost" onClick={() => setReturnModal({ open: false, borrowId: null })}>Cancel</button>
                <button
                  className="btn btn-primary"
                  disabled={isReturning}
                  onClick={async () => {
                    if (!returnModal.borrowId) return;
                    await doReturn(returnModal.borrowId);
                    setReturnModal({ open: false, borrowId: null });
                  }}
                >
                  {isReturning ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BrowseBooks: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { data: books, isLoading, isError, refetch } = useGetBooksQuery({ search, category });
  const [borrowBook, { isLoading: isBorrowing }] = useBorrowBookMutation();
  const [dueDate, setDueDate] = useState<string>('');
  const [selected, setSelected] = useState<Book | null>(null);

  const openBorrow = (b: Book) => {
    setSelected(b);
    setDueDate(new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0,10));
  };

  const submitBorrow = async () => {
    if (!selected || !user?._id) return;
    try {
      await borrowBook({ bookId: selected._id, borrowerId: user._id, borrowerType: 'teacher', dueDate }).unwrap();
      setSelected(null);
      refetch();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search title/author" className="input input-bordered w-64" />
        <input value={category} onChange={(e)=>setCategory(e.target.value)} placeholder="Category" className="input input-bordered w-48" />
        <button className="btn btn-sm btn-outline" onClick={()=>refetch()}>Filter</button>
      </div>
      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Author</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Available</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (<tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">Loading...</td></tr>)}
            {isError && (<tr><td colSpan={5} className="px-3 py-6 text-center text-red-600">Failed to load</td></tr>)}
            {!isLoading && !isError && books && books.length === 0 && (<tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">No books</td></tr>)}
            {books?.map((b)=> (
              <tr key={b._id} className="border-t">
                <td className="px-3 py-2">{b.title}</td>
                <td className="px-3 py-2">{b.author}</td>
                <td className="px-3 py-2 text-center">{b.category}</td>
                <td className="px-3 py-2 text-center">{b.availableCopies}</td>
                <td className="px-3 py-2 text-right">
                  <button disabled={b.availableCopies<=0} className="btn btn-xs" onClick={()=>openBorrow(b)}>Borrow</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold">Borrow Book</h3>
              <button onClick={()=>setSelected(null)} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-sm">{selected.title} by {selected.author}</div>
              <label className="block text-sm">Due Date</label>
              <input type="date" className="input input-bordered w-full" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} />
              <div className="flex justify-end gap-2 pt-2">
                <button className="btn btn-ghost" onClick={()=>setSelected(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={submitBorrow} disabled={isBorrowing}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MyBorrows: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const borrowerId = user?._id;
  const { data: records, isLoading, isError, refetch } = useGetBorrowedBooksQuery({ borrowerId });
  const [returnBook, { isLoading: isReturning }] = useReturnBookMutation();
  const [returnModal, setReturnModal] = useState<{ open: boolean; borrowId: string | null; bookTitle?: string }>({ open: false, borrowId: null, bookTitle: undefined });

  const doReturn = async (id: string) => {
    try { await returnBook({ borrowId: id, data: {} }).unwrap(); refetch(); } catch (e) { console.error(e); }
  };
  // Renew is not available in provided backend routes; hiding renew UI

  return (
    <div className="overflow-x-auto bg-white border rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            <th className="px-3 py-2 text-left">Book</th>
            <th className="px-3 py-2">Due</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (<tr><td colSpan={4} className="px-3 py-6 text-center text-gray-500">Loading...</td></tr>)}
          {isError && (<tr><td colSpan={4} className="px-3 py-6 text-center text-red-600">Failed to load</td></tr>)}
          {!isLoading && !isError && records && records.length === 0 && (<tr><td colSpan={4} className="px-3 py-6 text-center text-gray-500">No records</td></tr>)}
          {records?.map((r)=> (
            <tr key={r._id} className="border-t">
              <td className="px-3 py-2">{typeof r.book === 'string' ? r.book : r.book.title}</td>
              <td className="px-3 py-2 text-center">{new Date(r.dueDate).toLocaleDateString()}</td>
              <td className="px-3 py-2 text-center">{r.status}</td>
              <td className="px-3 py-2 text-right space-x-2">
                {r.status !== 'returned' && (
                  <button
                    className="btn btn-xs"
                    onClick={()=>setReturnModal({ open: true, borrowId: r._id, bookTitle: typeof r.book === 'string' ? r.book : r.book.title })}
                    disabled={isReturning}
                  >
                    Return
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeacherLibrary;
