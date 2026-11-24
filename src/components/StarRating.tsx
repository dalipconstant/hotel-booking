import { Star } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
}: Props) {
  const sizeClass = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  }[size];

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(i + 1)}
            className={cn(interactive && 'cursor-pointer hover:scale-110 transition')}
          >
            <Star
              className={cn(
                sizeClass,
                filled || half ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
