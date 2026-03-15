insert into public.exercises (name, exercise_type, movement_pattern_id, description)
select
  v.name,
  v.exercise_type::public.exercise_type,
  mp.id,
  v.description
from (
  values
    ('sentadilla', 'strength', 'squat', 'Patron basico de sentadilla con carga.'),
    ('press banca', 'strength', 'horizontal_push', 'Empuje horizontal con barra en banco.'),
    ('peso muerto rumano', 'strength', 'hinge', 'Bisagra de cadera enfocada en cadena posterior.'),
    ('dominadas', 'strength', 'vertical_pull', 'Traccion vertical con peso corporal.'),
    ('remo con barra', 'strength', 'horizontal_pull', 'Remo horizontal con barra.'),
    ('press militar', 'strength', 'vertical_push', 'Empuje vertical por encima de la cabeza.'),
    ('zancadas', 'strength', 'lunge', 'Patron unilateral de zancada.'),
    ('curl femoral', 'strength', 'hinge', 'Trabajo accesorio de isquiosurales.'),
    ('correr', 'cardio', 'locomotion', 'Carrera continua en exterior o cinta.'),
    ('caminar', 'cardio', 'locomotion', 'Caminata continua de baja intensidad.'),
    ('indoor bike', 'cardio', 'locomotion', 'Ciclismo en bicicleta estatica.'),
    ('rowing', 'cardio', 'locomotion', 'Trabajo aerobico en remo ergometro.'),
    ('hip airplane', 'mobility', 'mobility', 'Control de cadera y estabilidad rotacional.'),
    ('wall hip internal rotation', 'mobility', 'mobility', 'Movilidad de rotacion interna de cadera.'),
    ('couch stretch', 'mobility', 'mobility', 'Movilidad de flexores de cadera y cuadriceps.'),
    ('dead bug', 'mobility', 'core_stability', 'Control lumbopelvico y estabilidad central.')
) as v(name, exercise_type, movement_pattern_name, description)
join public.movement_patterns mp on mp.name = v.movement_pattern_name
on conflict (name) do nothing;
