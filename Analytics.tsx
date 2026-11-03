import { BarChart3, Film, Star, TrendingUp, Trophy, Info } from 'lucide-react';
import type { Rating } from '@/types';
import {
  movieStats,
  topRatedMovies,
  overallAverage,
  topMovie,
  genreStats,
  ratingDistribution,
  qualifiedMovies,
} from '@/analytics';
import { MOVIES, MIN_RATINGS_FOR_TOP } from '@/data';
import { BarChart } from '@/components/BarChart';
import { HBarChart } from '@/components/HBarChart';
import { DonutChart } from '@/components/DonutChart';

const GENRE_COLORS: Record<string, string> = {
  Action: '#ef4444',
  'Sci-Fi': '#3b82f6',
  Drama: '#a78b6f',
  Comedy: '#f59e0b',
  Romance: '#ec4899',
  Thriller: '#64748b',
  Animation: '#10b981',
};

interface AnalyticsProps {
  ratings: Rating[];
}

export function Analytics({ ratings }: AnalyticsProps) {
  const stats = movieStats(ratings);
  const top = topRatedMovies(ratings, 5);
  const genres = genreStats(ratings);
  const dist = ratingDistribution(ratings);
  const avg = overallAverage(ratings);
  const best = topMovie(ratings);

  // Movie comparison chart: top 8 movies by count, sorted by average
  const comparison = [...stats]
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .sort((a, b) => b.average - a.average);

  // Donut data: ratings per genre
  const donutData = genres.map((g) => ({
    label: g.genre,
    value: g.count,
    color: GENRE_COLORS[g.genre] ?? '#94a3b8',
  }));

  const cards = [
    { label: 'Total Titles', value: String(MOVIES.length), icon: Film, accent: 'text-cyan-400' },
    { label: 'Total Ratings', value: String(ratings.length), icon: Star, accent: 'text-gold-400' },
    { label: 'Overall Average', value: `${avg.toFixed(2)} / 5`, icon: TrendingUp, accent: 'text-emerald-400' },
    { label: 'Top Rated', value: best ? best.movie.title : '—', icon: Trophy, accent: 'text-pink-400', small: true },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <BarChart3 size={28} className="text-gold-400" />
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-slate-400">
            Aggregated ratings analysis mirroring Pandas, NumPy &amp; Matplotlib workflows.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-ink-800 bg-ink-850 p-5 transition-transform hover:-translate-y-0.5"
          >
            <c.icon size={22} className={c.accent} />
            <div className={`mt-2 font-display font-bold text-white ${c.small ? 'text-base' : 'text-2xl'}`}>
              {c.value}
            </div>
            <div className="text-xs text-slate-400">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Rule notice */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-gold-500/25 bg-gold-500/10 px-4 py-3 text-sm text-gold-200">
        <Info size={18} className="mt-0.5 shrink-0 text-gold-300" />
        <p>
          <span className="font-semibold">Top Rated rule:</span> a title must have at least{' '}
          <span className="font-semibold">{MIN_RATINGS_FOR_TOP} ratings</span> to qualify for the
          Top Rated list. {qualifiedMovies(ratings).length} of {MOVIES.length} titles currently qualify.
        </p>
      </div>

      {/* Top rated table + genre table */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-ink-800 bg-ink-850 p-6">
          <h2 className="font-display text-lg font-bold text-white">Top Rated Titles</h2>
          <p className="mb-4 text-xs text-slate-400">Minimum {MIN_RATINGS_FOR_TOP} ratings required.</p>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-700 text-left text-xs uppercase text-slate-400">
                  <th className="py-2 pr-4 font-semibold">#</th>
                  <th className="py-2 pr-4 font-semibold">Title</th>
                  <th className="py-2 pr-4 font-semibold">Lang</th>
                  <th className="py-2 pr-4 font-semibold">Genre</th>
                  <th className="py-2 pr-4 font-semibold">Avg</th>
                  <th className="py-2 font-semibold">Count</th>
                </tr>
              </thead>
              <tbody>
                {top.map((s, i) => (
                  <tr key={s.movie.movie_id} className="border-b border-ink-800/70 last:border-0">
                    <td className="py-2.5 pr-4 font-semibold text-gold-300">{i + 1}</td>
                    <td className="py-2.5 pr-4 text-white">{s.movie.title}</td>
                    <td className="py-2.5 pr-4 text-slate-400">{s.movie.language}</td>
                    <td className="py-2.5 pr-4 text-slate-400">{s.movie.genre}</td>
                    <td className="py-2.5 pr-4 font-semibold text-gold-300">{s.average.toFixed(2)}</td>
                    <td className="py-2.5 text-slate-300">{s.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-ink-800 bg-ink-850 p-6">
          <h2 className="font-display text-lg font-bold text-white">Average Rating by Genre</h2>
          <p className="mb-4 text-xs text-slate-400">Mean rating and total ratings per genre.</p>
          <div className="space-y-3">
            {genres.map((g) => (
              <div key={g.genre} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-slate-300">{g.genre}</span>
                <div className="h-7 flex-1 overflow-hidden rounded-md bg-ink-800">
                  <div
                    className="flex h-full items-center justify-end rounded-md px-2 text-xs font-semibold text-white transition-all duration-700"
                    style={{
                      width: `${(g.average / 5) * 100}%`,
                      background: GENRE_COLORS[g.genre] ?? '#94a3b8',
                    }}
                  >
                    {g.average.toFixed(2)}
                  </div>
                </div>
                <span className="w-20 shrink-0 text-right text-xs text-slate-400">{g.count} ratings</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Charts row 1: genre comparison bar + rating distribution donut */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-ink-800 bg-ink-850 p-6">
          <h2 className="font-display text-lg font-bold text-white">Genre Comparison (Avg Rating)</h2>
          <p className="mb-4 text-xs text-slate-400">Average rating out of 5 by genre.</p>
          <BarChart
            data={genres.map((g) => ({ label: g.genre, value: g.average }))}
            max={5}
            unit=""
            accent="from-gold-400 to-gold-600"
          />
        </section>

        <section className="rounded-2xl border border-ink-800 bg-ink-850 p-6">
          <h2 className="font-display text-lg font-bold text-white">Rating Distribution</h2>
          <p className="mb-4 text-xs text-slate-400">How many ratings fall at each star level.</p>
          <BarChart
            data={[
              { label: '1★', value: dist[0] },
              { label: '2★', value: dist[1] },
              { label: '3★', value: dist[2] },
              { label: '4★', value: dist[3] },
              { label: '5★', value: dist[4] },
            ]}
            accent="from-cyan-400 to-blue-600"
          />
        </section>
      </div>

      {/* Charts row 2: ratings per genre donut + movie comparison */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-ink-800 bg-ink-850 p-6">
          <h2 className="font-display text-lg font-bold text-white">Ratings per Genre</h2>
          <p className="mb-4 text-xs text-slate-400">Share of total ratings by genre.</p>
          <div className="flex justify-center py-4">
            <DonutChart
              data={donutData}
              centerValue={String(ratings.length)}
              centerLabel="ratings"
              size={220}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-ink-800 bg-ink-850 p-6">
          <h2 className="font-display text-lg font-bold text-white">Title Rating Comparison</h2>
          <p className="mb-4 text-xs text-slate-400">Average rating of the most-rated titles.</p>
          <HBarChart
            data={comparison.map((s) => ({
              label: s.movie.title.length > 20 ? s.movie.title.slice(0, 18) + '…' : s.movie.title,
              value: s.average,
            }))}
            max={5}
            unit=""
            accent="from-emerald-400 to-teal-600"
          />
        </section>
      </div>
    </div>
  );
}
