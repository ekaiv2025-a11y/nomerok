-- NomerOk — обновление 11: кому из найденных в чатах специалистов уже написали приглашение.
create table if not exists public.outreach (
  tg_user_id text primary key,
  name       text not null default '',
  category   text not null default '',
  status     text not null default 'sent', -- sent | skip
  created_at timestamptz not null default now()
);
alter table public.outreach enable row level security;
