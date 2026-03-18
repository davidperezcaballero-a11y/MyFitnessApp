create type public.training_plan_status as enum ('active', 'inactive', 'finished');

alter table public.training_plans
add column status public.training_plan_status not null default 'active',
add column inactivated_at timestamptz,
add column finished_at timestamptz;

update public.training_plans
set status = 'active'
where status is null;

create index idx_training_plans_user_status
on public.training_plans(user_id, status);
