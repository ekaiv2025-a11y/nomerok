-- NomerOk — обновление 31: недвижимость — объявления риелторов и их Telegram-каналы.
create table if not exists public.listings (
  id            uuid primary key default gen_random_uuid(),
  master_id     uuid not null references public.masters(id) on delete cascade,
  city          text not null default 'batumi',
  deal          text not null default 'rent',      -- rent | sale | daily
  kind          text not null default 'apartment', -- apartment | house | commercial | land
  rooms         int,                                -- 0 — студия; число спален
  area          numeric,
  floor         text,
  price         numeric,
  currency      text not null default 'USD',
  district      text,
  address       text,
  lat           double precision,
  lng           double precision,
  title         text not null,
  description   text,
  photos        text[] not null default '{}',
  status        text not null default 'published',  -- draft | published | archived | hidden
  source        text not null default 'site',       -- site | telegram
  tg_key        text unique,                         -- канал:группа/сообщение — чтобы не дублировать пост
  tg_link       text,
  reports       int not null default 0,
  expires_at    timestamptz,
  expire_warned_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists listings_list on public.listings (status, city, deal, created_at desc);
create index if not exists listings_master on public.listings (master_id);
alter table public.listings enable row level security;

create table if not exists public.realty_channels (
  chat_id       bigint primary key,       -- id канала в Telegram
  master_id     uuid not null references public.masters(id) on delete cascade,
  title         text,
  username      text,
  auto_publish  boolean not null default true,
  connected_at  timestamptz not null default now()
);
alter table public.realty_channels enable row level security;
