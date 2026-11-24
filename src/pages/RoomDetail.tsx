import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import {
  Users, BedDouble, Maximize, Wifi, Wind, Tv, DoorOpen,
  Bath, Refrigerator, Coffee, Monitor, ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import { formatCurrency, nightsBetween, cn } from '../lib/utils';
import { format } from 'date-fns';

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const { getRoom, getRoomReviews, currency, createBooking, confirmPayment, addReview } = useHotel();
  const { user } = useAuth();
  const navigate = useNavigate();
  const room = getRoom(id || '');
  const reviews = getRoomReviews(id || '');

  const [imgIdx, setImgIdx] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [requests, setRequests] = useState('');
  const [bookingStep, setBookingStep] = useState<'form' | 'payment' | 'success'>('form');
  const [currentBookingId, setCurrentBookingId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Review form
  const [showReview, setShowReview] = useState(false);
  const [revRating, setRevRating] = useState(5);
  const [revTitle, setRevTitle] = useState('');
  const [revComment, setRevComment] = useState('');

  if (!room) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-xl text-gray-500">Room not found</p>
        <Link to="/rooms" className="btn-primary mt-4 inline-block">Back to rooms</Link>
      </div>
    );
  }

  const price = currency === 'INR' ? room.price_inr : room.price_usd;
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const total = price * nights;

  const amenityList = [
    { key: 'wifi', label: 'Free WiFi', icon: Wifi, on: room.amenities.wifi },
    { key: 'ac', label: 'Air Conditioning', icon: Wind, on: room.amenities.ac },
    { key: 'tv', label: 'Smart TV', icon: Tv, on: room.amenities.tv },
    { key: 'balcony', label: 'Private Balcony', icon: DoorOpen, on: room.amenities.balcony },
    { key: 'bathtub', label: 'Bathtub', icon: Bath, on: room.amenities.bathtub },
    { key: 'minibar', label: 'Minibar', icon: Refrigerator, on: room.amenities.minibar },
    { key: 'kitchenette', label: 'Kitchenette', icon: Coffee, on: room.amenities.kitchenette },
    { key: 'workspace', label: 'Workspace', icon: Monitor, on: room.amenities.workspace },
  ];

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!user) {
      navigate('/login', { state: { from: `/rooms/${id}` } });
      return;
    }
    if (!checkIn || !checkOut) {
      setError('Please select check-in and check-out dates');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setError('Check-out must be after check-in');
      return;
    }
    setLoading(true);
    const res = await createBooking({
      room_id: room!.id,
      check_in: checkIn,
      check_out: checkOut,
      guests_count: guests,
      currency,
      special_requests: requests || undefined,
    });
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.booking) {
      setCurrentBookingId(res.booking.id);
      setBookingStep('payment');
    }
  }

  async function handleMockPayment() {
    setLoading(true);
    // Simulate Razorpay delay
    await new Promise((r) => setTimeout(r, 1500));
    const res = await confirmPayment(currentBookingId);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setBookingStep('success');
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    const res = await addReview({
      room_id: room!.id,
      rating: revRating,
      title: revTitle,
      comment: revComment,
    });
    if (!res.error) {
      setShowReview(false);
      setRevTitle('');
      setRevComment('');
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
      {/* Image gallery */}
      <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 lg:h-96 mb-6">
        <img
          src={room.images[imgIdx]}
          alt={room.name}
          className="w-full h-full object-cover"
        />
        {room.images.length > 1 && (
          <>
            <button
              onClick={() => setImgIdx((i) => (i === 0 ? room.images.length - 1 : i - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setImgIdx((i) => (i === room.images.length - 1 ? 0 : i + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {room.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={cn('w-2 h-2 rounded-full', i === imgIdx ? 'bg-white' : 'bg-white/50')}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="badge bg-terracotta-100 text-terracotta-700 capitalize">{room.type}</span>
              {room.rating_avg > 0 && (
                <div className="flex items-center gap-1.5">
                  <StarRating rating={room.rating_avg} size="sm" />
                  <span className="text-sm text-gray-600">
                    {room.rating_avg} ({room.review_count} reviews)
                  </span>
                </div>
              )}
            </div>
            <h1 className="font-serif text-3xl lg:text-4xl font-semibold text-gray-900">{room.name}</h1>
            <p className="mt-3 text-gray-600 leading-relaxed">{room.description}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-terracotta-500" /> {room.capacity} guests</span>
            <span className="flex items-center gap-1.5"><BedDouble className="w-4 h-4 text-terracotta-500" /> {room.beds} · {room.bed_type}</span>
            <span className="flex items-center gap-1.5"><Maximize className="w-4 h-4 text-terracotta-500" /> {room.size_sqft} sqft</span>
            <span>Floor {room.floor}</span>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="font-serif text-xl font-semibold mb-4">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {amenityList.map((a) => (
                <div
                  key={a.key}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border',
                    a.on ? 'border-cream-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-50'
                  )}
                >
                  <a.icon className={cn('w-5 h-5', a.on ? 'text-terracotta-600' : 'text-gray-400')} />
                  <span className="text-sm">{a.label}</span>
                  {a.on && <Check className="w-4 h-4 text-green-500 ml-auto" />}
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-semibold">Guest Reviews</h2>
              {user && user.role === 'guest' && (
                <button onClick={() => setShowReview(!showReview)} className="text-sm text-terracotta-600 hover:underline">
                  Write a review
                </button>
              )}
            </div>

            {showReview && (
              <form onSubmit={submitReview} className="mb-6 p-4 bg-cream-50 rounded-xl space-y-3">
                <StarRating rating={revRating} interactive onChange={setRevRating} size="lg" />
                <input
                  className="input-field"
                  placeholder="Review title"
                  value={revTitle}
                  onChange={(e) => setRevTitle(e.target.value)}
                  required
                />
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Share your experience..."
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  required
                />
                <button type="submit" className="btn-primary text-sm">Submit Review</button>
              </form>
            )}

            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 bg-white rounded-xl border border-cream-100">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{r.guest?.full_name || 'Guest'}</p>
                        <StarRating rating={r.rating} size="sm" />
                      </div>
                      <span className="text-xs text-gray-400">
                        {format(new Date(r.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 text-sm">{r.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking sidebar - sticky on desktop */}
        <div className="lg:col-span-1">
          <div className="card p-5 lg:sticky lg:top-24">
            {bookingStep === 'form' && (
              <>
                <div className="mb-4">
                  <span className="text-2xl font-semibold">{formatCurrency(price, currency)}</span>
                  <span className="text-gray-500 text-sm"> / night</span>
                </div>

                {!room.is_available || room.needs_cleaning ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                    {room.needs_cleaning
                      ? 'This room is being prepared by our staff and will be available soon.'
                      : 'This room is currently booked.'}
                  </div>
                ) : (
                  <form onSubmit={handleBook} className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Check-in</label>
                      <input
                        type="date"
                        className="input-field mt-1"
                        value={checkIn}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setCheckIn(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Check-out</label>
                      <input
                        type="date"
                        className="input-field mt-1"
                        value={checkOut}
                        min={checkIn || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setCheckOut(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Guests</label>
                      <select
                        className="input-field mt-1"
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                      >
                        {Array.from({ length: room.capacity }, (_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1} guest{i > 0 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Special requests</label>
                      <textarea
                        className="input-field mt-1"
                        rows={2}
                        value={requests}
                        onChange={(e) => setRequests(e.target.value)}
                        placeholder="Optional..."
                      />
                    </div>

                    {nights > 0 && (
                      <div className="pt-2 border-t border-cream-100 text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>{formatCurrency(price, currency)} × {nights} night{nights > 1 ? 's' : ''}</span>
                          <span>{formatCurrency(total, currency)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-base pt-1">
                          <span>Total</span>
                          <span>{formatCurrency(total, currency)}</span>
                        </div>
                      </div>
                    )}

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button type="submit" disabled={loading} className="btn-primary w-full">
                      {loading ? 'Processing...' : user ? 'Reserve Room' : 'Sign in to Book'}
                    </button>
                  </form>
                )}
              </>
            )}

            {bookingStep === 'payment' && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-semibold">Complete Payment</h3>
                <p className="text-sm text-gray-600">
                  Mock Razorpay checkout. In production this would open the Razorpay modal.
                </p>
                <div className="p-4 bg-cream-50 rounded-lg text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Amount</span>
                    <span className="font-semibold">{formatCurrency(total, currency)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Gateway</span>
                    <span>Razorpay (Mock)</span>
                  </div>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  onClick={handleMockPayment}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Processing payment...' : `Pay ${formatCurrency(total, currency)}`}
                </button>
                <button
                  onClick={() => setBookingStep('form')}
                  className="btn-secondary w-full text-sm"
                >
                  Back
                </button>
              </div>
            )}

            {bookingStep === 'success' && (
              <div className="text-center space-y-3 py-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-green-800">Booking Confirmed!</h3>
                <p className="text-sm text-gray-600">
                  Your room is reserved. Our team will prepare everything for your arrival.
                </p>
                <Link to="/dashboard" className="btn-primary inline-block mt-2">
                  View My Bookings
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
