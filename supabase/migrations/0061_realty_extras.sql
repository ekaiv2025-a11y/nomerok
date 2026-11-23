-- Новостройки, этап 3 (23.11.2026): история цены за м², уведомления о новых квартирах, дата добавления квартиры.
create table if not exists public.project_prices (
  slug        text not null,
  day         date not null,
  per_m2      numeric,          -- минимальная цена за м² среди свободных квартир (или из описания ЖК)
  from_price  numeric,          -- самая дешёвая квартира
  free_units  int,
  primary key (slug, day)
);
alter table public.project_prices enable row level security;

alter table public.dev_units add column if not exists created_at timestamptz not null default now();

create table if not exists public.re_alerts (
  id           uuid primary key default gen_random_uuid(),
  token        text unique not null,      -- для ссылки t.me/бот?start=al_<token>
  chat_id      bigint,                    -- появляется, когда человек нажал «Старт» в боте
  city         text,
  rooms        int,                       -- 0 — студия; null — любые
  max_price    numeric,
  project      text,                      -- конкретный ЖК (slug) или null — все
  deal         text not null default 'sale',
  active       boolean not null default false,
  created_at   timestamptz not null default now(),
  last_sent_at timestamptz
);
create index if not exists re_alerts_active on public.re_alerts (active) where active;
alter table public.re_alerts enable row level security;
