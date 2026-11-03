import { Calendar, Tag, Users, Star, Globe, Tv } from 'lucide-react';
import type { Movie } from '@/types';
import { StarRating } from './StarRating';
import { Poster } from './Poster';

interface MovieCardProps {
  movie: Movie;
  average: number;
  count: number;
  onRate: (movie: Movie) => void;
}

export function MovieCard({ movie, average, count, onRate }: MovieCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-ink-800 bg-ink-850 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-ink-600 hover:shadow-glow">
      <div className="relative aspect-[2/3] overflow-hidden">
        <Poster movie={movie} className="h-full w-full" />
        <span className="absolute left-3 top-3 z-10 rounded-full bg-ink-950/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {movie.genre}
        </span>
        {movie.category === 'Drama' && (
          <span className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-purple-600/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <Tv size={11} /> Drama
          </span>
        )}
        <span className="absolute bottom-3 left-3 z-10 flex items-center gap-1 rounded-full bg-ink-950/70 px-2.5 py-1 text-[11px] font-semibold text-gold-300 backdrop-blur-sm">
          <Star size={12} fill="currentColor" /> {average.toFixed(1)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-display text-base font-bold leading-tight text-white">
          {movie.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar size={13} /> {movie.release_year}
          </span>
          <span className="flex items-center gap-1">
            <Globe size={13} /> {movie.language}
          </span>
          <span className="flex items-center gap-1">
            <Tag size={13} /> {movie.genre}
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} /> {count}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <StarRating value={average} size={16} />
          <span className="text-sm font-semibold text-slate-200">
            {average.toFixed(1)} / 5
          </span>
        </div>

        <button
          onClick={() => onRate(movie)}
          className="mt-auto w-full rounded-lg bg-gradient-to-r from-gold-400 to-gold-600 px-4 py-2.5 text-sm font-semibold text-ink-950 transition-all hover:from-gold-300 hover:to-gold-500 hover:shadow-glow active:scale-[0.98]"
        >
          Rate {movie.category === 'Drama' ? 'Drama' : 'Movie'}
        </button>
      </div>
    </div>
  );
}
