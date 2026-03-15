create extension if not exists pgcrypto;

create type public.exercise_type as enum ('strength', 'cardio', 'mobility');
create type public.session_type as enum ('strength', 'cardio', 'mobility', 'mixed');
create type public.block_type as enum ('strength', 'cardio', 'mobility');
create type public.training_location as enum ('home', 'gym', 'outdoor', 'travel');
create type public.goal_type as enum ('weight_loss', 'muscle_gain', 'performance', 'consistency', 'mobility');
create type public.units_system as enum ('metric', 'imperial');
create type public.zone_type as enum ('heart_rate', 'pace', 'power');
create type public.metric_type as enum (
  'strength_volume',
  'cardio_duration',
  'cardio_distance',
  'mobility_duration',
  'weekly_sessions',
  'adherence'
);
create type public.record_type as enum (
  'max_weight',
  'max_reps',
  'best_volume',
  'best_time',
  'best_distance'
);
