-- Default "Emergency" records that should already exist in the database.
--
-- Loaded automatically by initDb.ts every time the database is
-- initialized, but only while it does not exist

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
  ('Industrial accident', 6),
  ('Suspicion for anthrax or similar biological agents', 6);

INSERT INTO incident_statuses (name) VALUES
  ('Submitted'),
  ('Under investigation'),
  ('Rejected'),
  ('Help sent'),
  ('Resolved');
