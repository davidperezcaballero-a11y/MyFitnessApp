create table public.training_zones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  zone_type public.zone_type not null,
  zone_name text not null,
  lower_bound numeric(10,2),
  upper_bound numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cardio_zone_distribution (
  id uuid primary key default gen_random_uuid(),
  cardio_session_id uuid not null references public.cardio_sessions(id) on delete cascade,
  zone_id uuid not null references public.training_zones(id) on delete cascade,
  duration_seconds integer not null check (duration_seconds >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cardio_session_id, zone_id)
);

create table public.metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  metric_type public.metric_type not null,
  value numeric(12,2) not null,
  period_start date not null,
  period_end date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.personal_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  record_type public.record_type not null,
  value numeric(12,2) not null,
  record_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
