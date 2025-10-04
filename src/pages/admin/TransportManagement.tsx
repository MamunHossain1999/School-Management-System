import React, { useState } from 'react';
import {
  useGetRoutesQuery,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
  useGetBusesQuery,
  useCreateBusMutation,
  useUpdateBusMutation,
  useDeleteBusMutation,
  useAssignBusToRouteMutation,
  useGetStudentTransportQuery,
  useAssignStudentTransportMutation,
  useRemoveStudentTransportMutation,
  type Route,
  type Bus,
  type Stop,
  type CreateRouteRequest,
  type CreateBusRequest,
} from '../../store/api/transportApi';

type TabKey = 'routes' | 'buses' | 'students';

const TransportManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('routes');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transport Management</h2>
          <p className="text-gray-600">Manage routes, buses and student transport assignments.</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <div className="flex flex-wrap border-b">
          {[
            { key: 'routes', label: 'Routes' },
            { key: 'buses', label: 'Buses' },
            { key: 'students', label: 'Student Transport' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as TabKey)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px focus:outline-none transition-colors ${
                activeTab === (t.key as TabKey)
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === 'routes' && <RoutesSection />}
          {activeTab === 'buses' && <BusesSection />}
          {activeTab === 'students' && <StudentTransportSection />}
        </div>
      </div>
    </div>
  );
};

