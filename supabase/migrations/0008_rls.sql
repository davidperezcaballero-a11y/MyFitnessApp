alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.training_preferences enable row level security;
alter table public.user_equipment enable row level security;
alter table public.training_plans enable row level security;
alter table public.plan_weeks enable row level security;
alter table public.planned_sessions enable row level security;
alter table public.session_blocks enable row level security;
alter table public.exercise_prescriptions enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.session_exercises enable row level security;
alter table public.strength_sets enable row level security;
alter table public.cardio_sessions enable row level security;
alter table public.mobility_sessions enable row level security;
alter table public.mobility_exercises enable row level security;
alter table public.training_zones enable row level security;
alter table public.cardio_zone_distribution enable row level security;
alter table public.metric_snapshots enable row level security;
alter table public.personal_records enable row level security;

alter table public.movement_patterns enable row level security;
alter table public.muscle_groups enable row level security;
alter table public.equipment enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_muscle_group enable row level security;
alter table public.exercise_equipment enable row level security;
alter table public.mobility_routines enable row level security;
alter table public.mobility_routine_exercises enable row level security;

create policy "profiles_owner_all" on public.profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "goals_owner_all" on public.goals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "training_preferences_owner_all" on public.training_preferences
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_equipment_owner_all" on public.user_equipment
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "training_plans_owner_all" on public.training_plans
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "plan_weeks_owner_all" on public.plan_weeks
  for all
  using (
    exists (
      select 1
      from public.training_plans tp
      where tp.id = plan_weeks.plan_id
        and tp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.training_plans tp
      where tp.id = plan_weeks.plan_id
        and tp.user_id = auth.uid()
    )
  );

create policy "planned_sessions_owner_all" on public.planned_sessions
  for all
  using (
    exists (
      select 1
      from public.plan_weeks pw
      join public.training_plans tp on tp.id = pw.plan_id
      where pw.id = planned_sessions.week_id
        and tp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.plan_weeks pw
      join public.training_plans tp on tp.id = pw.plan_id
      where pw.id = planned_sessions.week_id
        and tp.user_id = auth.uid()
    )
  );

create policy "session_blocks_owner_all" on public.session_blocks
  for all
  using (
    exists (
      select 1
      from public.planned_sessions ps
      join public.plan_weeks pw on pw.id = ps.week_id
      join public.training_plans tp on tp.id = pw.plan_id
      where ps.id = session_blocks.session_id
        and tp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.planned_sessions ps
      join public.plan_weeks pw on pw.id = ps.week_id
      join public.training_plans tp on tp.id = pw.plan_id
      where ps.id = session_blocks.session_id
        and tp.user_id = auth.uid()
    )
  );

create policy "exercise_prescriptions_owner_all" on public.exercise_prescriptions
  for all
  using (
    exists (
      select 1
      from public.session_blocks sb
      join public.planned_sessions ps on ps.id = sb.session_id
      join public.plan_weeks pw on pw.id = ps.week_id
      join public.training_plans tp on tp.id = pw.plan_id
      where sb.id = exercise_prescriptions.block_id
        and tp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.session_blocks sb
      join public.planned_sessions ps on ps.id = sb.session_id
      join public.plan_weeks pw on pw.id = ps.week_id
      join public.training_plans tp on tp.id = pw.plan_id
      where sb.id = exercise_prescriptions.block_id
        and tp.user_id = auth.uid()
    )
  );

create policy "workout_sessions_owner_all" on public.workout_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "session_exercises_owner_all" on public.session_exercises
  for all
  using (
    exists (
      select 1
      from public.workout_sessions ws
      where ws.id = session_exercises.session_id
        and ws.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.workout_sessions ws
      where ws.id = session_exercises.session_id
        and ws.user_id = auth.uid()
    )
  );

create policy "strength_sets_owner_all" on public.strength_sets
  for all
  using (
    exists (
      select 1
      from public.session_exercises se
      join public.workout_sessions ws on ws.id = se.session_id
      where se.id = strength_sets.session_exercise_id
        and ws.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.session_exercises se
      join public.workout_sessions ws on ws.id = se.session_id
      where se.id = strength_sets.session_exercise_id
        and ws.user_id = auth.uid()
    )
  );

create policy "cardio_sessions_owner_all" on public.cardio_sessions
  for all
  using (
    exists (
      select 1
      from public.workout_sessions ws
      where ws.id = cardio_sessions.session_id
        and ws.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.workout_sessions ws
      where ws.id = cardio_sessions.session_id
        and ws.user_id = auth.uid()
    )
  );

create policy "mobility_sessions_owner_all" on public.mobility_sessions
  for all
  using (
    exists (
      select 1
      from public.workout_sessions ws
      where ws.id = mobility_sessions.session_id
        and ws.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.workout_sessions ws
      where ws.id = mobility_sessions.session_id
        and ws.user_id = auth.uid()
    )
  );

create policy "mobility_exercises_owner_all" on public.mobility_exercises
  for all
  using (
    exists (
      select 1
      from public.mobility_sessions ms
      join public.workout_sessions ws on ws.id = ms.session_id
      where ms.id = mobility_exercises.mobility_session_id
        and ws.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.mobility_sessions ms
      join public.workout_sessions ws on ws.id = ms.session_id
      where ms.id = mobility_exercises.mobility_session_id
        and ws.user_id = auth.uid()
    )
  );

create policy "training_zones_owner_all" on public.training_zones
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "cardio_zone_distribution_owner_all" on public.cardio_zone_distribution
  for all
  using (
    exists (
      select 1
      from public.cardio_sessions cs
      join public.workout_sessions ws on ws.id = cs.session_id
      where cs.id = cardio_zone_distribution.cardio_session_id
        and ws.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.cardio_sessions cs
      join public.workout_sessions ws on ws.id = cs.session_id
      where cs.id = cardio_zone_distribution.cardio_session_id
        and ws.user_id = auth.uid()
    )
  );

create policy "metric_snapshots_owner_all" on public.metric_snapshots
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "personal_records_owner_all" on public.personal_records
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "catalog_read_movement_patterns" on public.movement_patterns
  for select to authenticated
  using (true);

create policy "catalog_read_muscle_groups" on public.muscle_groups
  for select to authenticated
  using (true);

create policy "catalog_read_equipment" on public.equipment
  for select to authenticated
  using (true);

create policy "catalog_read_exercises" on public.exercises
  for select to authenticated
  using (true);

create policy "catalog_read_exercise_muscle_group" on public.exercise_muscle_group
  for select to authenticated
  using (true);

create policy "catalog_read_exercise_equipment" on public.exercise_equipment
  for select to authenticated
  using (true);

create policy "catalog_read_mobility_routines" on public.mobility_routines
  for select to authenticated
  using (true);

create policy "catalog_read_mobility_routine_exercises" on public.mobility_routine_exercises
  for select to authenticated
  using (true);
