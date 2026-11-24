import { Link } from 'react-router-dom';
import { Star, Users, BedDouble, Wifi, Wind, Tv, DoorOpen } from 'lucide-react';
import type { Room } from '../types';
import { useHotel } from '../context/HotelContext';
import { formatCurrency, cn } from '../lib/utils';

interface Props {
  room: Room;
  compact?: boolean;
}

export default function RoomCard({ room, compact = false }: Props) {
  const { currency } = useHotel();
  const price = currency === 'INR' ? room.price_inr : room.price_usd;

  const amenityIcons = [
    room.amenities.wifi && { icon: Wifi, label: 'WiFi' },
    room.amenities.ac && { icon: Wind, label: 'AC' },
    room.amenities.tv && { icon: Tv, label: 'TV' },
    room.amenities.balcony && { icon: DoorOpen, label: 'Balcony' },
  ].filter(Boolean) as { icon: any; label: string }[];

  return (
    <Link to={`/rooms/${room.id}`} className="card group block">
      <div className={cn('relative overflow-hidden', compact ? 'h-40' : 'h-52 sm:h-60')}>
        <img
          src={room.images[0]}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="badge bg-white/90 text-gray-800 capitalize">{room.type}</span>
          {!room.is_available && (
            <span className="badge bg-red-500 text-white">
              {room.needs_cleaning ? 'Preparing' : 'Booked'}
            </span>
          )}
        </div>
        {room.rating_avg > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 rounded-full px-2 py-1 text-xs font-medium">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {room.rating_avg}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="font-serif text-lg font-semibold text-gray-900 group-hover:text-terracotta-600 transition">
          {room.name}
        </h3>
        {!compact && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{room.description}</p>
        )}

        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {room.capacity}
          </span>
          <span className="flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5" /> {room.beds} · {room.bed_type}
          </span>
          <span>{room.size_sqft} sqft</span>
        </div>

        {amenityIcons.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            {amenityIcons.map((a) => (
              <span key={a.label} title={a.label} className="p-1.5 rounded-md bg-cream-100 text-terracotta-600">
                <a.icon className="w-3.5 h-3.5" />
              </span>
            ))}
          </div>
        )}

        <div className="flex items-end justify-between mt-4 pt-3 border-t border-cream-100">
          <div>
            <span className="text-xl font-semibold text-gray-900">{formatCurrency(price, currency)}</span>
            <span className="text-xs text-gray-500"> / night</span>
          </div>
          <span className="text-sm text-terracotta-600 font-medium group-hover:underline">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
}
