-- NomerOk — обновление 32: вход и регистрация через почту, Google и Facebook.
-- Аккаунт сайта. У каждого аккаунта есть «номер» num: из него получается внутренний id чата
-- (-(5e15 + num)) — с ним работают заявки, избранное и отзывы, а сообщения такому «чату» уходят на почту.
create table if not exists public.accounts (
  id             uuid primary key default gen_random_uuid(),
  num            bigserial unique,
  email          text unique,
  google_sub     text unique,
  facebook_id    text unique,
  name           text not null default '',
  lang           text not null default 'ru',
  created_at     timestamptz not null default now(),
  last_login_at  timestamptz
);
alter table public.accounts enable row level security;

-- Одноразовые коды входа по почте (хранится только хеш кода)
create table if not exists public.auth_codes (
  email          text primary key,
  hash           text not null,
  attempts       int not null default 0,
  sends          int not null default 1,
  first_sent_at  timestamptz not null default now(),
  expires_at     timestamptz not null
);
alter table public.auth_codes enable row level security;

-- Специалист: вход через аккаунт и почта для заявок
alter table public.masters add column if not exists account_id uuid references public.accounts(id) on delete set null;
alter table public.masters add column if not exists email text;
alter table public.masters add column if not exists email_verified_at timestamptz;
create index if not exists masters_account on public.masters (account_id);
