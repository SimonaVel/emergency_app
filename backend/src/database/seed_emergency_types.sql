-- Default "Emergency" records that should already exist in the database.
--
-- These mirror the emergency types that used to be hardcoded in
-- lib/utils/parameters.dart (Parameters.emergencyTypes), now moved into
-- the database as the source of truth.
--
-- Loaded automatically by initDb.ts every time the database is
-- initialized, but only while the `emergencies` table is still empty,
-- so restarting the backend won't create duplicate rows.

INSERT INTO emergencies (name) VALUES
  ('Other'),
  ('Medical emergency'),
  ('Natural disaster'),
  ('Abuse'),
  ('Minor missing'),
  ('Catastrophic event');
