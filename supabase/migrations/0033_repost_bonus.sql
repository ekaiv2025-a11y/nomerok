-- NomerOk — обновление 33: бонус за репост и подъём анкеты за сторис.
-- Специалист может дать бонус клиенту, который поделился его профилем (условия и проверка — на специалисте).
alter table public.referral_offers add column if not exists repost text not null default '';
alter table public.referral_offers add column if not exists repost_active boolean not null default false;

-- Специалист выложил свою карточку в сторис и прислал скриншот → после проверки анкета на 7 дней выше в каталоге.
create table if not exists public.story_boosts (
  id          uuid primary key default gen_random_uuid(),
  master_id   uuid not null references public.masters(id) on delete cascade,
  image_url   text not null,
  status      text not null default 'pending', -- pending | approved | rejected
  created_at  timestamptz not null default now(),
  decided_at  timestamptz,
  until       timestamptz
);
alter table public.story_boosts enable row level security;
create index if not exists story_boosts_master on public.story_boosts (master_id, created_at desc);
create index if not exists story_boosts_status on public.story_boosts (status);
