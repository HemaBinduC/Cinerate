import { useRef } from 'react';
import type { Movie } from '@/types';
import { Poster } from './Poster';
import { StarRating } from './StarRating';
import { Star } from 'lucide-react';

interface HRowProps {
  movies: Movie[];
  stats: Map<number, { average: number; count: number }>;
  onRate: (m: Movie) => void;
}

export function HorizontalRow({ movies, stats, onRate }: HRowProps) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  if (movies.length === 0) return null;

  return (
    <div className="group/row relative">
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {movies.map((m) => {
          const s = stats.get(m.movie_id) ?? { average: 0, count: 0 };
          return (
            <button
              key={m.movie_id}
              onClick={() => onRate(m)}
              className="group/card shrink-0 w-40 text-left sm:w-44"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-ink-800 transition-all duration-300 group-hover/card:border-gold-500/50 group-hover/card:shadow-glow">
                <Poster movie={m} className="h-full w-full" rounded="rounded-xl" />
                <span className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full bg-ink-950/80 px-2 py-0.5 text-[10px] font-bold text-gold-300 backdrop-blur-sm">
                  <Star size={10} fill="currentColor" /> {s.average.toFixed(1)}
                </span>
              </div>
              <div className="mt-2 line-clamp-1 text-sm font-semibold text-white">
                {m.title}
              </div>
              <div className="text-[11px] text-slate-400">
                {m.release_year} · {m.language}
              </div>
              <div className="mt-0.5">
                <StarRating value={s.average} size={11} />
              </div>
            </button>
          );
        })}
      </div>
      {/* Scroll arrows — appear on hover */}
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-[35%] z-10 hidden h-12 w-12 -translate-x-1 place-items-center rounded-full border border-ink-700 bg-ink-900/90 text-white opacity-0 transition-opacity group-hover/row:opacity-100 hover:bg-ink-800 lg:place-items-center md:grid"
        aria-label="Scroll left"
      >
        ‹
      </button>
      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-[35%] z-10 hidden h-12 w-12 translate-x-1 place-items-center rounded-full border border-ink-700 bg-ink-900/90 text-white opacity-0 transition-opacity group-hover/row:opacity-100 hover:bg-ink-800 md:grid"
        aria-label="Scroll right"
      >
        ›
      </button>
    </div>
  );
}
