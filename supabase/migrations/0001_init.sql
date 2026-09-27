-- Nomerok — таблицы базы данных.
-- Как применить: Supabase → SQL Editor → New query → вставить весь файл → Run.

create extension if not exists "pgcrypto";

-- Мастера (и анкеты, и опубликованные профили — отличаются полем status)
create table if not exists public.masters (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  name             text not null,
  category         text not null,
  services         text not null default '',
  about            text not null default '',
  credentials      text not null default '',
  experience_years int,
  languages        text[] not null default '{}',
  price_from       int,
  price_unit       text not null default 'час',
  phone            text not null,
  telegram         text,
  whatsapp         boolean not null default true,
  photo_url        text,
  status           text not null default 'pending'
                   check (status in ('pending', 'published', 'hidden', 'rejected')),
  admin_note       text not null default '',
  consent_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists masters_status_idx on public.masters (status, category);

-- Заявки клиентов
create table if not exists public.requests (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,
  description text not null,
  when_text   text not null default '',
  name        text not null default '',
  phone       text not null,
  master_id   uuid references public.masters(id) on delete set null,
  status      text not null default 'new'
              check (status in ('new', 'in_work', 'done', 'spam')),
  admin_note  text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists requests_status_idx on public.requests (status, created_at desc);

-- Кто и когда открыл контакты мастера (основа для оплаты «10 заказов = 50₾»)
create table if not exists public.contact_views (
  id         bigint generated always as identity primary key,
  master_id  uuid not null references public.masters(id) on delete cascade,
  visitor    text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists contact_views_master_idx on public.contact_views (master_id, created_at desc);

-- Обновление updated_at при изменении мастера
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists masters_touch on public.masters;
create trigger masters_touch before update on public.masters
  for each row execute function public.touch_updated_at();

-- Безопасность: из браузера к таблицам доступа нет вообще.
-- Сайт работает с базой только со своего сервера через секретный ключ (service_role).
alter table public.masters       enable row level security;
alter table public.requests      enable row level security;
alter table public.contact_views enable row level security;
