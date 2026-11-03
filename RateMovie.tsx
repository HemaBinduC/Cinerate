import { useState } from 'react';
import { CheckCircle2, Film, Send, Star } from 'lucide-react';
import type { Movie, Rating } from '@/types';
import { MOVIES } from '@/data';
import { averageForMovie, countForMovie } from '@/analytics';
import { StarRating } from '@/components/StarRating';
import { Poster } from '@/components/Poster';

interface RateMovieProps {
  ratings: Rating[];
  submitRating: (movieId: number, rating: number) => void;
  preselect?: Movie | null;
}

export function RateMovie({ ratings, submitRating, preselect }: RateMovieProps) {
  const [movieId, setMovieId] = useState<number | ''>(preselect?.movie_id ?? '');
  const [stars, setStars] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const selected = MOVIES.find((m) => m.movie_id === movieId);

  const handleSubmit = () => {
    if (!movieId) {
      setError('Please select a movie to rate.');
      return;
    }
    if (stars < 1 || stars > 5) {
      setError('Please choose a rating from 1 to 5 stars.');
      return;
    }
    submitRating(movieId, stars);
    setError('');
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setStars(0);
    }, 2600);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 animate-fade-in">
      <h1 className="font-display text-3xl font-bold text-white">Rate a Title</h1>
      <p className="mt-1 text-slate-400">
        Pick a movie or drama and give it a rating from 1 to 5 stars. Your rating is added to the dataset.
      </p>

      {submitted ? (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-10 text-center animate-fade-up">
          <CheckCircle2 size={48} className="text-emerald-400" />
          <h2 className="font-display text-xl font-bold text-white">Rating submitted!</h2>
          <p className="text-sm text-slate-300">
            Thanks for rating{' '}
            <span className="font-semibold text-gold-300">{selected?.title}</span> with{' '}
            <span className="font-semibold text-gold-300">{stars} star{stars > 1 ? 's' : ''}</span>.
            Your rating is now reflected in the analytics.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-ink-800 bg-ink-850 p-6 sm:p-8">
          <label className="block text-sm font-semibold text-white">1. Select a movie</label>
          <div className="relative mt-2">
            <Film size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <select
              value={movieId}
              onChange={(e) => {
                setMovieId(Number(e.target.value));
                setError('');
              }}
              className="w-full rounded-lg border border-ink-700 bg-ink-900 py-3 pl-10 pr-4 text-sm text-white focus:border-gold-500/60 focus:outline-none"
            >
              <option value="">Choose a movie...</option>
              {MOVIES.map((m) => (
                <option key={m.movie_id} value={m.movie_id}>
                  {m.title} ({m.release_year}) — {m.language} · {m.genre}
                </option>
              ))}
            </select>
          </div>

          {selected && (
            <div className="mt-4 flex items-center gap-4 rounded-xl border border-ink-700 bg-ink-900 p-4 animate-fade-up">
              <div className="h-24 w-16 shrink-0 overflow-hidden rounded-md">
                <Poster movie={selected} className="h-full w-full" rounded="rounded-md" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white">{selected.title}</div>
                <div className="text-xs text-slate-400">
                  {selected.release_year} &middot; {selected.language} &middot; {selected.genre}
                  {selected.category === 'Drama' && ' · Drama Series'}
                </div>
              </div>
              <div className="text-right text-xs text-slate-400">
                <div className="flex items-center gap-1 justify-end">
                  <Star size={12} className="text-gold-400" fill="currentColor" />
                  {averageForMovie(ratings, selected.movie_id).toFixed(1)}
                </div>
                <div>{countForMovie(ratings, selected.movie_id)} ratings</div>
              </div>
            </div>
          )}

          <label className="mt-7 block text-sm font-semibold text-white">2. Your rating</label>
          <div className="mt-3 flex flex-col items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 py-8">
            <StarRating
              value={stars}
              interactive
              size={40}
              onChange={(v) => {
                setStars(v);
                setError('');
              }}
            />
            <span className="text-sm text-slate-400">
              {stars === 0 ? 'Click a star to rate' : `${stars} / 5`}
            </span>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 px-6 py-3.5 text-sm font-semibold text-ink-950 transition-all hover:from-gold-300 hover:to-gold-500 hover:shadow-glow active:scale-[0.99]"
          >
            <Send size={16} /> Submit Rating
          </button>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-slate-500">
        Ratings are stored locally in this prototype. No other users' personal information is shown.
      </p>
    </div>
  );
}
