import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Film } from 'lucide-react';
import type { Movie, Rating, Genre, Language } from '@/types';
import { GENRES, LANGUAGES, LANGUAGE_LABELS, MOVIES } from '@/data';
import { averageForMovie, countForMovie } from '@/analytics';
import { MovieCard } from '@/components/MovieCard';

interface MoviesProps {
  ratings: Rating[];
  onRate: (m: Movie) => void;
}

type SortKey = 'rating' | 'year' | 'title' | 'count';
type LangFilter = Language | 'All';

export function Movies({ ratings, onRate }: MoviesProps) {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState<LangFilter>('All');
  const [genre, setGenre] = useState<Genre | 'All'>('All');
  const [sort, setSort] = useState<SortKey>('rating');

  const filtered = useMemo(() => {
    let list = MOVIES.filter((m) => {
      const matchesQuery = m.title.toLowerCase().includes(query.trim().toLowerCase());
      const matchesLang = language === 'All' || m.language === language;
      const matchesGenre = genre === 'All' || m.genre === genre;
      return matchesQuery && matchesLang && matchesGenre;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'rating':
          return averageForMovie(ratings, b.movie_id) - averageForMovie(ratings, a.movie_id);
        case 'count':
          return countForMovie(ratings, b.movie_id) - countForMovie(ratings, a.movie_id);
        case 'year':
          return b.release_year - a.release_year;
        case 'title':
          return a.title.localeCompare(b.title);
      }
    });
    return list;
  }, [query, language, genre, sort, ratings]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold text-white">Browse Titles</h1>
        <p className="text-slate-400">
          Search, filter by language and genre, and sort by rating across {MOVIES.length} titles.
        </p>
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-ink-800 bg-ink-850 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title..."
            className="w-full rounded-lg border border-ink-700 bg-ink-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-gold-500/60 focus:outline-none focus:ring-1 focus:ring-gold-500/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal size={16} className="text-slate-500" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LangFilter)}
            className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-2.5 text-sm text-white focus:border-gold-500/60 focus:outline-none"
          >
            <option value="All">All Languages</option>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{LANGUAGE_LABELS[l]}</option>
            ))}
          </select>

          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value as Genre | 'All')}
            className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-2.5 text-sm text-white focus:border-gold-500/60 focus:outline-none"
          >
            <option value="All">All Genres</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-2.5 text-sm text-white focus:border-gold-500/60 focus:outline-none"
          >
            <option value="rating">Sort: Rating</option>
            <option value="count">Sort: Most Rated</option>
            <option value="year">Sort: Newest</option>
            <option value="title">Sort: A–Z</option>
          </select>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-400">
        Showing <span className="font-semibold text-white">{filtered.length}</span> title{filtered.length !== 1 ? 's' : ''}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-700 py-16 text-center">
          <Film size={32} className="text-slate-600" />
          <p className="text-slate-400">No titles match your search.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((m) => (
            <MovieCard
              key={m.movie_id}
              movie={m}
              average={averageForMovie(ratings, m.movie_id)}
              count={countForMovie(ratings, m.movie_id)}
              onRate={onRate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
