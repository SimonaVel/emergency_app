-- Default "Emergency" records that should already exist in the database.
--
-- These mirror the emergency types that used to be hardcoded in
-- lib/utils/parameters.dart (Parameters.emergencyTypes), now moved into
-- the database as the source of truth.
--
-- Loaded automatically by initDb.ts every time the database is
-- initialized, but only while the `emergencies` table is still empty,
-- so restarting the backend won't create duplicate rows.

INSERT INTO emergency_types (name) VALUES
  ('Other'),
  ('Medical emergency'),
  ('Natural disaster'),
  ('Abuse'),
  ('Minor missing'),
  ('Catastrophic event');


INSERT INTO emergencies (name, emergency_type_id) VALUES
  ('Other', 1), 
  ('Death', 2),
  ('Lack of breathing', 2),
  ('Critical physical trauma w blood loss', 2),
  ('Severe bleeding', 2),
  ('Burns', 2),
  ('Earthquake', 3),
  ('Flood', 3),
  ('Fire', 3),
  ('Snow storm', 3),
  ('Hurricane', 3),
  ('Domestic violence', 4),
  ('Child abuse', 4),
  ('Radiation', 6),
  ('Road traffic accident', 6),
  ('RadiIndustrial accident', 6),
  ('Suspicion for anthrax or similar biological agents', 6);
