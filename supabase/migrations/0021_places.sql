-- NomerOk — обновление 21: «Места» — организации города (кафе, сервисы, магазины…).
-- Основа — открытые данные OpenStreetMap / Overture Maps (с указанием источника) и ручная сверка.
create table if not exists public.places (
  id                text primary key,
  slug              text not null unique,
  name              text not null,
  name_en           text,
  name_ka           text,
  cat               text not null,
  sub               text,
  addr              text,
  lat               double precision,
  lng               double precision,
  phones            text[] not null default '{}',
  site              text,
  ig                text,
  socials           text[] not null default '{}',
  email             text,
  hours             text,
  desc_ru           text,
  desc_en           text,
  src               text,
  links             text[] not null default '{}',
  area              text not null default 'batumi',
  city              text not null default 'batumi',
  status            text not null default 'published',
  photos            text[] not null default '{}',
  checked           text,
  edited            boolean not null default false,
  claim_chat_id     bigint,
  claim_at          timestamptz,
  owner_chat_id     bigint,
  owner_name        text,
  owner_verified_at timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists places_list_idx on public.places (status, cat);
create index if not exists places_claim_idx on public.places (claim_chat_id);
alter table public.places enable row level security;

-- Подборки в журнале: список мест в записи
alter table public.posts add column if not exists place_ids text[] not null default '{}';
