insert into public.mobility_routines (name, description)
values
  ('rutina cadera', 'Rutina breve para mejorar control y movilidad de cadera.'),
  ('rutina pre-running', 'Preparacion de cadera y core antes de correr.'),
  ('rutina tobillo-cadera', 'Secuencia para preparar tobillo, cadera y estabilidad.')
on conflict (name) do nothing;

insert into public.mobility_routine_exercises (routine_id, exercise_id, order_index, default_duration_seconds)
select mr.id, e.id, rel.order_index, rel.default_duration_seconds
from (
  values
    ('rutina cadera', 'hip airplane', 1, 60),
    ('rutina cadera', 'wall hip internal rotation', 2, 60),
    ('rutina cadera', 'couch stretch', 3, 90),
    ('rutina pre-running', 'dead bug', 1, 60),
    ('rutina pre-running', 'hip airplane', 2, 60),
    ('rutina pre-running', 'couch stretch', 3, 60),
    ('rutina tobillo-cadera', 'wall hip internal rotation', 1, 60),
    ('rutina tobillo-cadera', 'hip airplane', 2, 60),
    ('rutina tobillo-cadera', 'dead bug', 3, 60)
) as rel(routine_name, exercise_name, order_index, default_duration_seconds)
join public.mobility_routines mr on mr.name = rel.routine_name
join public.exercises e on e.name = rel.exercise_name
on conflict do nothing;
