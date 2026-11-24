import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEMO_ROOMS, DEMO_REVIEWS } from '../lib/mockData';
import type { Room, Booking, Review, StaffTask, RoomAmenity } from '../types';
import { useAuth } from './AuthContext';
import { nightsBetween } from '../lib/utils';

interface HotelContextType {
  rooms: Room[];
  bookings: Booking[];
  reviews: Review[];
  tasks: StaffTask[];
  loading: boolean;
  currency: 'INR' | 'USD';
  setCurrency: (c: 'INR' | 'USD') => void;
  refreshRooms: () => Promise<void>;
  getRoom: (id: string) => Room | undefined;
  createBooking: (data: {
    room_id: string;
    check_in: string;
    check_out: string;
    guests_count: number;
    currency: 'INR' | 'USD';
    special_requests?: string;
  }) => Promise<{ booking?: Booking; error?: string }>;
  confirmPayment: (bookingId: string) => Promise<{ error?: string }>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;
  markRoomReady: (roomId: string) => Promise<void>;
  addRoom: (room: Omit<Room, 'id' | 'created_at' | 'updated_at' | 'rating_avg' | 'review_count'>) => Promise<{ error?: string }>;
  updateRoom: (id: string, updates: Partial<Room>) => Promise<{ error?: string }>;
  deleteRoom: (id: string) => Promise<{ error?: string }>;
  addReview: (data: { room_id: string; rating: number; title: string; comment: string }) => Promise<{ error?: string }>;
  getRoomReviews: (roomId: string) => Review[];
  createTask: (task: Omit<StaffTask, 'id' | 'created_at'>) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export function HotelProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>(DEMO_ROOMS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>(DEMO_REVIEWS);
  const [tasks, setTasks] = useState<StaffTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  useEffect(() => {
    // Load from localStorage for demo persistence
    const savedRooms = localStorage.getItem('hotel_rooms');
    const savedBookings = localStorage.getItem('hotel_bookings');
    const savedReviews = localStorage.getItem('hotel_reviews');
    const savedTasks = localStorage.getItem('hotel_tasks');
    if (savedRooms) setRooms(JSON.parse(savedRooms));
    if (savedBookings) setBookings(JSON.parse(savedBookings));
    if (savedReviews) setReviews(JSON.parse(savedReviews));
    if (savedTasks) setTasks(JSON.parse(savedTasks));

    if (isSupabaseConfigured) {
      refreshRooms();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hotel_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('hotel_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('hotel_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('hotel_tasks', JSON.stringify(tasks));
  }, [tasks]);

  async function refreshRooms() {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    const { data } = await supabase.from('rooms').select('*').order('price_inr');
    if (data) setRooms(data as Room[]);
    setLoading(false);
  }

  function getRoom(id: string) {
    return rooms.find((r) => r.id === id);
  }

  async function createBooking(data: {
    room_id: string;
    check_in: string;
    check_out: string;
    guests_count: number;
    currency: 'INR' | 'USD';
    special_requests?: string;
  }) {
    if (!user) return { error: 'Please sign in to book' };

    const room = getRoom(data.room_id);
    if (!room) return { error: 'Room not found' };
    if (!room.is_available || room.needs_cleaning) return { error: 'Room is currently not available' };

    const nights = nightsBetween(data.check_in, data.check_out);
    const total_inr = room.price_inr * nights;
    const total_usd = room.price_usd * nights;

    const booking: Booking = {
      id: `bk-${Date.now()}`,
      room_id: data.room_id,
      guest_id: user.id,
      check_in: data.check_in,
      check_out: data.check_out,
      guests_count: data.guests_count,
      total_inr,
      total_usd,
      currency: data.currency,
      status: 'pending',
      payment_status: 'pending',
      special_requests: data.special_requests,
      created_at: new Date().toISOString(),
      room,
      guest: user,
    };

    if (isSupabaseConfigured) {
      const { data: inserted, error } = await supabase.from('bookings').insert(booking).select().single();
      if (error) return { error: error.message };
      setBookings((prev) => [...prev, inserted as Booking]);
      return { booking: inserted as Booking };
    }

    setBookings((prev) => [...prev, booking]);
    // Temporarily mark room unavailable until payment + staff confirm
    setRooms((prev) =>
      prev.map((r) => (r.id === data.room_id ? { ...r, is_available: false } : r))
    );
    return { booking };
  }

  async function confirmPayment(bookingId: string) {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return { error: 'Booking not found' };

    // Mock Razorpay success
    const updated: Booking = {
      ...booking,
      payment_status: 'paid',
      status: 'confirmed',
      payment_id: `pay_mock_${Date.now()}`,
    };

    setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));

    // After checkout later, room will need cleaning confirmation
    // For now just keep unavailable until staff marks ready after checkout

    if (isSupabaseConfigured) {
      await supabase.from('bookings').update({
        payment_status: 'paid',
        status: 'confirmed',
        payment_id: updated.payment_id,
      }).eq('id', bookingId);
    }
    return {};
  }

  async function updateBookingStatus(id: string, status: Booking['status']) {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));

