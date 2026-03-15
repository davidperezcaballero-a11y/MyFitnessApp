insert into public.muscle_groups (name)
values
  ('chest'),
  ('back'),
  ('shoulders'),
  ('quads'),
  ('hamstrings'),
  ('glutes'),
  ('calves'),
  ('biceps'),
  ('triceps'),
  ('core'),
  ('hip_rotators'),
  ('adductors'),
  ('forearms')
on conflict (name) do nothing;
