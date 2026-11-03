/*
# Create movies catalogue table

## Purpose
Stores the CineRate movie/drama catalogue. Seeded with the 42 titles that
already ship with the app so existing in-memory seed ratings (which key off
`movie_id` 1–42) continue to resolve. New titles fetched from TMDB are
inserted here by the `tmdb-refresh` edge function, deduplicated by `tmdb_id`.

## New Tables
- `movies`
  - `movie_id` (int, primary key) — stable identifier used by ratings.
  - `tmdb_id` (int, unique, nullable) — TMDB movie/tv id; uniqueness key for dedup.
  - `title` (text, not null) — official title.
  - `release_year` (int) — 4-digit year (null if unknown).
  - `release_date` (date, nullable) — full official release date from TMDB.
  - `genre` (text) — primary genre (matches app's Genre union).
  - `language` (text) — one of: Telugu, Hindi, Tamil, Malayalam, English, Korean, Chinese.
  - `category` (text) — 'Movie' or 'Drama'.
  - `poster_url` (text, nullable) — official poster URL (TMDB image or curated).
  - `poster_gradient` (text) — Tailwind gradient fallback behind poster.
  - `overview` (text, nullable) — TMDB synopsis.
  - `created_at` (timestamptz, default now()).

## Security
- Enable RLS on `movies`.
- Grant SELECT to anon + authenticated (no-auth app: catalogue is intentionally public/read-only from the client).
- INSERT/UPDATE/DELETE granted to service_role only (the edge function maintains the catalogue server-side; the browser never writes to it).
- SELECT policy `TO anon, authenticated USING (true)` — catalogue is shared public data.
- No INSERT/UPDATE/DELETE policies for anon/authenticated — service_role bypasses RLS and has the table-level grants.

## Notes
1. The edge function uses the service_role key, so it bypasses RLS; table-level
   INSERT/UPDATE grants to service_role are still required (service_role needs
   the grant even though it ignores policies).
2. `tmdb_id` is unique so a second fetch of the same TMDB title is a no-op via
   `ON CONFLICT (tmdb_id) DO NOTHING`. Titles with no TMDB id (the 42 curated
   seeds) keep tmdb_id NULL and are never matched against.
3. The seed data mirrors `src/data.ts` exactly so movie_id values stay stable.
*/

