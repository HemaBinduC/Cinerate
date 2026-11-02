import type { Movie, Rating, User, Genre, Language, Category } from "@/types";
import { supabase } from "@/lib/supabase";

export const GENRES: Genre[] = [
  "Action",
  "Sci-Fi",
  "Drama",
  "Comedy",
  "Romance",
  "Thriller",
  "Animation",
];

export const LANGUAGES: Language[] = [
  "Telugu",
  "Hindi",
  "Tamil",
  "Malayalam",
  "English",
  "Korean",
  "Chinese",
];

export const LANGUAGE_LABELS: Record<Language, string> = {
  Telugu: "Telugu",
  Hindi: "Hindi",
  Tamil: "Tamil",
  Malayalam: "Malayalam",
  English: "English / Hollywood",
  Korean: "Korean",
  Chinese: "Chinese",
};

// Home page section order — movies first, then drama sections.
export const HOME_SECTIONS: { language: Language; category: Category; title: string }[] = [
  { language: "Telugu", category: "Movie", title: "Popular Telugu Movies" },
  { language: "Hindi", category: "Movie", title: "Popular Hindi Movies" },
  { language: "Tamil", category: "Movie", title: "Popular Tamil Movies" },
  { language: "Malayalam", category: "Movie", title: "Popular Malayalam Movies" },
  { language: "English", category: "Movie", title: "Popular Hollywood Movies" },
  { language: "Korean", category: "Movie", title: "Popular Korean Movies" },
  { language: "Chinese", category: "Movie", title: "Popular Chinese Movies" },
  { language: "Korean", category: "Drama", title: "Popular K-Dramas" },
  { language: "Chinese", category: "Drama", title: "Popular C-Dramas" },
];

// Poster gradients keyed by genre (fallback behind poster image).
export const GENRE_GRADIENTS: Record<Genre, string> = {
  Action: "from-red-600 via-orange-600 to-amber-500",
  "Sci-Fi": "from-cyan-500 via-blue-600 to-indigo-700",
  Drama: "from-slate-500 via-stone-600 to-amber-700",
  Comedy: "from-yellow-400 via-amber-400 to-orange-400",
  Romance: "from-pink-500 via-rose-500 to-red-400",
  Thriller: "from-zinc-600 via-slate-800 to-gray-900",
  Animation: "from-emerald-400 via-teal-500 to-cyan-500",
};

export const USERS: User[] = [
  { user_id: 1, display_name: "Aarav" },
  { user_id: 2, display_name: "Diya" },
  { user_id: 3, display_name: "Kabir" },
  { user_id: 4, display_name: "Meera" },
  { user_id: 5, display_name: "Rohan" },
  { user_id: 6, display_name: "Ananya" },
  { user_id: 7, display_name: "Vihaan" },
  { user_id: 8, display_name: "Isha" },
];

// In-memory catalogue. Loaded from Supabase on app start (see loadMovies).
// Kept as a module-level array so existing `MOVIES` imports keep working while
// staying reactive via the loader in App.tsx.
export const MOVIES: Movie[] = [];

interface MovieRow {
  movie_id: number;
  tmdb_id: number | null;
  title: string;
  release_year: number | null;
  release_date: string | null;
  genre: string | null;
  language: string;
  category: string;
  poster_url: string | null;
  poster_gradient: string | null;
  overview: string | null;
}

const VALID_GENRES = new Set<string>(GENRES);
const VALID_LANGUAGES = new Set<string>(LANGUAGES);

function coerceMovie(row: MovieRow): Movie {
  const genre = (row.genre && VALID_GENRES.has(row.genre) ? row.genre : "Drama") as Genre;
  const language = (VALID_LANGUAGES.has(row.language) ? row.language : "English") as Language;
  const category = (row.category === "Drama" ? "Drama" : "Movie") as Category;
  return {
    movie_id: row.movie_id,
    tmdb_id: row.tmdb_id ?? undefined,
    title: row.title,
    release_year: row.release_year ?? 0,
    release_date: row.release_date ?? undefined,
    genre,
    language,
    category,
    poster: row.poster_gradient ?? GENRE_GRADIENTS[genre],
    posterUrl: row.poster_url ?? undefined,
    overview: row.overview ?? undefined,
  };
}

export async function loadMovies(): Promise<Movie[]> {
  const { data, error } = await supabase
    .from("movies")
    .select(
      "movie_id, tmdb_id, title, release_year, release_date, genre, language, category, poster_url, poster_gradient, overview"
    )
    .order("movie_id", { ascending: true });

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as MovieRow[];
  const parsed = rows.map(coerceMovie);

  // Mutate the shared MOVIES array in place so existing imports see the new data.
  MOVIES.length = 0;
  MOVIES.push(...parsed);
  return parsed;
}

export async function refreshFromTMDB(): Promise<{
  inserted: number;
  fetched: number;
}> {
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tmdb-refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) {
    let message = `Refresh failed (${res.status})`;
    try {
      const body = await res.json();
      if (body && typeof body.error === "string") message = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  const body = await res.json() as { inserted?: number; fetched?: number; titles_after?: number; error?: string };
  if (body.error) throw new Error(body.error);
  return { inserted: body.inserted ?? 0, fetched: body.fetched ?? 0, titlesAfter: body.titles_after ?? 0 };
}

export interface RefreshLogEntry {
  refreshed_at: string;
  titles_after: number;
  inserted: number;
  fetched: number | null;
}

export async function loadLastRefresh(): Promise<RefreshLogEntry | null> {
  const { data, error } = await supabase
    .from("catalogue_refresh_log")
    .select("refreshed_at, titles_after, inserted, fetched")
    .order("refreshed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as unknown as RefreshLogEntry | null) ?? null;
}

// Deterministic seed ratings for the curated 42 titles (movie_id 1..42) so
// each has a realistic spread of 3–7 ratings and an average around 3.5–4.9.
// Built directly from the known ids so it does not depend on the async
// catalogue load. New TMDB-fetched titles start unrated and earn ratings over time.
function buildSeedRatings(): Rating[] {
  const ratings: Rating[] = [];
  let rid = 1;
  const start = new Date("2024-01-01").getTime();
  for (let movieId = 1; movieId <= 42; movieId++) {
    const baseCount = 3 + (movieId % 5); // 3..7 ratings
    for (let i = 0; i < baseCount; i++) {
      const uid = ((movieId + i) % USERS.length) + 1;
      const r = i === 0 && movieId % 4 === 0 ? 3 : 4 + ((movieId + i) % 2);
      const day = Math.floor((movieId * 7 + i * 3) % 120);
      const d = new Date(start + day * 86400000).toISOString().slice(0, 10);
      ratings.push({ rating_id: rid++, user_id: uid, movie_id: movieId, rating: r, rated_at: d });
    }
  }
  return ratings;
}

export const SEED_RATINGS: Rating[] = buildSeedRatings();

export const MIN_RATINGS_FOR_TOP = 3;
