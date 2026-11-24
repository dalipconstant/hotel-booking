import { useState, useMemo } from 'react';
import { useHotel } from '../context/HotelContext';
import RoomCard from '../components/RoomCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '../lib/utils';

const TYPES = ['all', 'standard', 'deluxe', 'suite', 'presidential'] as const;

export default function Rooms() {
  const { rooms } = useHotel();
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string>('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return rooms.filter((r) => {
      if (type !== 'all' && r.type !== type) return false;
      if (onlyAvailable && (!r.is_available || r.needs_cleaning)) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.type.includes(q)
        );
      }
      return true;
    });
  }, [rooms, search, type, onlyAvailable]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="section-title">Rooms & Suites</h1>
        <p className="text-gray-500 mt-2">Find the perfect space for your stay</p>
      </div>

      {/* Search + Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden btn-secondary flex items-center justify-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
        {/* Desktop filters */}
        <div className="hidden sm:flex items-center gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium capitalize transition',
                type === t
                  ? 'bg-terracotta-600 text-white'
                  : 'bg-white border border-cream-200 text-gray-600 hover:border-terracotta-300'
              )}
            >
              {t}
            </button>
          ))}
          <label className="flex items-center gap-2 ml-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="rounded border-gray-300 text-terracotta-600 focus:ring-terracotta-500"
            />
            Available only
          </label>
        </div>
      </div>

      {/* Mobile filters panel */}
      {showFilters && (
        <div className="sm:hidden mb-6 p-4 bg-white rounded-xl border border-cream-200 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Filters</span>
            <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm capitalize',
                  type === t ? 'bg-terracotta-600 text-white' : 'bg-cream-100 text-gray-600'
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="rounded text-terracotta-600"
            />
            Show available only
          </label>
        </div>
      )}

      <p className="text-sm text-gray-500 mb-4">{filtered.length} room{filtered.length !== 1 ? 's' : ''} found</p>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No rooms match your filters</p>
          <button
            onClick={() => { setSearch(''); setType('all'); setOnlyAvailable(false); }}
            className="mt-3 text-terracotta-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
