-- NomerOk — обновление 28: начатые регистрации через бота (чтобы напомнить тем, кто не закончил анкету).
create table if not exists public.join_starts (
  chat_id     bigint primary key,
  phone       text,
  name        text,
  lang        text not null default 'ru',
  created_at  timestamptz not null default now(),
  opened_at   timestamptz,
  reminded_at timestamptz,
  done_at     timestamptz
);
alter table public.join_starts enable row level security;
