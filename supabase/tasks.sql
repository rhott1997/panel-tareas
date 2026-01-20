create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Users can view their tasks" on public.tasks
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their tasks" on public.tasks
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their tasks" on public.tasks
  for delete
  using (auth.uid() = user_id);
