import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import {
  useGetBooksQuery,
  useBorrowBookMutation,
  useGetBorrowedBooksQuery,
  useRenewBookMutation,
  useGetReservationsQuery,
  useReserveBookMutation,
  type Book,
} from '../../store/api/libraryApi';

type TabKey = 'browse' | 'myborrows' | 'reservations';

const StudentLibrary: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('browse');
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Library</h2>
        <div className="flex gap-2 border rounded-lg overflow-hidden">
          <button className={`px-4 py-2 text-sm ${activeTab==='browse'?'bg-blue-600 text-white':'bg-white'}`} onClick={()=>setActiveTab('browse')}>Browse Books</button>
          <button className={`px-4 py-2 text-sm ${activeTab==='myborrows'?'bg-blue-600 text-white':'bg-white'}`} onClick={()=>setActiveTab('myborrows')}>My Borrows</button>
          <button className={`px-4 py-2 text-sm ${activeTab==='reservations'?'bg-blue-600 text-white':'bg-white'}`} onClick={()=>setActiveTab('reservations')}>Reservations</button>
        </div>
      </div>

      {activeTab === 'browse' && <BrowseBooks />}
      {activeTab === 'myborrows' && <MyBorrows />}
      {activeTab === 'reservations' && <MyReservations />}
    </div>
  );
};

const BrowseBooks: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { data: books, isLoading, isError, refetch } = useGetBooksQuery({ search, category });
  const [reserveBook, { isLoading: isReserving }] = useReserveBookMutation();
  const [borrowBook, { isLoading: isBorrowing }] = useBorrowBookMutation();
  const [mode, setMode] = useState<'reserve' | 'borrow'>('reserve');
  const [selected, setSelected] = useState<Book | null>(null);
  const [dueDate, setDueDate] = useState<string>('');

  const openAction = (b: Book, m: 'reserve' | 'borrow') => {
    setSelected(b);
    setMode(m);
    setDueDate(new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0,10));
  };

  const submit = async () => {
    if (!selected || !user?._id) return;
    try {
      if (mode === 'reserve') {
        await reserveBook({ bookId: selected._id, borrowerId: user._id, borrowerType: 'student' }).unwrap();
      } else {
        await borrowBook({ bookId: selected._id, borrowerId: user._id, borrowerType: 'student', dueDate }).unwrap();
      }
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
                <td className="px-3 py-2 text-right space-x-2">
                  <button className="btn btn-xs" onClick={()=>openAction(b,'reserve')}>Reserve</button>
                  <button className="btn btn-xs" disabled={b.availableCopies<=0} onClick={()=>openAction(b,'borrow')}>Borrow</button>
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
              <h3 className="font-semibold">{mode === 'reserve' ? 'Reserve Book' : 'Borrow Book'}</h3>
              <button onClick={()=>setSelected(null)} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-sm">{selected.title} by {selected.author}</div>
              {mode === 'borrow' && (
                <>
                  <label className="block text-sm">Due Date</label>
                  <input type="date" className="input input-bordered w-full" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} />
                </>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button className="btn btn-ghost" onClick={()=>setSelected(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={submit} disabled={mode==='reserve'?isReserving:isBorrowing}>Confirm</button>
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
  const [renewBook, { isLoading: isRenewing }] = useRenewBookMutation();
  const [renewModal, setRenewModal] = useState<{ borrowId: string; newDueDate: string; notes?: string } | null>(null);

  const submitRenew = async () => {
    if (!renewModal) return;
    try { await renewBook(renewModal).unwrap(); setRenewModal(null); refetch(); } catch (e) { console.error(e); }
  };

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
                  <button className="btn btn-xs" onClick={()=>setRenewModal({ borrowId: r._id, newDueDate: new Date().toISOString().slice(0,10) })}>Renew</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {renewModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold">Renew Book</h3>
              <button onClick={() => setRenewModal(null)} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <label className="block text-sm">New Due Date</label>
              <input type="date" className="input input-bordered w-full" value={renewModal.newDueDate} onChange={(e)=>setRenewModal({ ...renewModal, newDueDate: e.target.value })} />
              <label className="block text-sm">Notes</label>
              <textarea className="textarea textarea-bordered w-full" onChange={(e)=>setRenewModal({ ...renewModal, notes: e.target.value })} />
              <div className="flex justify-end gap-2 pt-2">
                <button className="btn btn-ghost" onClick={()=>setRenewModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={submitRenew} disabled={isRenewing}>Renew</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MyReservations: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const borrowerId = user?._id;
  const { data: reservations, isLoading, isError } = useGetReservationsQuery({ borrowerId });
  return (
    <div className="overflow-x-auto bg-white border rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            <th className="px-3 py-2 text-left">Book</th>
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (<tr><td colSpan={3} className="px-3 py-6 text-center text-gray-500">Loading...</td></tr>)}
          {isError && (<tr><td colSpan={3} className="px-3 py-6 text-center text-red-600">Failed to load</td></tr>)}
          {!isLoading && !isError && reservations && reservations.length === 0 && (<tr><td colSpan={3} className="px-3 py-6 text-center text-gray-500">No reservations</td></tr>)}
          {reservations?.map((r)=> (
            <tr key={r._id} className="border-t">
              <td className="px-3 py-2">{r.book.title}</td>
              <td className="px-3 py-2 text-center">{new Date(r.reservationDate).toLocaleDateString()}</td>
              <td className="px-3 py-2 text-center">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentLibrary;
