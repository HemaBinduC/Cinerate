import { Film, Menu, X } from 'lucide-react';
import { useState } from 'react';

export type Page = 'home' | 'movies' | 'rate' | 'analytics' | 'recommendations';

interface NavbarProps {
  page: Page;
  setPage: (p: Page) => void;
}

const LINKS: { id: Page; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'movies', label: 'Movies' },
  { id: 'rate', label: 'Rate Movie' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'recommendations', label: 'Recommendations' },
];

export function Navbar({ page, setPage }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const go = (p: Page) => {
    setPage(p);
    setOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink-800/80 bg-ink-950/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        <button onClick={() => go('home')} className="flex items-center gap-2.5 group">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 shadow-glow transition-transform group-hover:scale-105">
            <Film size={20} className="text-ink-950" strokeWidth={2.5} />
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-display text-base font-bold text-white">CineRate</span>
            <span className="text-[11px] text-slate-400">Ratings &amp; Recommendations</span>
          </span>
        </button>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.id}>
              <button
                onClick={() => go(l.id)}
                className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  page === l.id
                    ? 'text-gold-300'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {l.label}
                {page === l.id && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold-400" />
                )}
              </button>
            </li>
          ))}
        </ul>

        <button
          onClick={() => setOpen((o) => !o)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-ink-700 text-slate-200 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink-800 bg-ink-900 md:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
            {LINKS.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => go(l.id)}
                  className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                    page === l.id ? 'bg-ink-800 text-gold-300' : 'text-slate-300'
                  }`}
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
