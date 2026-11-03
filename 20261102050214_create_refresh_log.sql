/*
# Create catalogue_refresh_log table

## Purpose
Records each successful TMDB catalogue refresh so the frontend can display a
small status badge showing when the catalogue was last updated and how many
titles were added. The edge function `tmdb-refresh` inserts one row per run.

## New Tables
- `catalogue_refresh_log`
  - `id` (int identity, primary key)
  - `refreshed_at` (timestamptz, default now()) — when the refresh completed.
  - `titles_after` (int) — total titles in the catalogue after this refresh.
  - `inserted` (int) — new titles added by this specific refresh.
  - `fetched` (int, nullable) — total items fetched from TMDB (incl. dupes).

## Security
- Enable RLS.
- Grant SELECT to anon, authenticated (frontend reads the log; it's non-sensitive metadata).
- INSERT/UPDATE/DELETE granted to service_role only (edge function writes it).
- SELECT policy `TO anon, authenticated USING (true)` — public metadata.
- No write policies for anon/authenticated — service_role bypasses RLS.

## Notes
1. The frontend reads the most recent row (`order by refreshed_at desc limit 1`).
2. Idempotent: uses `IF NOT EXISTS` so re-running this migration is safe.
*/
CREATE TABLE IF NOT EXISTS catalogue_refresh_log (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  refreshed_at timestamptz NOT NULL DEFAULT now(),
  titles_after integer NOT NULL DEFAULT 0,
  inserted integer NOT NULL DEFAULT 0,
  fetched integer
);

ALTER TABLE catalogue_refresh_log ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON catalogue_refresh_log TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON catalogue_refresh_log TO service_role;

DROP POLICY IF EXISTS "refresh_log_public_read" ON catalogue_refresh_log;
CREATE POLICY "refresh_log_public_read"
  ON catalogue_refresh_log FOR SELECT
  TO anon, authenticated USING (true);
