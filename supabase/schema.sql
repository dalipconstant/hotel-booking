-- Serenity Boutique Hotel - Supabase Schema
-- Run this in the Supabase SQL Editor

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null,
  role text not null default 'guest' check (role in ('guest', 'worker', 'admin')),
  phone text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'guest')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Rooms
create table if not exists public.rooms (
  id text primary key,
  name text not null,
  description text not null,
  type text not null check (type in ('standard', 'deluxe', 'suite', 'presidential')),
  price_inr numeric not null,
  price_usd numeric not null,
  capacity int not null default 2,
  beds int not null default 1,
  bed_type text not null default 'King',
  size_sqft int not null default 250,
  floor int not null default 1,
  amenities jsonb not null default '{}',
  images text[] not null default '{}',
  is_available boolean not null default true,
  needs_cleaning boolean not null default false,
  rating_avg numeric not null default 0,
  review_count int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Bookings
create table if not exists public.bookings (
  id text primary key,
  room_id text references public.rooms(id) on delete set null,
  guest_id uuid references public.profiles(id) on delete set null,
  check_in date not null,
  check_out date not null,
  guests_count int not null default 1,
  total_inr numeric not null,
  total_usd numeric not null,
  currency text not null default 'INR' check (currency in ('INR', 'USD')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'awaiting_cleaning')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  payment_id text,
  special_requests text,
  created_at timestamptz default now()
);

-- Reviews
create table if not exists public.reviews (
  id text primary key,
  room_id text references public.rooms(id) on delete cascade,
  guest_id uuid references public.profiles(id) on delete set null,
  booking_id text references public.bookings(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  title text not null,
  comment text not null,
  created_at timestamptz default now()
);

-- Staff tasks
create table if not exists public.staff_tasks (
  id text primary key,
  room_id text references public.rooms(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('cleaning', 'maintenance', 'restock', 'inspection')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  notes text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- RLS
alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.staff_tasks enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Rooms: public read, admin write
create policy "Rooms are viewable by everyone"
  on public.rooms for select using (true);

create policy "Admins can manage rooms"
  on public.rooms for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Bookings
create policy "Guests can view own bookings"
  on public.bookings for select using (
    guest_id = auth.uid() or
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'worker'))
  );

create policy "Guests can create bookings"
  on public.bookings for insert with check (guest_id = auth.uid());

create policy "Staff can update bookings"
  on public.bookings for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'worker'))
  );

-- Reviews
create policy "Reviews are public"
  on public.reviews for select using (true);

create policy "Guests can add reviews"
  on public.reviews for insert with check (guest_id = auth.uid());

-- Staff tasks
create policy "Staff can view tasks"
  on public.staff_tasks for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'worker'))
  );

create policy "Staff can update tasks"
  on public.staff_tasks for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'worker'))
  );

-- Seed admin (run after creating the auth user for sgtraders542@gmail.com)
-- update public.profiles set role = 'admin' where email = 'sgtraders542@gmail.com';

-- Seed worker
-- update public.profiles set role = 'worker' where email = 'worker@hotel.com';
