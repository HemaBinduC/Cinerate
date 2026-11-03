import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TMDBItem {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  genre_ids?: number[];
  poster_path?: string | null;
}

interface TMDBResponse {
  page?: number;
  results?: TMDBItem[];
  total_pages?: number;
  total_results?: number;
}

// Map our app Language union to TMDB's with_original_language + region.
// For Korean/Chinese we split between Movie (tmdb movie endpoint) and Drama
// (tmdb tv endpoint), since K-Dramas and C-Dramas are TV series on TMDB.
interface FetchTarget {
  language: "Telugu" | "Hindi" | "Tamil" | "Malayalam" | "English" | "Korean" | "Chinese";
  category: "Movie" | "Drama";
  tmdbType: "movie" | "tv";
  withOriginalLanguage: string;
  region?: string;
  title: string;
}

const FETCH_TARGETS: FetchTarget[] = [
  { language: "Telugu",    category: "Movie",  tmdbType: "movie", withOriginalLanguage: "te", region: "IN", title: "Telugu Movies" },
  { language: "Hindi",     category: "Movie",  tmdbType: "movie", withOriginalLanguage: "hi", region: "IN", title: "Hindi Movies" },
  { language: "Tamil",     category: "Movie",  tmdbType: "movie", withOriginalLanguage: "ta", region: "IN", title: "Tamil Movies" },
  { language: "Malayalam", category: "Movie",  tmdbType: "movie", withOriginalLanguage: "ml", region: "IN", title: "Malayalam Movies" },
  { language: "English",   category: "Movie",  tmdbType: "movie", withOriginalLanguage: "en", region: "US", title: "Hollywood Movies" },
  { language: "Korean",    category: "Movie",  tmdbType: "movie", withOriginalLanguage: "ko", region: "KR", title: "Korean Movies" },
  { language: "Chinese",   category: "Movie",  tmdbType: "movie", withOriginalLanguage: "zh", region: "CN", title: "Chinese Movies" },
  { language: "Korean",    category: "Drama",  tmdbType: "tv",   withOriginalLanguage: "ko", region: "KR", title: "K-Dramas" },
  { language: "Chinese",   category: "Drama",  tmdbType: "tv",   withOriginalLanguage: "zh", region: "CN", title: "C-Dramas" },
];

// TMDB genre ids -> our app Genre union. Only a subset maps cleanly; anything
// unmapped falls back to "Drama" for tv and "Action" for movie (sensible defaults).
const MOVIE_GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Action", 878: "Sci-Fi", 18: "Drama", 35: "Comedy",
  10749: "Romance", 53: "Thriller", 16: "Animation", 14: "Animation",
  27: "Thriller", 9648: "Thriller", 80: "Thriller",
};
const TV_GENRE_MAP: Record<number, string> = {
  10759: "Action", 18: "Drama", 35: "Comedy", 10765: "Sci-Fi", 10768: "Drama",
  16: "Animation", 10749: "Romance", 9648: "Thriller", 80: "Thriller",
};

const FALLBACK_GRADIENTS = [
  "from-red-600 via-orange-600 to-amber-500",
  "from-cyan-500 via-blue-600 to-indigo-700",
  "from-pink-500 via-rose-500 to-red-400",
  "from-emerald-400 via-teal-500 to-cyan-500",
  "from-slate-500 via-stone-600 to-amber-700",
  "from-zinc-600 via-slate-800 to-gray-900",
  "from-yellow-400 via-amber-400 to-orange-400",
];

function pickGradient(genre: string): string {
  const map: Record<string, string> = {
    Action: "from-red-600 via-orange-600 to-amber-500",
    "Sci-Fi": "from-cyan-500 via-blue-600 to-indigo-700",
    Drama: "from-slate-500 via-stone-600 to-amber-700",
    Comedy: "from-yellow-400 via-amber-400 to-orange-400",
    Romance: "from-pink-500 via-rose-500 to-red-400",
    Thriller: "from-zinc-600 via-slate-800 to-gray-900",
    Animation: "from-emerald-400 via-teal-500 to-cyan-500",
  };
  return map[genre] ?? FALLBACK_GRADIENTS[Math.floor(Math.random() * FALLBACK_GRADIENTS.length)];
}

function mapGenre(genreIds: number[] | undefined, tmdbType: "movie" | "tv"): string {
  if (!genreIds || genreIds.length === 0) {
    return tmdbType === "tv" ? "Drama" : "Action";
  }
  const map = tmdbType === "movie" ? MOVIE_GENRE_MAP : TV_GENRE_MAP;
  for (const id of genreIds) {
    if (map[id]) return map[id];
  }
  return tmdbType === "tv" ? "Drama" : "Action";
}

