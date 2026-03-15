insert into public.movement_patterns (name)
values
  ('squat'),
  ('hinge'),
  ('horizontal_push'),
  ('horizontal_pull'),
  ('vertical_push'),
  ('vertical_pull'),
  ('lunge'),
  ('carry'),
  ('rotation'),
  ('locomotion'),
  ('core_stability'),
  ('mobility')
on conflict (name) do nothing;
