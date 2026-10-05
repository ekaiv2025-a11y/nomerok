-- NomerOk — обновление 18: бонусы за рекомендацию.
-- Специалист сам задаёт бонус (другу и тому, кто порекомендовал) и сколько бонусов готов выдать.
-- Клиент получает личный код для друга; NomerOk в расчётах не участвует.
create table if not exists public.referral_offers (
  master_id  uuid primary key references public.masters(id) on delete cascade,
  active     boolean not null default true,
  friend     text not null,
  reward     text not null default '',
  max_uses   int not null default 10,
  prefix     text not null,
  since      timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.referral_offers enable row level security;

create table if not exists public.referrals (
  code       text primary key,
  master_id  uuid not null references public.masters(id) on delete cascade,
  name       text not null,
  chat_id    bigint,
  created_at timestamptz not null default now(),
  used_at    timestamptz
);
create index if not exists referrals_master_idx on public.referrals (master_id, created_at desc);
alter table public.referrals enable row level security;
