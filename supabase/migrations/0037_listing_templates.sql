-- NomerOk — обновление 37: шаблоны объявлений риелтора (текст с подстановками и типовые поля).
create table if not exists public.listing_templates (
  id          uuid primary key default gen_random_uuid(),
  master_id   uuid not null references public.masters(id) on delete cascade,
  name        text not null,
  data        jsonb not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists listing_templates_master on public.listing_templates (master_id, created_at);
alter table public.listing_templates enable row level security;
