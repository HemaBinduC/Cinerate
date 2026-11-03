import { useState } from 'react';
import { Film, ImageOff } from 'lucide-react';
import type { Movie } from '@/types';

interface PosterProps {
  movie: Movie;
  className?: string;
  rounded?: string;
}

export function Poster({ movie, className = '', rounded = 'rounded-none' }: PosterProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const showImage = !error && movie.posterUrl;

  return (
    <div className={`relative overflow-hidden bg-ink-900 ${className} ${rounded}`}>
      {showImage && (
        <>
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-ink-800" />
          )}
          <img
            src={movie.posterUrl}
            alt={`${movie.title} official poster`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`h-full w-full object-cover transition-all duration-500 ${
              loaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
            }`}
          />
        </>
      )}
      {error && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-ink-850 p-3 text-center">
          <ImageOff size={28} className="text-slate-500" />
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Poster Unavailable
          </span>
          <span className="line-clamp-2 text-xs font-semibold text-slate-300">
            {movie.title}
          </span>
        </div>
      )}
      {!showImage && !error && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-ink-850 p-3 text-center">
          <Film size={28} className="text-slate-600" />
          <span className="line-clamp-2 text-xs font-semibold text-slate-400">
            {movie.title}
          </span>
        </div>
      )}
    </div>
  );
}