    if (status === 'checked_out') {
      const booking = bookings.find((b) => b.id === id);
      if (booking) {
        setRooms((prev) =>
          prev.map((r) =>
            r.id === booking.room_id ? { ...r, is_available: false, needs_cleaning: true } : r
          )
        );
        // Create cleaning task
        const task: StaffTask = {
          id: `task-${Date.now()}`,
          room_id: booking.room_id,
          type: 'cleaning',
          status: 'pending',
          notes: 'Guest checked out – prepare room for next booking',
          created_at: new Date().toISOString(),
        };
        setTasks((prev) => [...prev, task]);
      }
    }

    if (isSupabaseConfigured) {
      await supabase.from('bookings').update({ status }).eq('id', id);
    }
  }

  async function markRoomReady(roomId: string) {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId ? { ...r, is_available: true, needs_cleaning: false } : r
      )
    );
    // Complete related tasks
    setTasks((prev) =>
      prev.map((t) =>
        t.room_id === roomId && t.status !== 'completed'
          ? { ...t, status: 'completed', completed_at: new Date().toISOString() }
          : t
      )
    );

    if (isSupabaseConfigured) {
      await supabase.from('rooms').update({ is_available: true, needs_cleaning: false }).eq('id', roomId);
    }
  }

  async function addRoom(roomData: Omit<Room, 'id' | 'created_at' | 'updated_at' | 'rating_avg' | 'review_count'>) {
    const newRoom: Room = {
      ...roomData,
      id: `room-${Date.now()}`,
      rating_avg: 0,
      review_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setRooms((prev) => [...prev, newRoom]);

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('rooms').insert(newRoom);
      if (error) return { error: error.message };
    }
    return {};
  }

  async function updateRoom(id: string, updates: Partial<Room>) {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates, updated_at: new Date().toISOString() } : r))
    );
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('rooms').update(updates).eq('id', id);
      if (error) return { error: error.message };
    }
    return {};
  }

  async function deleteRoom(id: string) {
    setRooms((prev) => prev.filter((r) => r.id !== id));
    if (isSupabaseConfigured) {
      await supabase.from('rooms').delete().eq('id', id);
    }
    return {};
  }

  async function addReview(data: { room_id: string; rating: number; title: string; comment: string }) {
    if (!user) return { error: 'Sign in required' };

    const review: Review = {
      id: `rev-${Date.now()}`,
      room_id: data.room_id,
      guest_id: user.id,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      created_at: new Date().toISOString(),
      guest: user,
    };

    setReviews((prev) => [review, ...prev]);

    // Update room rating
    const roomReviews = [...reviews.filter((r) => r.room_id === data.room_id), review];
    const avg = roomReviews.reduce((s, r) => s + r.rating, 0) / roomReviews.length;
    setRooms((prev) =>
      prev.map((r) =>
        r.id === data.room_id
          ? { ...r, rating_avg: Math.round(avg * 10) / 10, review_count: roomReviews.length }
          : r
      )
    );

    if (isSupabaseConfigured) {
      await supabase.from('reviews').insert(review);
    }
    return {};
  }

  function getRoomReviews(roomId: string) {
    return reviews.filter((r) => r.room_id === roomId);
  }

  async function createTask(taskData: Omit<StaffTask, 'id' | 'created_at'>) {
    const task: StaffTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, task]);
  }

  async function completeTask(taskId: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: 'completed', completed_at: new Date().toISOString() } : t
      )
    );
  }

  return (
    <HotelContext.Provider
      value={{
        rooms,
        bookings,
        reviews,
        tasks,
        loading,
        currency,
        setCurrency,
        refreshRooms,
        getRoom,
        createBooking,
        confirmPayment,
        updateBookingStatus,
        markRoomReady,
        addRoom,
        updateRoom,
        deleteRoom,
        addReview,
        getRoomReviews,
        createTask,
        completeTask,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel() {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error('useHotel must be used within HotelProvider');
  return ctx;
}
