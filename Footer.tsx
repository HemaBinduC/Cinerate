import { Film, Github, GraduationCap } from 'lucide-react';
import type { Page } from './Navbar';

interface FooterProps {
  setPage: (p: Page) => void;
}

export function Footer({ setPage }: FooterProps) {
  return (
    <footer className="mt-16 border-t border-ink-800 bg-ink-900">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-gold-400 to-gold-600">
              <Film size={20} className="text-ink-950" strokeWidth={2.5} />
            </span>
            <span className="font-display text-base font-bold text-white">CineRate</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-slate-400">
            Movie Ratings Analysis &amp; Recommendation System.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><button className="hover:text-gold-300" onClick={() => setPage('movies')}>Browse Movies</button></li>
            <li><button className="hover:text-gold-300" onClick={() => setPage('analytics')}>Analytics Dashboard</button></li>
            <li><button className="hover:text-gold-300" onClick={() => setPage('recommendations')}>Recommendations</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white">Tech Stack (Planned)</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {['Python', 'Flask', 'MySQL', 'Pandas', 'NumPy', 'Matplotlib', 'scikit-learn'].map((t) => (
              <span key={t} className="rounded-full border border-ink-700 bg-ink-850 px-2.5 py-1 text-xs text-slate-300">
                {t}
              </span>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <GraduationCap size={14} /> Educational project &middot; sample data
          </p>
        </div>
      </div>
      <div className="border-t border-ink-800 py-4 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} CineRate &mdash; Built for academic demonstration.
      </div>
    </footer>
  );
}