CREATE TABLE IF NOT EXISTS movies (
  movie_id integer PRIMARY KEY,
  tmdb_id integer UNIQUE,
  title text NOT NULL,
  release_year integer,
  release_date date,
  genre text,
  language text NOT NULL,
  category text NOT NULL DEFAULT 'Movie',
  poster_url text,
  poster_gradient text,
  overview text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON movies TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON movies TO service_role;

DROP POLICY IF EXISTS "movies_catalogue_public_read" ON movies;
CREATE POLICY "movies_catalogue_public_read"
  ON movies FOR SELECT
  TO anon, authenticated USING (true);

-- Seed the 42 curated titles (mirror of src/data.ts RAW_TITLES + POSTER_URLS).
-- Using ON CONFLICT (movie_id) DO NOTHING keeps this idempotent.
INSERT INTO movies (movie_id, title, release_year, genre, language, category, poster_url, poster_gradient) VALUES
  (1,  'Baahubali 2: The Conclusion', 2017, 'Action',    'Telugu',    'Movie', 'https://upload.wikimedia.org/wikipedia/en/9/93/Baahubali_2_The_Conclusion_poster.jpg', 'from-red-600 via-orange-600 to-amber-500'),
  (2,  'RRR',                          2022, 'Action',    'Telugu',    'Movie', 'https://upload.wikimedia.org/wikipedia/en/d/d7/RRR_Poster.jpg',                       'from-red-600 via-orange-600 to-amber-500'),
  (3,  'Kalki 2898 AD',                2024, 'Sci-Fi',    'Telugu',    'Movie', 'https://upload.wikimedia.org/wikipedia/en/4/4c/Kalki_2898_AD.jpg',                   'from-cyan-500 via-blue-600 to-indigo-700'),
  (4,  'Pushpa: The Rise',             2021, 'Action',    'Telugu',    'Movie', 'https://upload.wikimedia.org/wikipedia/en/7/75/Pushpa_-_The_Rise_%282021_film%29.jpg','from-red-600 via-orange-600 to-amber-500'),
  (5,  'Salaar',                       2023, 'Action',    'Telugu',    'Movie', 'https://upload.wikimedia.org/wikipedia/en/a/a6/Salaar_Part_1_%E2%80%93_Ceasefire.jpg', 'from-red-600 via-orange-600 to-amber-500'),
  (6,  '3 Idiots',                     2009, 'Comedy',    'Hindi',     'Movie', 'https://upload.wikimedia.org/wikipedia/en/d/df/3_idiots_poster.jpg',               'from-yellow-400 via-amber-400 to-orange-400'),
  (7,  'Dangal',                       2016, 'Drama',     'Hindi',     'Movie', 'https://upload.wikimedia.org/wikipedia/en/9/99/Dangal_Poster.jpg',                   'from-slate-500 via-stone-600 to-amber-700'),
  (8,  'Sholay',                       1975, 'Action',    'Hindi',     'Movie', 'https://upload.wikimedia.org/wikipedia/en/5/52/Sholay-poster.jpg',                   'from-red-600 via-orange-600 to-amber-500'),
  (9,  'Zindagi Na Milegi Dobara',     2011, 'Comedy',    'Hindi',     'Movie', 'https://upload.wikimedia.org/wikipedia/en/1/17/Zindagi_Na_Milegi_Dobara.jpg',       'from-yellow-400 via-amber-400 to-orange-400'),
  (10, 'Andhadhun',                    2018, 'Thriller',  'Hindi',     'Movie', 'https://upload.wikimedia.org/wikipedia/en/4/47/Andhadhun_poster.jpg',               'from-zinc-600 via-slate-800 to-gray-900'),
  (11, 'Vikram',                       2022, 'Action',    'Tamil',     'Movie', 'https://upload.wikimedia.org/wikipedia/en/9/93/Vikram_2022_poster.jpg',             'from-red-600 via-orange-600 to-amber-500'),
  (12, 'Jailer',                       2023, 'Action',    'Tamil',     'Movie', 'https://upload.wikimedia.org/wikipedia/en/c/cb/Jailer_2023_Tamil_film_poster.jpg',  'from-red-600 via-orange-600 to-amber-500'),
  (13, 'Kaithi',                       2019, 'Action',    'Tamil',     'Movie', 'https://upload.wikimedia.org/wikipedia/en/7/79/Kaithi_2019_poster.jpg',             'from-red-600 via-orange-600 to-amber-500'),
  (14, '96',                           2018, 'Romance',   'Tamil',     'Movie', 'https://upload.wikimedia.org/wikipedia/en/c/c4/%2796_film_poster.jpg',              'from-pink-500 via-rose-500 to-red-400'),
  (15, '2018: Everyone is a Hero',     2023, 'Drama',     'Malayalam', 'Movie', 'https://upload.wikimedia.org/wikipedia/en/f/fe/2018movie.jpg',                       'from-slate-500 via-stone-600 to-amber-700'),
  (16, 'Manjummel Boys',               2024, 'Thriller',  'Malayalam', 'Movie', 'https://upload.wikimedia.org/wikipedia/en/9/99/Manjummel_Boys_poster.jpg',           'from-zinc-600 via-slate-800 to-gray-900'),
  (17, 'Premam',                       2015, 'Romance',   'Malayalam', 'Movie', 'https://upload.wikimedia.org/wikipedia/en/3/32/Premam_film_poster.jpg',            'from-pink-500 via-rose-500 to-red-400'),
  (18, 'Drishyam',                     2013, 'Thriller',  'Malayalam', 'Movie', 'https://upload.wikimedia.org/wikipedia/en/9/9e/DrishyamMovie.jpg',                  'from-zinc-600 via-slate-800 to-gray-900'),
  (19, 'The Dark Knight',              2008, 'Action',    'English',   'Movie', 'https://upload.wikimedia.org/wikipedia/en/1/1c/The_Dark_Knight_%282008_film%29.jpg','from-red-600 via-orange-600 to-amber-500'),
  (20, 'Inception',                     2010, 'Sci-Fi',    'English',   'Movie', 'https://upload.wikimedia.org/wikipedia/en/2/2e/Inception_%282010%29_theatrical_poster.jpg','from-cyan-500 via-blue-600 to-indigo-700'),
  (21, 'Interstellar',                  2014, 'Sci-Fi',    'English',   'Movie', 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',      'from-cyan-500 via-blue-600 to-indigo-700'),
  (22, 'The Matrix',                    1999, 'Sci-Fi',    'English',   'Movie', 'https://upload.wikimedia.org/wikipedia/en/d/db/The_Matrix.png',                    'from-cyan-500 via-blue-600 to-indigo-700'),
  (23, 'The Godfather',                 1972, 'Drama',     'English',   'Movie', 'https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg',                'from-slate-500 via-stone-600 to-amber-700'),
  (24, 'The Shawshank Redemption',      1994, 'Drama',     'English',   'Movie', 'https://upload.wikimedia.org/wikipedia/en/8/81/ShawshankRedemptionMoviePoster.jpg', 'from-slate-500 via-stone-600 to-amber-700'),
  (25, 'Spider-Man: Into the Spider-Verse', 2018, 'Animation', 'English', 'Movie', 'https://upload.wikimedia.org/wikipedia/en/f/fa/Spider-Man_Into_the_Spider-Verse_poster.png','from-emerald-400 via-teal-500 to-cyan-500'),
  (26, 'Parasite',                      2019, 'Thriller',  'English',   'Movie', 'https://upload.wikimedia.org/wikipedia/en/5/53/Parasite_%282019_film%29.png',      'from-zinc-600 via-slate-800 to-gray-900'),
  (27, 'Train to Busan',                2016, 'Thriller',  'Korean',    'Movie', 'https://upload.wikimedia.org/wikipedia/en/9/95/Train_to_Busan.jpg',                'from-zinc-600 via-slate-800 to-gray-900'),
  (28, 'The Handmaiden',                2016, 'Romance',   'Korean',    'Movie', 'https://upload.wikimedia.org/wikipedia/en/a/a2/The_Handmaiden_film.png',           'from-pink-500 via-rose-500 to-red-400'),
  (29, 'Oldboy',                        2003, 'Thriller',  'Korean',    'Movie', 'https://upload.wikimedia.org/wikipedia/en/6/67/Oldboykoreanposter.jpg',            'from-zinc-600 via-slate-800 to-gray-900'),
  (30, 'Crouching Tiger, Hidden Dragon', 2000, 'Action',   'Chinese',   'Movie', 'https://upload.wikimedia.org/wikipedia/en/2/27/Crouching_Tiger%2C_Hidden_Dragon_%28Chinese_poster%29.png','from-red-600 via-orange-600 to-amber-500'),
  (31, 'Hero',                          2002, 'Action',   'Chinese',   'Movie', 'https://upload.wikimedia.org/wikipedia/en/0/08/Hero_poster.jpg',                    'from-red-600 via-orange-600 to-amber-500'),
  (32, 'In the Mood for Love',          2000, 'Romance',   'Chinese',   'Movie', 'https://upload.wikimedia.org/wikipedia/en/4/45/In_the_Mood_for_Love_movie.jpg',     'from-pink-500 via-rose-500 to-red-400'),
  (33, 'Crash Landing on You',          2019, 'Romance',   'Korean',    'Drama', 'https://upload.wikimedia.org/wikipedia/en/5/5e/Crash_Landing_on_You_poster.png',    'from-pink-500 via-rose-500 to-red-400'),
  (34, 'Squid Game',                    2021, 'Thriller',  'Korean',    'Drama', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Squid_Game_2021_vector_logo_english.svg/3840px-Squid_Game_2021_vector_logo_english.svg.png','from-zinc-600 via-slate-800 to-gray-900'),
  (35, 'Goblin: The Lonely and Great God', 2016, 'Romance','Korean',    'Drama', 'https://upload.wikimedia.org/wikipedia/en/6/68/Goblin_Poster.jpg',                'from-pink-500 via-rose-500 to-red-400'),
  (36, 'Itaewon Class',                 2020, 'Drama',     'Korean',    'Drama', 'https://upload.wikimedia.org/wikipedia/en/9/99/Itaewon_Class.jpg',                  'from-slate-500 via-stone-600 to-amber-700'),
  (37, 'The Glory',                     2022, 'Drama',     'Korean',    'Drama', 'https://upload.wikimedia.org/wikipedia/en/7/79/The_Glory_TV_series.jpg',            'from-slate-500 via-stone-600 to-amber-700'),
  (38, 'The Untamed',                   2019, 'Drama',     'Chinese',   'Drama', 'https://upload.wikimedia.org/wikipedia/en/3/31/Theuntamed.jpg',                   'from-slate-500 via-stone-600 to-amber-700'),
  (39, 'Love Between Fairy and Devil', 2022, 'Romance',   'Chinese',   'Drama', 'https://upload.wikimedia.org/wikipedia/en/f/f9/Love_Between_Fairy_and_Devil.jpg',  'from-pink-500 via-rose-500 to-red-400'),
  (40, 'Joy of Life',                   2019, 'Drama',     'Chinese',   'Drama', 'https://upload.wikimedia.org/wikipedia/en/6/68/Joy_of_Life_Chinese_drama_poster.jpg','from-slate-500 via-stone-600 to-amber-700'),
  (41, 'Word of Honor',                 2021, 'Drama',     'Chinese',   'Drama', 'https://upload.wikimedia.org/wikipedia/en/a/a1/Word_of_Honor_Poster.jpg',          'from-slate-500 via-stone-600 to-amber-700'),
  (42, 'Hidden Love',                   2023, 'Romance',   'Chinese',   'Drama', 'https://upload.wikimedia.org/wikipedia/en/3/3c/Hidden_Love_2023_TV_series.jpg',    'from-pink-500 via-rose-500 to-red-400')
ON CONFLICT (movie_id) DO NOTHING;
