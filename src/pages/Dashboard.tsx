import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import { Link, Navigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../lib/utils';
import { Calendar, MapPin } from 'lucide-react';

export default function Dashboard() {
  const { user, isAdmin, isWorker } = useAuth();
  const { bookings, currency } = useHotel();

  if (!user) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  if (isWorker) return <Navigate to="/worker" replace />;

  const myBookings = bookings.filter((b) => b.guest_id === user.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:py-12 pb-24">
      <h1 className="section-title mb-2">My Bookings</h1>
      <p className="text-gray-500 mb-8">Welcome back, {user.full_name}</p>

      {myBookings.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
          <Link to="/rooms" className="btn-primary inline-block">Browse Rooms</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myBookings.map((b) => (
            <div key={b.id} className="card p-5 flex flex-col sm:flex-row gap-4">
              {b.room?.images?.[0] && (
                <img
                  src={b.room.images[0]}
                  alt={b.room.name}
                  className="w-full sm:w-32 h-28 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif text-lg font-semibold">
                      {b.room?.name || 'Room'}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">{b.room?.type}</p>
                  </div>
                  <span
                    className={`badge ${
                      b.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : b.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : b.status === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {b.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(b.check_in)} → {formatDate(b.check_out)}
                  </span>
                  <span>
                    {formatCurrency(
                      b.currency === 'INR' ? b.total_inr : b.total_usd,
                      b.currency
                    )}
                  </span>
                </div>
                {b.payment_status === 'paid' && (
                  <p className="text-xs text-green-600 mt-1">Payment received · {b.payment_id}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
