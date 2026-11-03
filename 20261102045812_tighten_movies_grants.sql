/*
# Tighten movies table grants (least privilege)

## Purpose
Revoke default INSERT/UPDATE/DELETE privileges that Supabase assigns to
`anon`/`authenticated` on new tables. The browser client should only ever
read the catalogue; writes are performed server-side by the `tmdb-refresh`
edge function using the `service_role` key (which bypasses RLS).

## Security changes
- REVOKE INSERT, UPDATE, DELETE on `movies` FROM anon, authenticated.
- Keep: GRANT SELECT TO anon, authenticated (catalogue is public read-only).
- Keep: GRANT INSERT, UPDATE, DELETE TO service_role (edge function writes).
- No policy changes — RLS already denies writes from anon/authenticated
  because no INSERT/UPDATE/DELETE policies exist for those roles.
*/
REVOKE INSERT, UPDATE, DELETE ON movies FROM anon;
REVOKE INSERT, UPDATE, DELETE ON movies FROM authenticated;
