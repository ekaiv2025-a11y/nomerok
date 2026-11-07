-- NomerOk — обновление 49: афиша городов. События собирает задача по расписанию (tkt.ge, biletebi.ge, Telegram-каналы)
-- или добавляют организаторы через форму (сначала на проверку). Прошедшие события уходят в архив автоматически:
-- страница афиши показывает только те, что ещё не закончились.
create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  city         text not null default 'batumi',
  kind         text not null default 'other',   -- concert | theatre | kids | festival | exhibition | party | sport | talk | other
  starts_at    timestamptz not null,
  ends_at      timestamptz,
  venue        text,
  address      text,
  price        text,
  url          text,                             -- где купить билет или подробности
  image        text,
  description  text,
  source       text,                             -- откуда взято (ссылка) или 'user'
  status       text not null default 'published', -- published | pending | rejected
  contact      text,                             -- контакт организатора (не публикуется)
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create unique index if not exists events_source on public.events (source) where source is not null and source <> 'user';
create index if not exists events_city_starts on public.events (city, starts_at);
alter table public.events enable row level security;
