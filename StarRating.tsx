import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (v: number) => void;
  className?: string;
}

// Renders filled / empty stars. Supports fractional fill via clip on the icon row.
export function StarRating({
  value,
  max = 5,
  size = 16,
  interactive = false,
  onChange,
  className = '',
}: StarRatingProps) {
  const stars = [];
  for (let i = 1; i <= max; i++) {
    const filled = value >= i;
    const half = !filled && value >= i - 0.5;
    stars.push(
      <button
        key={i}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onChange?.(i)}
        className={`relative ${interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'} ${className}`}
        aria-label={`${i} star${i > 1 ? 's' : ''}`}
      >
        <Star
          size={size}
          className={filled || half ? 'text-gold-400' : 'text-ink-600'}
          fill={filled ? 'currentColor' : half ? 'url(#half)' : 'none'}
          strokeWidth={1.5}
        />
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5">
      <svg width="0" height="0">
        <defs>
          <linearGradient id="half">
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
      {stars}
    </span>
  );
}
