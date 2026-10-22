-- NomerOk — обновление 29: посетители сайта (откуда пришли) и что ищут в поиске.
create table if not exists public.site_visits (
  day        date not null,
  visitor    text not null,
  source     text not null default 'прямой заход',
  path       text,
  created_at timestamptz not null default now(),
  primary key (day, visitor)
);
create index if not exists site_visits_created on public.site_visits (created_at);
alter table public.site_visits enable row level security;

create table if not exists public.search_log (
  id         bigserial primary key,
  q          text not null,
  cat        text,
  found      int not null default 0,
  visitor    text,
  created_at timestamptz not null default now()
);
create index if not exists search_log_created on public.search_log (created_at);
alter table public.search_log enable row level security;
