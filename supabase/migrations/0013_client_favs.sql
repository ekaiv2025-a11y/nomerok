-- NomerOk — обновление 13: избранные специалисты клиента (чтобы не терялись при смене телефона).
create table if not exists public.client_favs (
  chat_id    bigint not null,
  slug       text not null,
  created_at timestamptz not null default now(),
  primary key (chat_id, slug)
);
alter table public.client_favs enable row level security;
