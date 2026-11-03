import { Film, Sparkles, BarChart3, Star, TrendingUp, ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import type { Movie, Rating } from '@/types';
import type { Page } from '@/components/Navbar';
import { MOVIES, HOME_SECTIONS } from '@/data';
import { averageForMovie, countForMovie, overallAverage } from '@/analytics';
import { HorizontalRow } from '@/components/HorizontalRow';

interface HomeProps {
  ratings: Rating[];
  setPage: (p: Page) => void;
  onRate: (m: Movie) => void;
}

export function Home({ ratings, setPage, onRate }: HomeProps) {
  const avg = overallAverage(ratings);

  const stats = useMemo(() => {
    const map = new Map<number, { average: number; count: number }>();
    for (const m of MOVIES) {
      map.set(m.movie_id, {
        average: averageForMovie(ratings, m.movie_id),
        count: countForMovie(ratings, m.movie_id),
      });
    }
    return map;
  }, [ratings]);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.12),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.10),_transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Movie &amp; Drama Ratings Analysis &amp;{' '}
              <span className="text-gradient-gold">Recommendation System</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-slate-300 sm:text-lg">
              Rate and analyze films and dramas across Telugu, Hindi, Tamil, Malayalam,
              Hollywood, Korean and Chinese cinema.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => setPage('movies')}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 px-6 py-3 text-sm font-semibold text-ink-950 transition-all hover:from-gold-300 hover:to-gold-500 hover:shadow-glow"
              >
                <Film size={18} /> Explore Titles
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => setPage('recommendations')}
                className="inline-flex items-center gap-2 rounded-xl border border-ink-600 bg-ink-850 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-gold-500/50 hover:bg-ink-800"
              >
                <Sparkles size={18} /> View Recommendations
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Titles', value: String(MOVIES.length), icon: Film },
              { label: 'Ratings', value: String(ratings.length), icon: Star },
              { label: 'Avg Rating', value: avg.toFixed(2), icon: TrendingUp },
              { label: 'Languages', value: '7', icon: BarChart3 },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-ink-800 bg-ink-850/80 p-4 text-center backdrop-blur-sm"
              >
                <s.icon size={20} className="mx-auto text-gold-400" />
                <div className="mt-2 font-display text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Per-language / per-category horizontal sections */}
      {HOME_SECTIONS.map((section) => {
        const items = MOVIES.filter(
          (m) => m.language === section.language && m.category === section.category
        );
        if (items.length === 0) return null;
        return (
          <section key={section.title} className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
                  {section.title}
                </h2>
                <p className="mt-0.5 text-sm text-slate-400">
                  {items.length} title{items.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setPage('movies')}
                className="hidden items-center gap-1 text-sm font-semibold text-gold-300 hover:text-gold-200 sm:inline-flex"
              >
                View all <ArrowRight size={15} />
              </button>
            </div>
            <HorizontalRow movies={items} stats={stats} onRate={onRate} />
          </section>
        );
      })}

      {/* Feature highlights */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: BarChart3,
              title: 'Data Analytics',
              desc: 'Genre & language comparison, rating distribution and top-rated tables powered by Pandas & NumPy-style aggregation.',
              page: 'analytics' as Page,
            },
            {
              icon: Sparkles,
              title: 'Recommendations',
              desc: 'Popularity-based suggestions using average rating, language and genre preferences.',
              page: 'recommendations' as Page,
            },
            {
              icon: Star,
              title: 'Rate Titles',
              desc: 'Submit your own 1–5 star ratings for movies and dramas and watch the analytics update in real time.',
              page: 'rate' as Page,
            },
          ].map((f) => (
            <button
              key={f.title}
              onClick={() => setPage(f.page)}
              className="group rounded-2xl border border-ink-800 bg-ink-850 p-6 text-left transition-all hover:-translate-y-1 hover:border-gold-500/40 hover:shadow-glow"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-800 text-gold-400 transition-colors group-hover:bg-gold-500 group-hover:text-ink-950">
                <f.icon size={22} />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-300">
                Learn more <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
