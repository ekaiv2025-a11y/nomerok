-- NomerOk — обновление 43: заявки по новостройкам (видит только владелец сайта, передаёт партнёрскому агентству).
create table if not exists public.project_leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  project     text,                  -- slug ЖК или null («подобрать вариант»)
  mode        text not null default 'this', -- this | other
  name        text not null,
  contact     text not null,         -- телефон или Telegram
  city        text,
  budget      text,
  rooms       text,
  goal        text,                  -- жить | сдавать | вложение
  comment     text,
  status      text not null default 'new', -- new | sent | closed
  visitor     text
);
alter table public.project_leads enable row level security;
