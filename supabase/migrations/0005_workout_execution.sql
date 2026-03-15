create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planned_session_id uuid references public.planned_sessions(id) on delete set null,
  session_date date not null,
  started_at timestamptz,
  finished_at timestamptz,
  session_type public.session_type not null,
  training_location public.training_location,
  perceived_effort numeric(3,1),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  order_index integer not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, order_index)
);

create table public.strength_sets (
  id uuid primary key default gen_random_uuid(),
  session_exercise_id uuid not null references public.session_exercises(id) on delete cascade,
  set_number integer not null check (set_number > 0),
  reps integer not null check (reps >= 0),
  weight numeric(8,2),
  rpe numeric(3,1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_exercise_id, set_number)
);

create table public.cardio_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  duration_seconds integer not null check (duration_seconds >= 0),
  distance_meters integer,
  avg_heart_rate integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mobility_routines (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mobility_routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.mobility_routines(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  order_index integer not null,
  default_duration_seconds integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (routine_id, order_index)
);

create table public.mobility_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  routine_id uuid references public.mobility_routines(id) on delete set null,
  duration_seconds integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mobility_exercises (
  id uuid primary key default gen_random_uuid(),
  mobility_session_id uuid not null references public.mobility_sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  duration_seconds integer not null check (duration_seconds >= 0),
  order_index integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mobility_session_id, order_index)
);
