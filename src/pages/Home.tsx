import { Link } from 'react-router-dom';
import { useHotel } from '../context/HotelContext';
import RoomCard from '../components/RoomCard';
import { ArrowRight, Shield, Sparkles, Heart, Clock } from 'lucide-react';

export default function Home() {
  const { rooms } = useHotel();
  const featured = rooms.filter((r) => r.is_available).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[480px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl">
            <p className="text-terracotta-300 text-sm tracking-[0.2em] uppercase mb-3">
              Welcome to Serenity
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white font-semibold leading-tight">
              Where every stay feels like home
            </h1>
            <p className="mt-4 text-lg text-gray-200 leading-relaxed">
              Boutique rooms crafted with warmth, heritage, and modern comfort in the heart of the city.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/rooms" className="btn-primary inline-flex items-center gap-2">
                Explore Rooms <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/signup" className="btn-secondary bg-white/10 border-white/30 text-white hover:bg-white/20">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { icon: Sparkles, title: 'Boutique Design', desc: 'Thoughtfully curated interiors' },
              { icon: Heart, title: 'Warm Hospitality', desc: 'Personal care for every guest' },
              { icon: Shield, title: 'Secure Booking', desc: 'Safe & instant confirmation' },
              { icon: Clock, title: '24/7 Support', desc: 'Always here when you need us' },
            ].map((f) => (
              <div key={f.title} className="text-center p-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-terracotta-50 flex items-center justify-center mb-3">
                  <f.icon className="w-6 h-6 text-terracotta-600" />
                </div>
                <h3 className="font-medium text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-terracotta-600 text-sm font-medium tracking-wide uppercase mb-1">
                Our Collection
              </p>
              <h2 className="section-title">Featured Rooms</h2>
            </div>
            <Link to="/rooms" className="hidden sm:inline-flex items-center gap-1 text-terracotta-600 font-medium hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link to="/rooms" className="btn-outline">
              View all rooms
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-terracotta-600">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-semibold">
            Ready for your next escape?
          </h2>
          <p className="mt-4 text-terracotta-100">
            Book directly for the best rates and exclusive member benefits.
          </p>
          <Link to="/rooms" className="mt-8 inline-block bg-white text-terracotta-700 font-medium py-3 px-8 rounded-lg hover:bg-cream-50 transition">
            Browse Availability
          </Link>
        </div>
      </section>
    </div>
  );
}