async function fetchTMDB(
  target: FetchTarget,
  apiKey: string,
  kind: "now_playing" | "popular" | "upcoming" | "on_the_air" | "airing_today"
): Promise<TMDBItem[]> {
  const base = "https://api.themoviedb.org/3";
  const endpoint =
    target.tmdbType === "movie"
      ? kind === "upcoming"
        ? "upcoming"
        : kind === "now_playing"
        ? "now_playing"
        : "popular"
      : kind === "on_the_air"
      ? "on_the_air"
      : kind === "airing_today"
      ? "airing_today"
      : "popular";

  const params = new URLSearchParams({
    api_key: apiKey,
    language: "en-US",
    page: "1",
    with_original_language: target.withOriginalLanguage,
  });
  if (target.tmdbType === "movie" && target.region) {
    params.set("region", target.region);
  }
  if (target.tmdbType === "tv" && target.region) {
    params.set("region", target.region);
  }

  const url = `${base}/${target.tmdbType}/${endpoint}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`TMDB ${target.title} (${endpoint}) -> ${res.status}: ${body.slice(0, 200)}`);
  }
  const data: TMDBResponse = await res.json();
  return data.results ?? [];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const apiKey = Deno.env.get("TMDB_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "TMDB_API_KEY secret is not configured.", inserted: 0 }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Supabase service credentials are not configured.", inserted: 0 }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Pull the current max movie_id and the set of existing tmdb_ids so we can
    // dedupe without re-inserting, and assign new ids above the current max.
    const { data: existingRows, error: existingErr } = await supabase
      .from("movies")
      .select("movie_id, tmdb_id");
    if (existingErr) throw new Error(`Failed to read existing catalogue: ${existingErr.message}`);

    let nextId = 1;
    const existingTmdbIds = new Set<number>();
    for (const row of existingRows ?? []) {
      if (typeof row.movie_id === "number" && row.movie_id >= nextId) nextId = row.movie_id + 1;
      if (typeof row.tmdb_id === "number") existingTmdbIds.add(row.tmdb_id);
    }

    const rowsToInsert: Array<{
      tmdb_id: number;
      title: string;
      release_year: number | null;
      release_date: string | null;
      genre: string;
      language: string;
      category: string;
      poster_url: string | null;
      poster_gradient: string;
      overview: string | null;
    }> = [];
    const seenThisRun = new Set<number>();

    const perTargetSummary: Array<{ title: string; fetched: number; newAdded: number }> = [];

    for (const target of FETCH_TARGETS) {
      // For movies: pull now_playing + popular + upcoming. For tv dramas:
      // on_the_air + popular + airing_today. Then dedupe within this run.
      let fetched: TMDBItem[] = [];
      if (target.tmdbType === "movie") {
        const [np, pop, up] = await Promise.allSettled([
          fetchTMDB(target, apiKey, "now_playing"),
          fetchTMDB(target, apiKey, "popular"),
          fetchTMDB(target, apiKey, "upcoming"),
        ]);
        for (const r of [np, pop, up]) {
          if (r.status === "fulfilled") fetched.push(...r.value);
        }
      } else {
        const [oa, pop, at] = await Promise.allSettled([
          fetchTMDB(target, apiKey, "on_the_air"),
          fetchTMDB(target, apiKey, "popular"),
          fetchTMDB(target, apiKey, "airing_today"),
        ]);
        for (const r of [oa, pop, at]) {
          if (r.status === "fulfilled") fetched.push(...r.value);
        }
      }

      let added = 0;
      for (const item of fetched) {
        if (!item.id) continue;
        if (existingTmdbIds.has(item.id)) continue;
        if (seenThisRun.has(item.id)) continue;
        seenThisRun.add(item.id);

        const title = (target.tmdbType === "movie" ? item.title : item.name) ?? "";
        if (!title) continue;

        const dateStr = target.tmdbType === "movie" ? item.release_date : item.first_air_date;
        let releaseYear: number | null = null;
        let releaseDate: string | null = null;
        if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          releaseDate = dateStr;
          releaseYear = parseInt(dateStr.slice(0, 4), 10);
        } else if (dateStr && /^\d{4}/.test(dateStr)) {
          releaseYear = parseInt(dateStr.slice(0, 4), 10);
        }

        const genre = mapGenre(item.genre_ids, target.tmdbType);
        const posterUrl = item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : null;

        rowsToInsert.push({
          tmdb_id: item.id,
          title,
          release_year: releaseYear,
          release_date: releaseDate,
          genre,
          language: target.language,
          category: target.category,
          poster_url: posterUrl,
          poster_gradient: pickGradient(genre),
          overview: item.overview ?? null,
        });
        added++;
      }
      perTargetSummary.push({ title: target.title, fetched: fetched.length, newAdded: added });
    }

    // Insert all new rows at once. movie_id is assigned by the database via a
    // sequence-free approach: we send them with explicit ids above the max.
    // To avoid collisions if two refreshes race, use ON CONFLICT DO NOTHING.
    const toInsertWithIds = rowsToInsert.map((r) => ({
      movie_id: nextId++,
      ...r,
    }));

    let insertedCount = 0;
    if (toInsertWithIds.length > 0) {
      const { data: inserted, error: insertErr } = await supabase
        .from("movies")
        .insert(toInsertWithIds)
        .select("movie_id");
      if (insertErr) throw new Error(`Insert failed: ${insertErr.message}`);
      insertedCount = inserted?.length ?? 0;
    }

    const fetchedTotal = perTargetSummary.reduce((s, t) => s + t.fetched, 0);

    // Record this refresh in the log so the frontend can show the last-updated badge.
    const { count: titlesAfter, error: countErr } = await supabase
      .from("movies")
      .select("movie_id", { count: "exact", head: true });
    if (countErr) throw new Error(`Post-refresh count failed: ${countErr.message}`);

    const { error: logErr } = await supabase.from("catalogue_refresh_log").insert({
      refreshed_at: new Date().toISOString(),
      titles_after: titlesAfter ?? 0,
      inserted: insertedCount,
      fetched: fetchedTotal,
    });
    if (logErr) throw new Error(`Failed to write refresh log: ${logErr.message}`);

    return new Response(
      JSON.stringify({
        ok: true,
        inserted: insertedCount,
        fetched: fetchedTotal,
        titles_after: titlesAfter ?? 0,
        perTarget: perTargetSummary,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: message, inserted: 0 }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
