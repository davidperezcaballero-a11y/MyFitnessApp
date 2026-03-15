create index idx_profiles_user_id on public.profiles(user_id);
create index idx_goals_user_id on public.goals(user_id);
create index idx_training_plans_user_id on public.training_plans(user_id);
create index idx_user_equipment_user_id on public.user_equipment(user_id);

create index idx_plan_weeks_plan_id on public.plan_weeks(plan_id);
create index idx_planned_sessions_week_id on public.planned_sessions(week_id);
create index idx_session_blocks_session_id on public.session_blocks(session_id);
create index idx_exercise_prescriptions_block_id on public.exercise_prescriptions(block_id);

create index idx_workout_sessions_user_id on public.workout_sessions(user_id);
create index idx_workout_sessions_date on public.workout_sessions(session_date);
create index idx_session_exercises_session_id on public.session_exercises(session_id);
create index idx_strength_sets_session_exercise_id on public.strength_sets(session_exercise_id);
create index idx_cardio_sessions_session_id on public.cardio_sessions(session_id);
create index idx_mobility_sessions_session_id on public.mobility_sessions(session_id);

create index idx_training_zones_user_id on public.training_zones(user_id);
create index idx_metric_snapshots_user_period on public.metric_snapshots(user_id, period_start, period_end);
create index idx_personal_records_user_exercise on public.personal_records(user_id, exercise_id);
