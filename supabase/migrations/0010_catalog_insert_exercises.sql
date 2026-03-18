create policy "catalog_insert_exercises" on public.exercises
  for insert to authenticated
  with check (true);
