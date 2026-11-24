import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import type { Room, RoomAmenity } from '../types';
import {
  LayoutDashboard, BedDouble, CalendarCheck, Users, Plus, Pencil, Trash2,
  CheckCircle, X, Eye
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';

type Tab = 'overview' | 'rooms' | 'bookings' | 'staff';

const emptyAmenities: RoomAmenity = {
  ac: true, tv: true, wifi: true, balcony: false,
  minibar: false, bathtub: false, kitchenette: false, workspace: false,
};

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const {
    rooms, bookings, tasks, currency,
    addRoom, updateRoom, deleteRoom,
    updateBookingStatus, markRoomReady,
  } = useHotel();

  const [tab, setTab] = useState<Tab>('overview');
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Room form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'deluxe' as Room['type'],
    price_inr: 5000,
    price_usd: 60,
    capacity: 2,
    beds: 1,
    bed_type: 'King',
    size_sqft: 300,
    floor: 1,
    amenities: { ...emptyAmenities },
    images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80'],
    is_available: true,
    needs_cleaning: false,
  });

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  function openAddRoom() {
    setEditingRoom(null);
    setForm({
      name: '',
      description: '',
      type: 'deluxe',
      price_inr: 5000,
      price_usd: 60,
      capacity: 2,
      beds: 1,
      bed_type: 'King',
      size_sqft: 300,
      floor: 1,
      amenities: { ...emptyAmenities },
      images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80'],
      is_available: true,
      needs_cleaning: false,
    });
    setShowRoomForm(true);
  }

  function openEditRoom(room: Room) {
    setEditingRoom(room);
    setForm({
      name: room.name,
      description: room.description,
      type: room.type,
      price_inr: room.price_inr,
      price_usd: room.price_usd,
      capacity: room.capacity,
      beds: room.beds,
      bed_type: room.bed_type,
      size_sqft: room.size_sqft,
      floor: room.floor,
      amenities: { ...room.amenities },
      images: [...room.images],
      is_available: room.is_available,
      needs_cleaning: room.needs_cleaning,
    });
    setShowRoomForm(true);
  }

  async function handleSaveRoom(e: React.FormEvent) {
    e.preventDefault();
    if (editingRoom) {
      await updateRoom(editingRoom.id, form);
    } else {
      await addRoom(form);
    }
    setShowRoomForm(false);
  }

  const pendingCleaning = rooms.filter((r) => r.needs_cleaning);
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'checked_in');

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: LayoutDashboard },
    { id: 'rooms' as Tab, label: 'Rooms', icon: BedDouble },
    { id: 'bookings' as Tab, label: 'Bookings', icon: CalendarCheck },
    { id: 'staff' as Tab, label: 'Staff Tasks', icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Manage rooms, bookings & staff</p>
        </div>
        <button onClick={openAddRoom} className="btn-primary inline-flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" /> Add Room
        </button>
      </div>

      {/* Tabs - horizontal scroll on mobile, sidebar-like on desktop */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-6 border-b border-cream-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium whitespace-nowrap transition',
              tab === t.id
                ? 'bg-white border border-b-white border-cream-200 text-terracotta-600 -mb-px'
                : 'text-gray-500 hover:text-gray-800'
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Rooms', value: rooms.length, color: 'bg-blue-50 text-blue-700' },
            { label: 'Available', value: rooms.filter((r) => r.is_available).length, color: 'bg-green-50 text-green-700' },
            { label: 'Need Cleaning', value: pendingCleaning.length, color: 'bg-amber-50 text-amber-700' },
            { label: 'Active Bookings', value: confirmedBookings.length, color: 'bg-purple-50 text-purple-700' },
          ].map((s) => (
            <div key={s.label} className={cn('card p-5', s.color)}>
              <p className="text-2xl font-semibold">{s.value}</p>
              <p className="text-sm opacity-80 mt-1">{s.label}</p>
            </div>
          ))}

          {pendingCleaning.length > 0 && (
            <div className="col-span-2 lg:col-span-4 card p-5">
              <h3 className="font-medium mb-3">Rooms awaiting staff confirmation</h3>
              <div className="space-y-2">
                {pendingCleaning.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <span className="font-medium">{r.name}</span>
                    <button
                      onClick={() => markRoomReady(r.id)}
                      className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark Ready
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rooms tab */}
      {tab === 'rooms' && (
        <div className="space-y-3">
          {rooms.map((room) => (
            <div key={room.id} className="card p-4 flex flex-col sm:flex-row gap-4 items-start">
              <img src={room.images[0]} alt="" className="w-full sm:w-24 h-20 object-cover rounded-lg" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{room.name}</h3>
                  <span className="badge bg-cream-100 text-gray-600 capitalize">{room.type}</span>
                  {!room.is_available && (
                    <span className="badge bg-red-100 text-red-700">
                      {room.needs_cleaning ? 'Needs cleaning' : 'Unavailable'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {formatCurrency(currency === 'INR' ? room.price_inr : room.price_usd, currency)}/night · {room.capacity} guests · {room.beds} bed(s)
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditRoom(room)} className="p-2 rounded-lg hover:bg-cream-100 text-gray-600">
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this room?')) deleteRoom(room.id);
                  }}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bookings tab */}
      {tab === 'bookings' && (
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No bookings yet</p>
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{b.room?.name || b.room_id}</p>
                    <p className="text-sm text-gray-500">
                      {b.guest?.full_name || b.guest_id} · {formatDate(b.check_in)} → {formatDate(b.check_out)}
                    </p>
                    <p className="text-sm mt-1">
                      {formatCurrency(b.currency === 'INR' ? b.total_inr : b.total_usd, b.currency)} ·{' '}
                      <span className="capitalize">{b.payment_status}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={cn(
                      'badge capitalize',
                      b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      b.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      b.status === 'checked_out' ? 'bg-gray-100 text-gray-700' :
                      'bg-blue-100 text-blue-700'
                    )}>
                      {b.status.replace('_', ' ')}
                    </span>
                    <div className="flex gap-1">
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => updateBookingStatus(b.id, 'checked_in')}
                          className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          Check-in
                        </button>
                      )}
                      {b.status === 'checked_in' && (
                        <button
                          onClick={() => updateBookingStatus(b.id, 'checked_out')}
                          className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          Check-out
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Staff tasks */}
      {tab === 'staff' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-2">
            Tasks are created automatically on check-out. Workers can complete them from the Worker Panel.
          </p>
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No tasks yet</p>
          ) : (
            tasks.map((t) => {
              const room = rooms.find((r) => r.id === t.room_id);
              return (
                <div key={t.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium capitalize">{t.type} — {room?.name || t.room_id}</p>
                    <p className="text-sm text-gray-500">{t.notes}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(t.created_at)}</p>
                  </div>
                  <span className={cn(
                    'badge capitalize',
                    t.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  )}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Room form modal */}
      {showRoomForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-cream-100 px-5 py-4 flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h2>
              <button onClick={() => setShowRoomForm(false)} className="p-2 hover:bg-cream-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Room Name *</label>
                  <input className="input-field mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Description *</label>
                  <textarea className="input-field mt-1" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select className="input-field mt-1" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Room['type'] })}>
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="suite">Suite</option>
                    <option value="presidential">Presidential</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Bed Type</label>
                  <input className="input-field mt-1" value={form.bed_type} onChange={(e) => setForm({ ...form, bed_type: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Price (INR) *</label>
                  <input type="number" className="input-field mt-1" value={form.price_inr} onChange={(e) => setForm({ ...form, price_inr: Number(e.target.value) })} required min={0} />
                </div>
                <div>
                  <label className="text-sm font-medium">Price (USD) *</label>
                  <input type="number" className="input-field mt-1" value={form.price_usd} onChange={(e) => setForm({ ...form, price_usd: Number(e.target.value) })} required min={0} />
                </div>
                <div>
                  <label className="text-sm font-medium">Capacity (guests)</label>
                  <input type="number" className="input-field mt-1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} min={1} />
                </div>
                <div>
                  <label className="text-sm font-medium">Number of Beds</label>
                  <input type="number" className="input-field mt-1" value={form.beds} onChange={(e) => setForm({ ...form, beds: Number(e.target.value) })} min={1} />
                </div>
                <div>
                  <label className="text-sm font-medium">Size (sqft)</label>
                  <input type="number" className="input-field mt-1" value={form.size_sqft} onChange={(e) => setForm({ ...form, size_sqft: Number(e.target.value) })} min={50} />
                </div>
                <div>
                  <label className="text-sm font-medium">Floor</label>
                  <input type="number" className="input-field mt-1" value={form.floor} onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })} min={0} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Image URLs (one per line)</label>
                  <textarea
                    className="input-field mt-1"
                    rows={2}
                    value={form.images.join('\n')}
                    onChange={(e) => setForm({ ...form, images: e.target.value.split('\n').filter(Boolean) })}
                  />
                </div>
              </div>

              {/* Amenities checklist */}
              <div>
                <label className="text-sm font-medium mb-2 block">Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.keys(emptyAmenities) as (keyof RoomAmenity)[]).map((key) => (
                    <label key={key} className="flex items-center gap-2 p-2 rounded-lg border border-cream-200 cursor-pointer hover:bg-cream-50">
                      <input
                        type="checkbox"
                        checked={form.amenities[key]}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            amenities: { ...form.amenities, [key]: e.target.checked },
                          })
                        }
                        className="rounded text-terracotta-600"
                      />
                      <span className="text-sm capitalize">{key === 'ac' ? 'AC' : key === 'tv' ? 'TV' : key === 'wifi' ? 'WiFi' : key}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowRoomForm(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingRoom ? 'Save Changes' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
