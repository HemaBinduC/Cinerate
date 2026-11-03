import { useState } from 'react';
import { Sparkles, Star, Users, Calendar, Tag, Info, RefreshCw, Film, Globe, Tv } from 'lucide-react';
import type { Movie, Rating } from '@/types';
import { popularityRecommendations, similarMovies, averageForMovie, countForMovie } from '@/analytics';
import { MOVIES, MIN_RATINGS_FOR_TOP } from '@/data';
import { StarRating } from '@/components/StarRating';
import { Poster } from '@/components/Poster';

interface RecommendationsProps {
  ratings: Rating[];
  onRate: (m: Movie) => void;
}

export function Recommendations({ ratings, onRate }: RecommendationsProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const recs = popularityRecommendations(ratings, 6);

  const shuffle = () => setRefreshKey((k) => k + 1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-fade-in" key={refreshKey}>
      <div className="flex items-center gap-3">
        <Sparkles size={28} className="text-gold-400" />
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-white">Recommendations</h1>
          <p className="text-slate-400">
            Suggestions based on average rating, language and genre preferences.
          </p>
        </div>
        <button
          onClick={shuffle}
          className="inline-flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-gold-500/50"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Method + disclaimer */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
          <Info size={18} className="mt-0.5 shrink-0 text-cyan-300" />
          <p>
            <span className="font-semibold">How it works:</span> titles are ranked by average rating
            among those with at least <span className="font-semibold">{MIN_RATINGS_FOR_TOP} ratings</span>,
            then by popularity (rating count), with language and genre as tie-breakers.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-gold-500/25 bg-gold-500/10 px-4 py-3 text-sm text-gold-200">
          <Info size={18} className="mt-0.5 shrink-0 text-gold-300" />
          <p>
            Recommendations are educational suggestions based on available ratings and do not
            guarantee user preference.
          </p>
        </div>
      </div>

      {/* Recommendation cards */}
      <h2 className="mt-10 font-display text-xl font-bold text-white">Recommended for You</h2>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {recs.map((s, i) => (
          <div
            key={s.movie.movie_id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-ink-800 bg-ink-850 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/40 hover:shadow-glow animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="relative aspect-[2/3] overflow-hidden">
              <Poster movie={s.movie} className="h-full w-full" />
              <span className="absolute left-3 top-3 z-10 rounded-full bg-gold-500 px-2.5 py-1 text-[11px] font-bold text-ink-950">
                #{i + 1} Pick
              </span>
              {s.movie.category === 'Drama' && (
                <span className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-purple-600/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                  <Tv size={11} /> Drama
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <h3 className="font-display text-base font-bold leading-tight text-white">
                {s.movie.title}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Calendar size={13} /> {s.movie.release_year}</span>
                <span className="flex items-center gap-1"><Globe size={13} /> {s.movie.language}</span>
                <span className="flex items-center gap-1"><Tag size={13} /> {s.movie.genre}</span>
                <span className="flex items-center gap-1"><Users size={13} /> {s.count}</span>
              </div>
              <div className="flex items-center justify-between">
                <StarRating value={s.average} size={16} />
                <span className="text-sm font-semibold text-gold-300">{s.average.toFixed(1)} / 5</span>
              </div>
              <div className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-2.5 text-xs text-slate-300">
                <span className="font-semibold text-gold-300">Why: </span>
                High average rating ({s.average.toFixed(2)}) with {s.count} ratings
                (&ge; {MIN_RATINGS_FOR_TOP}). {s.movie.language} {s.movie.genre.toLowerCase()}{' '}
                {s.movie.category.toLowerCase()}.
              </div>
              <button
                onClick={() => onRate(s.movie)}
                className="mt-auto w-full rounded-lg border border-ink-600 bg-ink-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-gold-500/50 hover:bg-ink-700"
              >
                Rate this {s.movie.category === 'Drama' ? 'drama' : 'movie'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Similar titles explorer */}
      <SimilarExplorer ratings={ratings} onRate={onRate} />
    </div>
  );
}

function SimilarExplorer({ ratings, onRate }: { ratings: Rating[]; onRate: (m: Movie) => void }) {
  const [selectedId, setSelectedId] = useState<number>(MOVIES[0].movie_id);
  const movie = MOVIES.find((m) => m.movie_id === selectedId) ?? MOVIES[0];
  const similar = similarMovies(movie, ratings, 4);

  return (
    <section className="mt-12">
      <h2 className="font-display text-xl font-bold text-white">Similar Titles</h2>
      <p className="mt-1 text-sm text-slate-400">
        Pick a title to see others in the same language or genre (a simple similarity baseline).
      </p>

      <div className="mt-5 rounded-2xl border border-ink-800 bg-ink-850 p-5">
        <div className="relative max-w-md">
          <Film size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="w-full rounded-lg border border-ink-700 bg-ink-900 py-3 pl-10 pr-4 text-sm text-white focus:border-gold-500/60 focus:outline-none"
          >
            {MOVIES.map((m) => (
              <option key={m.movie_id} value={m.movie_id}>
                {m.title} ({m.release_year}) — {m.language} · {m.genre}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {similar.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-slate-400">
              No similar titles found yet.
            </p>
          ) : (
            similar.map((s) => (
              <div
                key={s.movie.movie_id}
                className="group flex flex-col rounded-xl border border-ink-800 bg-ink-900 p-4 transition-all hover:border-gold-500/40"
              >
                <div className="mb-3 aspect-[2/3] overflow-hidden rounded-md">
                  <Poster movie={s.movie} className="h-full w-full" rounded="rounded-md" />
                </div>
                <div className="line-clamp-1 font-semibold text-white">{s.movie.title}</div>
                <div className="text-xs text-slate-400">
                  {s.movie.release_year} &middot; {s.movie.language} &middot; {s.movie.genre}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <StarRating value={s.average} size={14} />
                  <span className="flex items-center gap-1 text-xs text-slate-300">
                    <Star size={11} className="text-gold-400" fill="currentColor" />
                    {s.average.toFixed(1)}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {countForMovie(ratings, s.movie.movie_id)} ratings
                </div>
                <button
                  onClick={() => onRate(s.movie)}
                  className="mt-3 w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-1.5 text-xs font-semibold text-white hover:border-gold-500/50"
                >
                  Rate
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
