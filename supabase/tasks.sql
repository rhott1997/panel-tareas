create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  status text not null default 'backlog' check (status in ('backlog', 'in_progress', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_tasks_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

alter table public.tasks enable row level security;

create policy "Users can view their tasks" on public.tasks
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their tasks" on public.tasks
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their tasks" on public.tasks
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their tasks" on public.tasks
  for delete
  using (auth.uid() = user_id);
