create table public.training_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  start_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plan_weeks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.training_plans(id) on delete cascade,
  week_number integer not null check (week_number > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, week_number)
);

create table public.planned_sessions (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.plan_weeks(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 1 and 7),
  session_type public.session_type not null,
  name text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.session_blocks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.planned_sessions(id) on delete cascade,
  block_type public.block_type not null,
  order_index integer not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, order_index)
);

create table public.exercise_prescriptions (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.session_blocks(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  order_index integer not null,
  sets integer,
  reps integer,
  target_load numeric(8,2),
  target_duration_seconds integer,
  target_distance_meters integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (block_id, order_index)
);
