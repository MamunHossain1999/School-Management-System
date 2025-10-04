import React, { useState } from 'react';
import {
  useGetBooksQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useGetBorrowedBooksQuery,
  useReturnBookMutation,
  useGetLibraryStatsQuery,
} from '../../store/api/libraryApi';
import type { Book, CreateBookRequest, UpdateBookRequest } from '../../store/api/libraryApi';

type TabKey = 'books' | 'borrowed' | 'stats';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'books', label: 'Books' },
  { key: 'borrowed', label: 'Borrowed' },
  { key: 'stats', label: 'Stats' },
];

const LibraryManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('books');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Library Management</h2>
          <p className="text-gray-600">Manage books and borrowing operations.</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <div className="flex flex-wrap border-b">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px focus:outline-none transition-colors ${
                activeTab === t.key
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === 'books' && <BooksSection />}
          {activeTab === 'borrowed' && <BorrowedSection />}
          {activeTab === 'stats' && <StatsSection />}
        </div>
      </div>
    </div>
  );
};

const BooksSection: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { data: books, isLoading, isError, refetch } = useGetBooksQuery({ search, category });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; book: Book | null }>({ open: false, book: null });
  const [form, setForm] = useState<CreateBookRequest>({
    title: '',
    author: '',
    isbn: '',
    category: '',
    totalCopies: 1,
    location: '',
    language: 'English',
    condition: 'good',
  });

  const [createBook, { isLoading: isCreating }] = useCreateBookMutation();
  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation();
  const [deleteBook, { isLoading: isDeleting }] = useDeleteBookMutation();

  const resetForm = () => {
    setForm({ title: '', author: '', isbn: '', category: '', totalCopies: 1, location: '', language: 'English', condition: 'good' });
    setEditing(null);
  };

  const openCreate = () => { resetForm(); setModalOpen(true); };
  const openEdit = (b: Book) => {
    setEditing(b);
    const f: UpdateBookRequest = {
      title: b.title,
      author: b.author,
      isbn: b.isbn,
      category: b.category,
      publisher: b.publisher,
      totalCopies: b.totalCopies,
      location: b.location,
      shelfNumber: b.shelfNumber,
      description: b.description,
      publishedYear: b.publishedYear,
      language: b.language,
      pages: b.pages,
      price: b.price,
      condition: b.condition,
      coverImage: b.coverImage,
      tags: b.tags,
      isActive: b.isActive,
    };
    setForm(f as CreateBookRequest);
    setModalOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateBook({ id: editing._id, data: form as UpdateBookRequest }).unwrap();
      } else {
        await createBook(form).unwrap();
      }
      setModalOpen(false);
      resetForm();
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async (b: Book) => {
    setDeleteModal({ open: true, book: b });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Books</h3>
          <p className="text-sm text-gray-500">Create, edit and manage all library books.</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary gap-2" title="Add a new book">
          <span>➕</span>
          <span>Add Book</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between bg-gray-50/60 p-3 rounded-md border">
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title/author"
            className="input input-bordered w-64"
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className="input input-bordered w-48"
          />
          <button onClick={() => refetch()} className="btn btn-sm btn-outline gap-1" title="Apply filters">
            <span>🔎</span>
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Author</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">ISBN</th>
              <th className="px-3 py-2">Copies</th>
              <th className="px-3 py-2">Available</th>
              <th className="px-3 py-2">Active</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && (
              <tr><td colSpan={8} className="px-3 py-10 text-center text-gray-500">Loading books...</td></tr>
            )}
            {isError && (
              <tr><td colSpan={8} className="px-3 py-10 text-center text-red-600">Failed to load books</td></tr>
            )}
            {!isLoading && !isError && books && books.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-10">
                  <div className="flex flex-col items-center justify-center text-center gap-2 text-gray-500">
                    <div className="text-3xl">📚</div>
                    <div className="font-semibold">No books found</div>
                    <div className="text-sm">Try adjusting filters or add a new book.</div>
                  </div>
                </td>
              </tr>
            )}
            {books?.map((b, idx) => (
              <tr key={b._id} className={`hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <td className="px-3 py-2">{b.title}</td>
                <td className="px-3 py-2">{b.author}</td>
                <td className="px-3 py-2 text-center">{b.category}</td>
                <td className="px-3 py-2 text-center">{b.isbn}</td>
                <td className="px-3 py-2 text-center">{b.totalCopies}</td>
                <td className="px-3 py-2 text-center">{b.availableCopies}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{b.isActive ? 'Yes' : 'No'}</span>
                </td>
                <td className="px-3 py-2 text-right space-x-2">
                  <button
                    onClick={() => openEdit(b)}
                    className="btn btn-xs btn-outline btn-warning gap-1 hover:opacity-90"
                    title="Edit book"
                  >
                    <span>✏️</span>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteModal({ open: true, book: b })}
                    className="btn btn-xs btn-outline btn-error gap-1 hover:opacity-90"
                    title="Delete book"
                    disabled={isDeleting}
                  >
                    <span>🗑️</span>
                    <span>Delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold">{editing ? 'Edit Book' : 'Add Book'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <form onSubmit={submit} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="input input-bordered" placeholder="Title" value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})} required />
              <input className="input input-bordered" placeholder="Author" value={form.author} onChange={(e)=>setForm({...form, author: e.target.value})} required />
              <input className="input input-bordered" placeholder="ISBN" value={form.isbn} onChange={(e)=>setForm({...form, isbn: e.target.value})} required />
              <input className="input input-bordered" placeholder="Category" value={form.category} onChange={(e)=>setForm({...form, category: e.target.value})} required />
              <input className="input input-bordered" placeholder="Location" value={form.location} onChange={(e)=>setForm({...form, location: e.target.value})} required />
              <input type="number" className="input input-bordered" placeholder="Total Copies" value={form.totalCopies} onChange={(e)=>setForm({...form, totalCopies: Number(e.target.value)})} min={1} required />
              <input className="input input-bordered" placeholder="Language" value={form.language} onChange={(e)=>setForm({...form, language: e.target.value})} />
              <select className="input input-bordered" value={form.condition} onChange={(e)=>setForm({...form, condition: e.target.value as CreateBookRequest['condition']})}>
                <option value="new">New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <button type="button" className="btn btn-ghost" onClick={()=>setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isCreating || isUpdating}>{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal.open && deleteModal.book && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold">Delete Book</h3>
              <button onClick={() => setDeleteModal({ open: false, book: null })} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-700">Are you sure you want to delete <span className="font-semibold">"{deleteModal.book.title}"</span>? This action cannot be undone.</p>
              <div className="flex justify-end gap-2 pt-2">
                <button className="btn btn-ghost" onClick={() => setDeleteModal({ open: false, book: null })}>Cancel</button>
                <button
                  className="btn btn-error"
                  disabled={isDeleting}
                  onClick={async () => {
                    if (!deleteModal.book) return;
                    try {
                      await deleteBook(deleteModal.book._id).unwrap();
                      setDeleteModal({ open: false, book: null });
                      refetch();
                    } catch (e) { console.error(e); }
                  }}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BorrowedSection: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const { data: borrowed, isLoading, isError, refetch } = useGetBorrowedBooksQuery({ status });
  const [returnBook, { isLoading: isReturning }] = useReturnBookMutation();
  const [returnModal, setReturnModal] = useState<{ open: boolean; borrowId: string | null; bookTitle?: string }>(
    { open: false, borrowId: null, bookTitle: undefined }
  );

  const doReturn = async (id: string) => {
    try {
      await returnBook({ borrowId: id, data: {} }).unwrap();
      refetch();
    } catch (e) { console.error(e); }
  };

  // Renew and Pay Fine are not supported by the provided backend routes; hiding those actions

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <select className="input input-bordered" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="borrowed">Borrowed</option>
            <option value="overdue">Overdue</option>
            <option value="returned">Returned</option>
            <option value="renewed">Renewed</option>
          </select>
          <button onClick={()=>refetch()} className="btn btn-sm btn-outline gap-1" title="Apply filters">
            <span>🔎</span>
            <span>Apply</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left">Book</th>
              <th className="px-3 py-2 text-left">Borrower</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Due</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && (<tr><td colSpan={6} className="px-3 py-10 text-center text-gray-500">Loading borrowed records...</td></tr>)}
            {isError && (<tr><td colSpan={6} className="px-3 py-10 text-center text-red-600">Failed to load</td></tr>)}
            {!isLoading && !isError && borrowed && borrowed.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-10">
                  <div className="flex flex-col items-center justify-center text-center gap-2 text-gray-500">
                    <div className="text-3xl">📖</div>
                    <div className="font-semibold">No borrowed records</div>
                    <div className="text-sm">Once books are issued, they will appear here.</div>
                  </div>
                </td>
              </tr>
            )}
            {borrowed?.map((r, idx) => (
              <tr key={r._id} className={`hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <td className="px-3 py-2">{typeof r.book === 'string' ? r.book : r.book.title}</td>
                <td className="px-3 py-2">{r.borrower}</td>
                <td className="px-3 py-2 text-center">{r.borrowerType}</td>
                <td className="px-3 py-2 text-center">{new Date(r.dueDate).toLocaleDateString()}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${r.status === 'overdue' ? 'bg-red-100 text-red-700' : r.status === 'borrowed' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{r.status}</span>
                </td>
                <td className="px-3 py-2 text-right space-x-2">
                  {r.status !== 'returned' && (
                    <button
                      onClick={() => setReturnModal({ open: true, borrowId: r._id, bookTitle: typeof r.book === 'string' ? r.book : r.book.title })}
                      className="btn btn-xs btn-outline gap-1"
                      disabled={isReturning}
                      title="Mark as returned"
                    >
                      <span>↩</span>
                      <span>Return</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

const MembersSection: React.FC = () => {
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const { data: members, isLoading, isError, refetch } = useGetLibraryMembersQuery({ type, search });
  const [addMember, { isLoading: isAdding }] = useAddLibraryMemberMutation();
  const [updateMember, { isLoading: isUpdating }] = useUpdateLibraryMemberMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LibraryMember | null>(null);
  const [form, setForm] = useState<Partial<LibraryMember & { password?: string }>>({ type: 'student', maxBooksAllowed: 3, isActive: true });

  const openCreate = () => { setEditing(null); setForm({ type: 'student', maxBooksAllowed: 3, isActive: true }); setModalOpen(true); };
  const openEdit = (m: LibraryMember) => { setEditing(m); setForm({ ...m }); setModalOpen(true); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        const payload = form as LibraryMember;
        await updateMember({ id: editing._id, data: {
          name: payload.name!,
          email: payload.email!,
          phone: payload.phone!,
          maxBooksAllowed: payload.maxBooksAllowed!,
          isActive: payload.isActive!,
        }}).unwrap();
      } else {
        await addMember({
          memberId: form.memberId!,
          name: form.name!,
          email: form.email!,
          phone: form.phone,
          type: form.type as 'student' | 'teacher' | 'staff',
          class: form.class,
          section: form.section,
          department: form.department,
          maxBooksAllowed: form.maxBooksAllowed as number,
        }).unwrap();
      }
      setModalOpen(false);
      refetch();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <select className="input input-bordered" value={type} onChange={(e)=>setType(e.target.value)}>
            <option value="">All</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="staff">Staff</option>
          </select>
          <input className="input input-bordered" placeholder="Search name/email" value={search} onChange={(e)=>setSearch(e.target.value)} />
          <button className="btn btn-sm btn-outline" onClick={()=>refetch()}>Apply</button>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>Add Member</button>
      </div>

      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">Member ID</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Max Books</th>
              <th className="px-3 py-2">Active</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (<tr><td colSpan={7} className="px-3 py-6 text-center text-gray-500">Loading members...</td></tr>)}
            {isError && (<tr><td colSpan={7} className="px-3 py-6 text-center text-red-600">Failed to load</td></tr>)}
            {!isLoading && !isError && members && members.length === 0 && (<tr><td colSpan={7} className="px-3 py-6 text-center text-gray-500">No members</td></tr>)}
            {members?.map((m) => (
              <tr key={m._id} className="border-t">
                <td className="px-3 py-2">{m.memberId}</td>
                <td className="px-3 py-2">{m.name}</td>
                <td className="px-3 py-2 text-center">{m.type}</td>
                <td className="px-3 py-2 text-center">{m.email}</td>
                <td className="px-3 py-2 text-center">{m.maxBooksAllowed}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${m.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{m.isActive ? 'Yes' : 'No'}</span>
                </td>
                <td className="px-3 py-2 text-right">
                  <button className="btn btn-xs" onClick={()=>openEdit(m)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold">{editing ? 'Edit Member' : 'Add Member'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <form onSubmit={submit} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {!editing && (
                <input className="input input-bordered" placeholder="Member ID" value={form.memberId || ''} onChange={(e)=>setForm({...form, memberId: e.target.value})} required />
              )}
              <input className="input input-bordered" placeholder="Name" value={form.name || ''} onChange={(e)=>setForm({...form, name: e.target.value})} required />
              <input type="email" className="input input-bordered" placeholder="Email" value={form.email || ''} onChange={(e)=>setForm({...form, email: e.target.value})} required />
              <input className="input input-bordered" placeholder="Phone" value={form.phone || ''} onChange={(e)=>setForm({...form, phone: e.target.value})} />
              <select className="input input-bordered" value={form.type || 'student'} onChange={(e)=>setForm({...form, type: e.target.value as 'student' | 'teacher' | 'staff'})}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="staff">Staff</option>
              </select>
              <input className="input input-bordered" placeholder="Class" value={form.class || ''} onChange={(e)=>setForm({...form, class: e.target.value})} />
              <input className="input input-bordered" placeholder="Section" value={form.section || ''} onChange={(e)=>setForm({...form, section: e.target.value})} />
              <input className="input input-bordered" placeholder="Department" value={form.department || ''} onChange={(e)=>setForm({...form, department: e.target.value})} />
              <input type="number" className="input input-bordered" placeholder="Max Books" value={form.maxBooksAllowed || 3} onChange={(e)=>setForm({...form, maxBooksAllowed: Number(e.target.value)})} />
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.isActive} onChange={(e)=>setForm({...form, isActive: e.target.checked})} /> Active</label>
              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <button type="button" className="btn btn-ghost" onClick={()=>setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isAdding || isUpdating}>{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatsSection: React.FC = () => {
  const { data: stats, isLoading, isError } = useGetLibraryStatsQuery({});
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {isLoading && <div className="col-span-3 text-center text-gray-500 py-6">Loading stats...</div>}
      {isError && <div className="col-span-3 text-center text-red-600 py-6">Failed to load stats</div>}
      {stats && (
        <>
          <StatCard title="Total Books" value={stats.totalBooks} />
          <StatCard title="Available" value={stats.availableBooks} />
          <StatCard title="Borrowed" value={stats.borrowedBooks} />
          <StatCard title="Overdue" value={stats.overdueBooks} />
          <StatCard title="Members" value={stats.totalMembers} />
          <StatCard title="Active Members" value={stats.activeMembers} />
        </>
      )}
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number | string }> = ({ title, value }) => (
  <div className="p-4 bg-white border rounded-lg">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-2xl font-semibold text-gray-900">{value}</div>
  </div>
);

const ReportsSection: React.FC = () => {
  const { data: popular, isLoading: popLoading } = useGetPopularBooksReportQuery({});
  const { data: defaulters, isLoading: defLoading } = useGetDefaultersReportQuery({});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-4 py-2 border-b font-semibold">Popular Books</div>
        <div className="p-4">
          {popLoading && <div className="text-gray-500">Loading...</div>}
          {!popLoading && (!popular || popular.length === 0) && <div className="text-gray-500">No data</div>}
          <ul className="space-y-2">
            {popular?.map((p, idx) => (
              <li key={idx} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-medium">{p.book.title}</div>
                  <div className="text-xs text-gray-500">Borrows: {p.borrowCount}</div>
                </div>
                <div className="text-xs text-gray-500">Last: {new Date(p.lastBorrowed).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-4 py-2 border-b font-semibold">Defaulters</div>
        <div className="p-4">
          {defLoading && <div className="text-gray-500">Loading...</div>}
          {!defLoading && (!defaulters || defaulters.length === 0) && <div className="text-gray-500">No data</div>}
          <ul className="space-y-2">
            {defaulters?.map((d, idx) => (
              <li key={idx} className="border rounded p-2">
                <div className="font-medium">{d.member.name} ({d.member.type})</div>
                <div className="text-xs text-gray-500">Overdue: {d.overdueBooks.length} | Fine: {d.totalFine}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const ReservationsSection: React.FC = () => {
  const { data: reservations, isLoading, isError } = useGetReservationsQuery({});
  return (
    <div className="overflow-x-auto bg-white border rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            <th className="px-3 py-2 text-left">Book</th>
            <th className="px-3 py-2 text-left">Borrower</th>
            <th className="px-3 py-2">Type</th>
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (<tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">Loading...</td></tr>)}
          {isError && (<tr><td colSpan={5} className="px-3 py-6 text-center text-red-600">Failed to load</td></tr>)}
          {!isLoading && !isError && reservations && reservations.length === 0 && (<tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">No reservations</td></tr>)}
          {reservations?.map((r) => (
            <tr key={r._id} className="border-t">
              <td className="px-3 py-2">{r.book.title}</td>
              <td className="px-3 py-2">{r.borrower}</td>
              <td className="px-3 py-2 text-center">{r.borrowerType}</td>
              <td className="px-3 py-2 text-center">{new Date(r.reservationDate).toLocaleDateString()}</td>
              <td className="px-3 py-2 text-center">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LibraryManagement;
