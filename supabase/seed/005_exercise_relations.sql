insert into public.exercise_muscle_group (exercise_id, muscle_group_id)
select e.id, mg.id
from (
  values
    ('sentadilla', 'quads'),
    ('sentadilla', 'glutes'),
    ('press banca', 'chest'),
    ('press banca', 'triceps'),
    ('press banca', 'shoulders'),
    ('peso muerto rumano', 'hamstrings'),
    ('peso muerto rumano', 'glutes'),
    ('dominadas', 'back'),
    ('dominadas', 'biceps'),
    ('remo con barra', 'back'),
    ('remo con barra', 'biceps'),
    ('press militar', 'shoulders'),
    ('press militar', 'triceps'),
    ('zancadas', 'quads'),
    ('zancadas', 'glutes'),
    ('curl femoral', 'hamstrings'),
    ('correr', 'quads'),
    ('correr', 'calves'),
    ('caminar', 'quads'),
    ('caminar', 'calves'),
    ('indoor bike', 'quads'),
    ('rowing', 'back'),
    ('rowing', 'core'),
    ('hip airplane', 'glutes'),
    ('hip airplane', 'hip_rotators'),
    ('wall hip internal rotation', 'hip_rotators'),
    ('couch stretch', 'quads'),
    ('couch stretch', 'hip_rotators'),
    ('dead bug', 'core')
) as rel(exercise_name, muscle_group_name)
join public.exercises e on e.name = rel.exercise_name
join public.muscle_groups mg on mg.name = rel.muscle_group_name
on conflict do nothing;

insert into public.exercise_equipment (exercise_id, equipment_id)
select e.id, eq.id
from (
  values
    ('sentadilla', 'barbell'),
    ('press banca', 'barbell'),
    ('press banca', 'bench'),
    ('peso muerto rumano', 'barbell'),
    ('dominadas', 'pull_up_bar'),
    ('remo con barra', 'barbell'),
    ('press militar', 'barbell'),
    ('zancadas', 'dumbbells'),
    ('curl femoral', 'machine'),
    ('correr', 'bodyweight'),
    ('caminar', 'bodyweight'),
    ('indoor bike', 'bike'),
    ('rowing', 'rower'),
    ('hip airplane', 'bodyweight'),
    ('wall hip internal rotation', 'bodyweight'),
    ('couch stretch', 'bodyweight'),
    ('dead bug', 'bodyweight')
) as rel(exercise_name, equipment_name)
join public.exercises e on e.name = rel.exercise_name
join public.equipment eq on eq.name = rel.equipment_name
on conflict do nothing;
