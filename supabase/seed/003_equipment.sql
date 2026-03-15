insert into public.equipment (name, category)
values
  ('barbell', 'free_weights'),
  ('dumbbells', 'free_weights'),
  ('kettlebell', 'free_weights'),
  ('resistance_band', 'bands'),
  ('machine', 'machines'),
  ('bench', 'benches'),
  ('pull_up_bar', 'bodyweight_station'),
  ('treadmill', 'cardio_machines'),
  ('bike', 'cardio_machines'),
  ('rower', 'cardio_machines'),
  ('bodyweight', 'bodyweight')
on conflict (name) do nothing;
