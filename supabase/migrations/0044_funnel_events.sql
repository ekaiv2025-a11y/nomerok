-- NomerOk — обновление 44: действия на сайте (воронки заявки и регистрации, ответы «что помешало?»).
-- Без имён, телефонов и текстов из форм: только какие шаги прошёл человек.
create table if not exists public.funnel_events (
  id         bigserial primary key,
  created_at timestamptz not null default now(),
  visitor    text not null,
  sid        text not null,          -- вкладка/сессия
  ev         text not null,          -- view, start, submit, error, done, abandon, click, survey
  funnel     text,                   -- request, message, join, project
  path       text,
  props      jsonb
);
create index if not exists funnel_events_created_idx on public.funnel_events (created_at desc);
create index if not exists funnel_events_funnel_idx on public.funnel_events (funnel, created_at desc);
alter table public.funnel_events enable row level security;
