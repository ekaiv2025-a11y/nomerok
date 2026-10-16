-- NomerOk — обновление 24: отзывы о местах (через Telegram, публикуются после проверки).
create table if not exists public.place_reviews (
  id             uuid primary key default gen_random_uuid(),
  place_id       text not null references public.places(id) on delete cascade,
  rating         int not null check (rating between 1 and 5),
  text           text not null,
  author_name    text not null,
  author_chat_id bigint not null,
  photos         text[] not null default '{}',
  status         text not null default 'pending',
  created_at     timestamptz not null default now(),
  unique (place_id, author_chat_id)
);
create index if not exists place_reviews_idx on public.place_reviews (place_id, status, created_at desc);
alter table public.place_reviews enable row level security;