const RoutesSection: React.FC = () => {
  const { data: routes, isLoading, isError, refetch } = useGetRoutesQuery({});
  const [createRoute, { isLoading: isCreating }] = useCreateRouteMutation();
  const [updateRoute, { isLoading: isUpdating }] = useUpdateRouteMutation();
  const [deleteRoute, { isLoading: isDeleting }] = useDeleteRouteMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Route | null>(null);
  const [form, setForm] = useState<CreateRouteRequest>({ name: '', description: '', distance: 0, estimatedTime: 0, stops: [] });
  const [stop, setStop] = useState<Omit<Stop, '_id'>>({ name: '', address: '', arrivalTime: '', departureTime: '', order: 1 });

  const addStop = () => {
    setForm((prev) => ({ ...prev, stops: [...prev.stops, { ...stop }] }));
    setStop({ name: '', address: '', arrivalTime: '', departureTime: '', order: (stop.order || 0) + 1 });
  };
  const removeStop = (idx: number) => setForm((prev) => ({ ...prev, stops: prev.stops.filter((_, i) => i !== idx) }));

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', distance: 0, estimatedTime: 0, stops: [] });
    setStop({ name: '', address: '', arrivalTime: '', departureTime: '', order: 1 });
    setModalOpen(true);
  };
  const openEdit = (r: Route) => {
    setEditing(r);
    const mappedStops: Omit<Stop, '_id'>[] = (r.stops || []).map((s: Stop) => ({
      name: s.name,
      address: s.address,
      arrivalTime: s.arrivalTime,
      departureTime: s.departureTime,
      order: s.order,
    }));
    setForm({ name: r.name, description: r.description, distance: r.distance, estimatedTime: r.estimatedTime, stops: mappedStops });
    setStop({ name: '', address: '', arrivalTime: '', departureTime: '', order: (mappedStops[mappedStops.length - 1]?.order ?? 0) + 1 });
    setModalOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateRoute({ id: editing._id, data: form }).unwrap();
      } else {
        await createRoute(form).unwrap();
      }
      setModalOpen(false);
      refetch();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Routes</h3>
          <p className="text-sm text-gray-500">Create, edit and manage transport routes and stops.</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary gap-2" title="Add route"><span>➕</span><span>Add Route</span></button>
      </div>

      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2">Distance (km)</th>
              <th className="px-3 py-2">Est. Time (min)</th>
              <th className="px-3 py-2">Stops</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && (<tr><td colSpan={5} className="px-3 py-10 text-center text-gray-500">Loading routes...</td></tr>)}
            {isError && (<tr><td colSpan={5} className="px-3 py-10 text-center text-red-600">Failed to load</td></tr>)}
            {!isLoading && !isError && routes && routes.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-10 text-center text-gray-500">No routes found</td></tr>
            )}
            {routes?.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2 text-center">{r.distance}</td>
                <td className="px-3 py-2 text-center">{r.estimatedTime}</td>
                <td className="px-3 py-2 text-center">{r.stops?.length ?? 0}</td>
                <td className="px-3 py-2 text-right space-x-2">
                  <button onClick={() => openEdit(r)} className="btn btn-xs btn-outline btn-warning gap-1" title="Edit"><span>✏️</span><span>Edit</span></button>
                  <DeleteConfirm
                    label={`Delete route "${r.name}"?`}
                    busy={isDeleting}
                    onConfirm={async () => { try { await deleteRoute(r._id).unwrap(); refetch(); } catch(e){ console.error(e);} }}
                  >
                    <button className="btn btn-xs btn-outline btn-error gap-1" title="Delete"><span>🗑️</span><span>Delete</span></button>
                  </DeleteConfirm>
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
              <h3 className="font-semibold">{editing ? 'Edit Route' : 'Add Route'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <form onSubmit={submit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className="input input-bordered" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} required />
                <input className="input input-bordered" placeholder="Description" value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} />
                <input type="number" className="input input-bordered" placeholder="Distance (km)" value={form.distance} onChange={(e)=>setForm({...form, distance: Number(e.target.value)})} />
                <input type="number" className="input input-bordered" placeholder="Estimated Time (min)" value={form.estimatedTime} onChange={(e)=>setForm({...form, estimatedTime: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <div className="font-medium text-gray-800">Stops</div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <input className="input input-bordered" placeholder="Stop name" value={stop.name} onChange={(e)=>setStop({...stop, name: e.target.value})} />
                  <input className="input input-bordered" placeholder="Address" value={stop.address} onChange={(e)=>setStop({...stop, address: e.target.value})} />
                  <input type="time" className="input input-bordered" placeholder="Arrival" value={stop.arrivalTime} onChange={(e)=>setStop({...stop, arrivalTime: e.target.value})} />
                  <input type="time" className="input input-bordered" placeholder="Departure" value={stop.departureTime} onChange={(e)=>setStop({...stop, departureTime: e.target.value})} />
                  <div className="flex gap-2">
                    <input type="number" className="input input-bordered w-full" placeholder="#" value={stop.order} onChange={(e)=>setStop({...stop, order: Number(e.target.value)})} />
                    <button type="button" className="btn btn-outline" onClick={addStop}>Add</button>
                  </div>
                </div>
                <div className="overflow-x-auto border rounded">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-1 text-left">Name</th>
                        <th className="px-2 py-1">Order</th>
                        <th className="px-2 py-1">Arrival</th>
                        <th className="px-2 py-1">Departure</th>
                        <th className="px-2 py-1 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {form.stops.map((s, idx) => (
                        <tr key={idx}>
                          <td className="px-2 py-1">{s.name}</td>
                          <td className="px-2 py-1 text-center">{s.order}</td>
                          <td className="px-2 py-1 text-center">{s.arrivalTime}</td>
                          <td className="px-2 py-1 text-center">{s.departureTime}</td>
                          <td className="px-2 py-1 text-right">
                            <button type="button" className="btn btn-xs btn-error btn-outline" onClick={()=>removeStop(idx)}>Remove</button>
                          </td>
                        </tr>
                      ))}
                      {form.stops.length === 0 && (
                        <tr><td colSpan={5} className="px-3 py-3 text-center text-gray-500">No stops added</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn btn-ghost" onClick={()=>setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isCreating || isUpdating}>{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const BusesSection: React.FC = () => {
  const { data: routes } = useGetRoutesQuery({});
  const { data: buses, isLoading, isError, refetch } = useGetBusesQuery({});
  const [createBus, { isLoading: isCreating }] = useCreateBusMutation();
  const [updateBus, { isLoading: isUpdating }] = useUpdateBusMutation();
  const [deleteBus, { isLoading: isDeleting }] = useDeleteBusMutation();
  const [assignBusRoute, { isLoading: isAssigning }] = useAssignBusToRouteMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Bus | null>(null);
  const [assignModal, setAssignModal] = useState<{ open: boolean; bus: Bus | null; routeId?: string }>({ open: false, bus: null });
  const [form, setForm] = useState<CreateBusRequest>({ busNumber: '', capacity: 40, driverName: '', driverPhone: '', route: undefined });

  const openCreate = () => { setEditing(null); setForm({ busNumber: '', capacity: 40, driverName: '', driverPhone: '', route: undefined }); setModalOpen(true); };
  const openEdit = (b: Bus) => { setEditing(b); setForm({ busNumber: b.busNumber, capacity: b.capacity, driverName: b.driverName, driverPhone: b.driverPhone, route: typeof b.route === 'string' ? b.route : b.route?._id }); setModalOpen(true); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) await updateBus({ id: editing._id, data: form }).unwrap();
      else await createBus(form).unwrap();
      setModalOpen(false);
      refetch();
    } catch (e) { console.error(e); }
  };

  const doAssign = async () => {
    if (!assignModal.bus || !assignModal.routeId) return;
    try { await assignBusRoute({ busId: assignModal.bus._id, routeId: assignModal.routeId }).unwrap(); setAssignModal({ open: false, bus: null }); refetch(); } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Buses</h3>
          <p className="text-sm text-gray-500">Create, edit and assign buses to routes.</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary gap-2" title="Add bus"><span>➕</span><span>Add Bus</span></button>
      </div>

      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left">Bus No</th>
              <th className="px-3 py-2">Capacity</th>
              <th className="px-3 py-2">Driver</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Route</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && (<tr><td colSpan={6} className="px-3 py-10 text-center text-gray-500">Loading buses...</td></tr>)}
            {isError && (<tr><td colSpan={6} className="px-3 py-10 text-center text-red-600">Failed to load</td></tr>)}
            {!isLoading && !isError && buses && buses.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-10 text-center text-gray-500">No buses found</td></tr>
            )}
            {buses?.map((b) => (
              <tr key={b._id} className="hover:bg-gray-50">
                <td className="px-3 py-2">{b.busNumber}</td>
                <td className="px-3 py-2 text-center">{b.capacity}</td>
                <td className="px-3 py-2">{b.driverName}</td>
                <td className="px-3 py-2">{b.driverPhone}</td>
                <td className="px-3 py-2 text-center">{typeof b.route === 'string' ? routes?.find(r => r._id === b.route)?.name ?? '-' : b.route?.name ?? '-'}</td>
                <td className="px-3 py-2 text-right space-x-2">
                  <button onClick={() => openEdit(b)} className="btn btn-xs btn-outline btn-warning gap-1" title="Edit"><span>✏️</span><span>Edit</span></button>
                  <button onClick={() => setAssignModal({ open: true, bus: b, routeId: typeof b.route === 'string' ? b.route : b.route?._id })} className="btn btn-xs gap-1" title="Assign">↔ Assign</button>
                  <DeleteConfirm
                    label={`Delete bus "${b.busNumber}"?`}
                    busy={isDeleting}
                    onConfirm={async () => { try { await deleteBus(b._id).unwrap(); refetch(); } catch(e){ console.error(e);} }}
                  >
                    <button className="btn btn-xs btn-outline btn-error gap-1" title="Delete"><span>🗑️</span><span>Delete</span></button>
                  </DeleteConfirm>
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
              <h3 className="font-semibold">{editing ? 'Edit Bus' : 'Add Bus'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <form onSubmit={submit} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="input input-bordered" placeholder="Bus Number" value={form.busNumber} onChange={(e)=>setForm({...form, busNumber: e.target.value})} required />
              <input type="number" className="input input-bordered" placeholder="Capacity" value={form.capacity} onChange={(e)=>setForm({...form, capacity: Number(e.target.value)})} />
              <input className="input input-bordered" placeholder="Driver Name" value={form.driverName} onChange={(e)=>setForm({...form, driverName: e.target.value})} />
              <input className="input input-bordered" placeholder="Driver Phone" value={form.driverPhone} onChange={(e)=>setForm({...form, driverPhone: e.target.value})} />
              <select className="input input-bordered" value={form.route || ''} onChange={(e)=>setForm({...form, route: e.target.value || undefined})}>
                <option value="">No Route</option>
                {routes?.map((r)=> (<option key={r._id} value={r._id}>{r.name}</option>))}
              </select>
              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <button type="button" className="btn btn-ghost" onClick={()=>setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isCreating || isUpdating}>{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignModal.open && routes && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold">Assign Route</h3>
              <button onClick={() => setAssignModal({ open: false, bus: null })} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <select className="input input-bordered w-full" value={assignModal.routeId || ''} onChange={(e)=>setAssignModal({ ...assignModal, routeId: e.target.value })}>
                <option value="">Select a route</option>
                {routes.map((r)=> (<option key={r._id} value={r._id}>{r.name}</option>))}
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button className="btn btn-ghost" onClick={() => setAssignModal({ open: false, bus: null })}>Cancel</button>
                <button className="btn btn-primary" disabled={isAssigning} onClick={doAssign}>{isAssigning ? 'Assigning...' : 'Assign'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StudentTransportSection: React.FC = () => {
  const { data: routes } = useGetRoutesQuery({});
  const [filters, setFilters] = useState<{ studentId?: string; routeId?: string }>({});
  const { data: transports, isLoading, isError, refetch } = useGetStudentTransportQuery(filters);
  const [assignTransport, { isLoading: isAssigning }] = useAssignStudentTransportMutation();
  const [removeTransport, { isLoading: isRemoving }] = useRemoveStudentTransportMutation();

  const [assignModal, setAssignModal] = useState<{
    open: boolean;
    studentId: string;
    routeId: string;
    stopId: string;
    pickupTime: string;
    dropTime: string;
    monthlyFee: number;
  }>({ open: false, studentId: '', routeId: '', stopId: '', pickupTime: '', dropTime: '', monthlyFee: 0 });


  const openAssign = () => setAssignModal({ open: true, studentId: '', routeId: '', stopId: '', pickupTime: '', dropTime: '', monthlyFee: 0 });
  const doAssign = async () => {
    try {
      const payload = {
        studentId: assignModal.studentId,
        routeId: assignModal.routeId,
        stopId: assignModal.stopId,
        pickupTime: assignModal.pickupTime,
        dropTime: assignModal.dropTime,
        monthlyFee: assignModal.monthlyFee,
      };
      await assignTransport(payload).unwrap();
      setAssignModal({ open: false, studentId: '', routeId: '', stopId: '', pickupTime: '', dropTime: '', monthlyFee: 0 });
      refetch();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Student Transport</h3>
          <p className="text-sm text-gray-500">Assign students to routes and manage pickups.</p>
        </div>
        <button className="btn btn-primary gap-2" onClick={openAssign}><span>➕</span><span>Assign</span></button>
      </div>

      <div className="flex flex-wrap gap-2 items-center bg-gray-50/60 p-3 rounded-md border">
        <input className="input input-bordered" placeholder="Student ID" value={filters.studentId || ''} onChange={(e)=>setFilters({ ...filters, studentId: e.target.value || undefined })} />
        <select className="input input-bordered" value={filters.routeId || ''} onChange={(e)=>setFilters({ ...filters, routeId: e.target.value || undefined })}>
          <option value="">All Routes</option>
          {routes?.map((r)=> (<option key={r._id} value={r._id}>{r.name}</option>))}
        </select>
        <button className="btn btn-sm btn-outline gap-1" onClick={()=>refetch()}><span>🔎</span><span>Filter</span></button>
      </div>

      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left">Student</th>
              <th className="px-3 py-2">Route</th>
              <th className="px-3 py-2">Stop</th>
              <th className="px-3 py-2">Pickup</th>
              <th className="px-3 py-2">Drop</th>
              <th className="px-3 py-2">Fee</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && (<tr><td colSpan={7} className="px-3 py-10 text-center text-gray-500">Loading...</td></tr>)}
            {isError && (<tr><td colSpan={7} className="px-3 py-10 text-center text-red-600">Failed to load</td></tr>)}
            {!isLoading && !isError && transports && transports.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-10 text-center text-gray-500">No assignments</td></tr>
            )}
            {transports?.map((t) => (
              <tr key={t._id} className="hover:bg-gray-50">
                <td className="px-3 py-2">{t.student}</td>
                <td className="px-3 py-2 text-center">{typeof t.route === 'string' ? routes?.find(r=>r._id===t.route)?.name ?? '-' : t.route?.name ?? '-'}</td>
                <td className="px-3 py-2 text-center">{typeof t.stop === 'string' ? t.stop : t.stop?.name ?? '-'}</td>
                <td className="px-3 py-2 text-center">{t.pickupTime}</td>
                <td className="px-3 py-2 text-center">{t.dropTime}</td>
                <td className="px-3 py-2 text-center">{t.monthlyFee}</td>
                <td className="px-3 py-2 text-right space-x-2">
                  <DeleteConfirm
                    label={`Remove transport for student "${t.student}"?`}
                    busy={isRemoving}
                    onConfirm={async () => { try { await removeTransport(t._id).unwrap(); refetch(); } catch(e){ console.error(e);} }}
                  >
                    <button className="btn btn-xs btn-outline btn-error gap-1"><span>🗑️</span><span>Remove</span></button>
                  </DeleteConfirm>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {assignModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold">Assign Student Transport</h3>
              <button onClick={()=>setAssignModal({ open: false, studentId: '', routeId: '', stopId: '', pickupTime: '', dropTime: '', monthlyFee: 0 })} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <input className="input input-bordered w-full" placeholder="Student ID" value={assignModal.studentId} onChange={(e)=>setAssignModal({...assignModal, studentId: e.target.value})} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <select className="input input-bordered" value={assignModal.routeId} onChange={(e)=>setAssignModal({...assignModal, routeId: e.target.value, stopId: ''})}>
                  <option value="">Select Route</option>
                  {routes?.map((r)=> (<option key={r._id} value={r._id}>{r.name}</option>))}
                </select>
                <select className="input input-bordered" value={assignModal.stopId} onChange={(e)=>setAssignModal({...assignModal, stopId: e.target.value})} disabled={!assignModal.routeId}>
                  <option value="">Select Stop</option>
                  {routes?.find(r=>r._id===assignModal.routeId)?.stops?.map((s: Stop) => (
                    <option key={s._id || s.name} value={s._id || s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input type="time" className="input input-bordered" placeholder="Pickup" value={assignModal.pickupTime} onChange={(e)=>setAssignModal({...assignModal, pickupTime: e.target.value})} />
                <input type="time" className="input input-bordered" placeholder="Drop" value={assignModal.dropTime} onChange={(e)=>setAssignModal({...assignModal, dropTime: e.target.value})} />
                <input type="number" className="input input-bordered" placeholder="Monthly Fee" value={assignModal.monthlyFee} onChange={(e)=>setAssignModal({...assignModal, monthlyFee: Number(e.target.value)})} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="btn btn-ghost" onClick={()=>setAssignModal({ open: false, studentId: '', routeId: '', stopId: '', pickupTime: '', dropTime: '', monthlyFee: 0 })}>Cancel</button>
                <button className="btn btn-primary" disabled={isAssigning || !assignModal.studentId || !assignModal.routeId || !assignModal.stopId} onClick={doAssign}>{isAssigning ? 'Assigning...' : 'Assign'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface DeleteConfirmProps {
  label: string;
  busy?: boolean;
  onConfirm: () => void | Promise<void>;
  children: React.ReactNode;
}

const DeleteConfirm: React.FC<DeleteConfirmProps> = ({ label, busy, onConfirm, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold">Confirm Delete</h3>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-700">{label}</p>
              <div className="flex justify-end gap-2 pt-2">
                <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
                <button className="btn btn-error" disabled={busy} onClick={async () => { await onConfirm(); setOpen(false); }}>{busy ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransportManagement;
