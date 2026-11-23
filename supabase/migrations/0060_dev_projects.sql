-- Кабинет застройщика (23.11.2026): свой ЖК со всеми квартирами, планировками и ходом стройки.
-- Публикуется после проверки администратором. Может быть привязан к ЖК из каталога data/projects.json (linked_slug).
create table if not exists public.dev_projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  linked_slug   text,                      -- ЖК из каталога, если застройщик дополняет его
  owner_chat_id bigint,                    -- кто ведёт (Telegram-чат или аккаунт сайта)
  master_id     uuid,                      -- или анкета специалиста/агентства
  name          text not null,
  developer     text not null default '',
  city          text not null default 'batumi',
  district      text,
  address       text,
  lat           double precision,
  lng           double precision,
  status        text not null default 'building',   -- presale | building | done
  completion    text,
  floors        text,
  description   text,
  amenities     text[] not null default '{}',
  payment       text[] not null default '{}',
  photos        jsonb not null default '[]',        -- [{ url, kind, caption }]
  progress      jsonb not null default '[]',        -- [{ date, text, photos: [] }]
  contact_name  text,
  contact_phone text,
  mod_status    text not null default 'draft',      -- draft | pending | published | hidden
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists dev_projects_owner on public.dev_projects (owner_chat_id);
create index if not exists dev_projects_linked on public.dev_projects (linked_slug);
alter table public.dev_projects enable row level security;

create table if not exists public.dev_units (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.dev_projects(id) on delete cascade,
  building    text not null default '',   -- корпус / башня
  floor       int,
  number      text not null default '',
  rooms       int,                        -- 0 — студия, иначе число спален
  area        numeric,
  price       numeric,
  currency    text not null default 'USD',
  status      text not null default 'free',  -- free | reserved | sold
  plan_url    text,
  updated_at  timestamptz not null default now()
);
create index if not exists dev_units_project on public.dev_units (project_id);
alter table public.dev_units enable row level security;
