-- NomerOk — обновление 38: автоперевод анкет специалистов (ru/ka/en). Хранится отдельно, оригинал не меняется.
create table if not exists public.master_translations (
  master_id   uuid primary key references public.masters(id) on delete cascade,
  src         text not null default '',
  hash        text not null default '',
  data        jsonb not null default '{}',
  updated_at  timestamptz not null default now()
);
alter table public.master_translations enable row level security;
