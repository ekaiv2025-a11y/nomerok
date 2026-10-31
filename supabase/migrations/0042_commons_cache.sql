-- NomerOk — обновление 42: найденные фото Wikimedia Commons (запрос → фото), чтобы обложки статей не пропадали.
create table if not exists public.commons_cache (
  q          text primary key,
  data       jsonb,                 -- null — подходящего фото нет
  checked_at timestamptz not null default now()
);
alter table public.commons_cache enable row level security;
