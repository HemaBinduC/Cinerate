import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, Loader2, CheckCircle2, Clock } from "lucide-react";
import type { Movie, Rating } from "@/types";
import { SEED_RATINGS, USERS, loadMovies, refreshFromTMDB, loadLastRefresh, type RefreshLogEntry } from "@/data";
import { Navbar, type Page } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Home } from "@/pages/Home";
import { Movies } from "@/pages/Movies";
import { RateMovie } from "@/pages/RateMovie";
import { Analytics } from "@/pages/Analytics";
import { Recommendations } from "@/pages/Recommendations";

type CatalogueState = "loading" | "ready" | "error";

function formatRefreshDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return `Today, ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function App() {
  const [page, setPage] = useState<Page>("home");
  const [ratings, setRatings] = useState<Rating[]>(SEED_RATINGS);
  const [rateTarget, setRateTarget] = useState<Movie | null>(null);
  const [nextRatingId, setNextRatingId] = useState(SEED_RATINGS.length + 1);

  const [catalogueState, setCatalogueState] = useState<CatalogueState>("loading");
  const [catalogueError, setCatalogueError] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [lastRefresh, setLastRefresh] = useState<RefreshLogEntry | null>(null);

  const currentUserId = USERS[USERS.length - 1].user_id + 1;

  const refreshCatalogue = useCallback(async (manual: boolean) => {
    if (manual) {
      setRefreshing(true);
      setRefreshMessage(null);
    }
    try {
      await refreshFromTMDB();
      const fresh = await loadMovies();
      setMovies([...fresh]);
      setCatalogueState("ready");
      setCatalogueError("");
      try {
        setLastRefresh(await loadLastRefresh());
      } catch { /* non-fatal */ }
      if (manual) {
        setRefreshMessage({ kind: "ok", text: `Catalogue refreshed. ${fresh.length} titles now available.` });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not refresh catalogue from TMDB.";
      if (manual) {
        setRefreshMessage({ kind: "error", text: msg });
      } else {
        setCatalogueError(msg);
        setCatalogueState("error");
      }
    } finally {
      if (manual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [loaded, log] = await Promise.allSettled([loadMovies(), loadLastRefresh()]);
        if (cancelled) return;
        if (loaded.status === "fulfilled") {
          setMovies([...loaded.value]);
          setCatalogueState("ready");
        } else {
          setCatalogueError(loaded.reason instanceof Error ? loaded.reason.message : "Could not load the movie catalogue.");
          setCatalogueState("error");
        }
        if (log.status === "fulfilled") setLastRefresh(log.value ?? null);
      } catch (e) {
        if (cancelled) return;
        setCatalogueError(e instanceof Error ? e.message : "Could not load the movie catalogue.");
        setCatalogueState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const goToRate = (movie: Movie) => {
    setRateTarget(movie);
    setPage("rate");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitRating = (movieId: number, rating: number) => {
    const newRating: Rating = {
      rating_id: nextRatingId,
      user_id: currentUserId,
      movie_id: movieId,
      rating,
      rated_at: new Date().toISOString().slice(0, 10),
    };
    setRatings((prev) => [...prev, newRating]);
    setNextRatingId((n) => n + 1);
  };

  const handleManualRefresh = () => refreshCatalogue(true);

  const dismissRefreshMessage = () => setRefreshMessage(null);

  // Loading screen
  if (catalogueState === "loading") {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar page={page} setPage={setPage} />
        <main className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 size={40} className="animate-spin text-gold-400" />
            <div>
              <h2 className="font-display text-lg font-bold text-white">Loading CineRate</h2>
              <p className="text-sm text-slate-400">Fetching the latest movie and drama catalogue...</p>
            </div>
          </div>
        </main>
        <Footer setPage={setPage} />
      </div>
    );
  }

  // Error screen (only shown when we have no movies at all)
  if (catalogueState === "error" && movies.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar page={page} setPage={setPage} />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <AlertTriangle size={40} className="text-red-400" />
            <div>
              <h2 className="font-display text-lg font-bold text-white">Catalogue unavailable</h2>
              <p className="mt-1 text-sm text-slate-300">{catalogueError || "Could not reach the catalogue."}</p>
            </div>
            <button
              onClick={handleManualRefresh}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:from-gold-300 hover:to-gold-500"
            >
              <RefreshCw size={16} /> Try again
            </button>
          </div>
        </main>
        <Footer setPage={setPage} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar page={page} setPage={setPage} />
      <main className="flex-1">
        {/* Refresh banner */}
        {refreshMessage && (
          <div
            className={`mx-auto mt-4 flex max-w-7xl items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
              refreshMessage.kind === "ok"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : "border-red-500/30 bg-red-500/10 text-red-200"
            } animate-fade-up`}
          >
            {refreshMessage.kind === "ok" ? (
              <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle size={18} className="shrink-0 text-red-400" />
            )}
            <span className="flex-1">{refreshMessage.text}</span>
            <button onClick={dismissRefreshMessage} className="text-xs font-semibold text-slate-300 hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        {/* Manual refresh bar + last-refresh status badge */}
        <div className="mx-auto mt-4 flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
          {lastRefresh ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850/80 px-3 py-1.5 text-[11px] font-medium text-slate-300" title={`Added ${lastRefresh.inserted} new title${lastRefresh.inserted !== 1 ? "s" : ""} this run`}>
              <Clock size={12} className="text-gold-400" />
              <span className="text-slate-400">Last refresh:</span>
              <span className="font-semibold text-white">{formatRefreshDate(lastRefresh.refreshed_at)}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{lastRefresh.titles_after} titles</span>
              {lastRefresh.inserted > 0 && (
                <>
                  <span className="text-slate-500">·</span>
                  <span className="font-semibold text-emerald-400">+{lastRefresh.inserted} new</span>
                </>
              )}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850/80 px-3 py-1.5 text-[11px] font-medium text-slate-400">
              <Clock size={12} className="text-slate-500" />
              No TMDB refresh yet
            </span>
          )}
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:border-gold-500/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            {refreshing ? "Refreshing..." : "Refresh catalogue"}
          </button>
        </div>

        {page === "home" && <Home ratings={ratings} setPage={setPage} onRate={goToRate} />}
        {page === "movies" && <Movies ratings={ratings} onRate={goToRate} />}
        {page === "rate" && (
          <RateMovie ratings={ratings} submitRating={submitRating} preselect={rateTarget} />
        )}
        {page === "analytics" && <Analytics ratings={ratings} />}
        {page === "recommendations" && (
          <Recommendations ratings={ratings} onRate={goToRate} />
        )}
      </main>
      <Footer setPage={setPage} />
    </div>
  );
}

export default App;
