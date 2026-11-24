export type UserRole = 'guest' | 'worker' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export interface RoomAmenity {
  ac: boolean;
  tv: boolean;
  wifi: boolean;
  balcony: boolean;
  minibar: boolean;
  bathtub: boolean;
  kitchenette: boolean;
  workspace: boolean;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  type: 'standard' | 'deluxe' | 'suite' | 'presidential';
  price_inr: number;
  price_usd: number;
  capacity: number;
  beds: number;
  bed_type: string;
  size_sqft: number;
  floor: number;
  amenities: RoomAmenity;
  images: string[];
  is_available: boolean;
  needs_cleaning: boolean; // after checkout, staff must confirm ready
  rating_avg: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  room_id: string;
  guest_id: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_inr: number;
  total_usd: number;
  currency: 'INR' | 'USD';
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'awaiting_cleaning';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_id?: string;
  special_requests?: string;
  created_at: string;
  room?: Room;
  guest?: Profile;
}

export interface Review {
  id: string;
  room_id: string;
  guest_id: string;
  booking_id?: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  guest?: Profile;
  room?: Room;
}

export interface StaffTask {
  id: string;
  room_id: string;
  assigned_to?: string;
  type: 'cleaning' | 'maintenance' | 'restock' | 'inspection';
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
  created_at: string;
  completed_at?: string;
  room?: Room;
}
