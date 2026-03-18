create policy "catalog_insert_exercise_muscle_group" on public.exercise_muscle_group
  for insert to authenticated
  with check (true);

create policy "catalog_insert_exercise_equipment" on public.exercise_equipment
  for insert to authenticated
  with check (true);

create policy "catalog_delete_exercises" on public.exercises
  for delete to authenticated
  using (true);
