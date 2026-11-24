# Serenity Boutique Hotel — Booking & Management Platform

A full-featured hotel website with:

- **Public site**: room listings, images, amenities, prices (INR + USD), reviews & ratings
- **Guest accounts**: sign up / sign in, book rooms, mock Razorpay payment, view bookings
- **Admin panel**: manage rooms (with full amenity checklist), bookings, check-in/out, staff tasks
- **Worker panel**: see rooms that need cleaning/prep after checkout, mark them ready & available again
- **Responsive**: optimized for both mobile (bottom nav) and desktop
- **Warm boutique design**: cream / terracotta palette + clean modern layout

Works **out of the box in demo mode** (no backend required). Connect Supabase for real auth + database.

---

## Quick Start (Demo Mode)

```bash
git clone <your-repo>
cd hotel-booking
npm install
npm run dev
```

Open http://localhost:5173

### Demo logins

| Role   | Email                     | Password   |
|--------|---------------------------|------------|
| Admin  | sgtraders542@gmail.com    | admin123   |
| Worker | worker@hotel.com          | worker123  |
| Guest  | guest@demo.com            | guest123   |

You can also sign up any new guest email.

Data (rooms, bookings, reviews) is stored in `localStorage` so it persists across refreshes.

---

## Connect Supabase (Production)

1. Create a project at [supabase.com](https://supabase.com)
2. In **SQL Editor**, run the entire file `supabase/schema.sql`
3. Enable **Email** auth in Authentication → Providers
4. Create users:
   - Sign up `sgtraders542@gmail.com` (or use the Auth UI)
   - Sign up `worker@hotel.com`
   - Then in SQL:
     ```sql
     update public.profiles set role = 'admin' where email = 'sgtraders542@gmail.com';
     update public.profiles set role = 'worker' where email = 'worker@hotel.com';
     ```
5. Copy Project URL + anon key into `.env`:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

6. Restart `npm run dev`

The app will automatically use Supabase when the env vars are present.

---

## Room Availability Flow

1. Guest books a room → room is marked **unavailable**
2. After mock payment → booking becomes **confirmed**
3. Admin can **check-in** / **check-out** the guest
4. On **check-out** → room is flagged `needs_cleaning = true` and a cleaning task is created
5. **Worker** (or Admin) opens Worker Panel → clicks **Mark Ready & Available**
6. Room becomes bookable again on the public site

This gives staff time to prepare the room between stays.

---

## Adding / Editing Rooms (Admin)

When adding a room the form asks for:

- Name, description, type (standard / deluxe / suite / presidential)
- Price in **INR** and **USD**
- Capacity, number of beds, bed type, size (sqft), floor
- Image URLs
- Amenities checklist: AC, TV, WiFi, Balcony, Minibar, Bathtub, Kitchenette, Workspace

---

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS (custom cream / terracotta theme)
- React Router 7
- Supabase JS (auth + optional DB)
- lucide-react icons
- date-fns

---

## Deploy to GitHub Pages / Vercel / Netlify

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

Add the two `VITE_SUPABASE_*` env vars in the Vercel dashboard.

### GitHub Pages

1. Set `base` in `vite.config.ts` to your repo name if needed
2. `npm run build`
3. Deploy the `dist` folder (or use GitHub Actions)

---

## Project Structure

```
src/
  components/   Navbar, Footer, RoomCard, StarRating
  context/      AuthContext, HotelContext
  lib/          supabase, utils, mockData
  pages/        Home, Rooms, RoomDetail, Login, Signup,
                Dashboard, Admin, Worker
  types/        TypeScript interfaces
supabase/
  schema.sql    Full DB schema + RLS policies
```

---

## Notes

- Payment is a **mock Razorpay** flow (simulates success after 1.5 s). Replace with real Razorpay integration when ready.
- Currency toggle (INR ↔ USD) is available in the header.
- Mobile gets a fixed bottom navigation; desktop uses a full top navbar + sticky booking sidebar.
