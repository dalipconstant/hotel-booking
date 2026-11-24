import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import { Menu, X, User, LogOut, LayoutDashboard, Home, BedDouble, Star, Currency } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const { user, signOut, isAdmin, isWorker } = useAuth();
  const { currency, setCurrency } = useHotel();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/rooms', label: 'Rooms', icon: BedDouble },
  ];

  return (
    <>
      {/* Desktop & Mobile Top Nav */}
      <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-terracotta-600 flex items-center justify-center">
                <span className="text-white font-serif font-bold text-lg">S</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-serif text-xl font-semibold text-gray-900">Serenity</span>
                <span className="text-xs block text-terracotta-600 -mt-1 tracking-wider">BOUTIQUE HOTEL</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isActive(l.to) ? 'text-terracotta-600' : 'text-gray-600 hover:text-terracotta-600'
                  )}
                >
                  {l.label}
                </Link>
              ))}
              {user && (
                <Link
                  to={isAdmin ? '/admin' : isWorker ? '/worker' : '/dashboard'}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    location.pathname.startsWith('/admin') || location.pathname.startsWith('/worker') || location.pathname === '/dashboard'
                      ? 'text-terracotta-600'
                      : 'text-gray-600 hover:text-terracotta-600'
                  )}
                >
                  {isAdmin ? 'Admin Panel' : isWorker ? 'Worker Panel' : 'My Bookings'}
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-3">
              {/* Currency toggle */}
              <button
                onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
                className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full bg-cream-100 text-gray-600 hover:bg-cream-200 transition"
              >
                <Currency className="w-3.5 h-3.5" />
                {currency}
              </button>

              {user ? (
                <div className="hidden lg:flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={() => signOut().then(() => navigate('/'))}
                    className="p-2 rounded-full hover:bg-cream-100 text-gray-600"
                    title="Sign out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link to="/login" className="btn-secondary text-sm py-2 px-4">
                    Sign In
                  </Link>
                  <Link to="/signup" className="btn-primary text-sm py-2 px-4">
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-cream-100"
                onClick={() => setOpen(!open)}
              >
                {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="lg:hidden border-t border-cream-200 bg-white">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-cream-50"
                >
                  <l.icon className="w-5 h-5 text-terracotta-500" />
                  {l.label}
                </Link>
              ))}
              {user && (
                <Link
                  to={isAdmin ? '/admin' : isWorker ? '/worker' : '/dashboard'}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-cream-50"
                >
                  <LayoutDashboard className="w-5 h-5 text-terracotta-500" />
                  {isAdmin ? 'Admin Panel' : isWorker ? 'Worker Panel' : 'My Bookings'}
                </Link>
              )}
              <div className="pt-3 border-t border-cream-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
                  className="text-sm font-medium text-gray-600"
                >
                  Currency: {currency}
                </button>
                {user ? (
                  <button
                    onClick={() => {
                      signOut();
                      setOpen(false);
                      navigate('/');
                    }}
                    className="flex items-center gap-2 text-sm text-red-600"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary text-sm py-1.5 px-3">
                      Sign In
                    </Link>
                    <Link to="/signup" onClick={() => setOpen(false)} className="btn-primary text-sm py-1.5 px-3">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile bottom navigation */}
      <nav className="mobile-nav">
        <div className="flex items-center justify-around h-16">
          <Link to="/" className={cn('flex flex-col items-center gap-0.5 text-xs', isActive('/') ? 'text-terracotta-600' : 'text-gray-500')}>
            <Home className="w-5 h-5" />
            Home
          </Link>
          <Link to="/rooms" className={cn('flex flex-col items-center gap-0.5 text-xs', isActive('/rooms') ? 'text-terracotta-600' : 'text-gray-500')}>
            <BedDouble className="w-5 h-5" />
            Rooms
          </Link>
          {user ? (
            <Link
              to={isAdmin ? '/admin' : isWorker ? '/worker' : '/dashboard'}
              className={cn(
                'flex flex-col items-center gap-0.5 text-xs',
                location.pathname.startsWith('/admin') || location.pathname.startsWith('/worker') || isActive('/dashboard')
                  ? 'text-terracotta-600'
                  : 'text-gray-500'
              )}
            >
              <LayoutDashboard className="w-5 h-5" />
              Panel
            </Link>
          ) : (
            <Link to="/login" className={cn('flex flex-col items-center gap-0.5 text-xs', isActive('/login') ? 'text-terracotta-600' : 'text-gray-500')}>
              <User className="w-5 h-5" />
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
