-- Nomerok — обновление 8: просмотры профилей (для статистики специалиста).
-- Один посетитель считается один раз в день. Сам IP не храним — только обезличенный код.

create table if not exists public.profile_views (
  id         bigint generated always as identity primary key,
  master_id  uuid not null references public.masters(id) on delete cascade,
  visitor    text not null,
  day        date not null default current_date,
  created_at timestamptz not null default now(),
  unique (master_id, visitor, day)
);
create index if not exists profile_views_master_day_idx on public.profile_views (master_id, day);
alter table public.profile_views enable row level security;

-- Когда специалисту последний раз отправили недельную сводку
alter table public.masters add column if not exists stats_sent_at timestamptz;
