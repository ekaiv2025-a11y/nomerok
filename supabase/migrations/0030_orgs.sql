-- NomerOk — обновление 30: аккаунты организаций (клиники, салоны, центры) и их команды.
alter table public.places add column if not exists invite_code text;
create unique index if not exists places_invite_code on public.places (invite_code) where invite_code is not null;
alter table public.places add column if not exists team_requests boolean not null default true;

create table if not exists public.org_members (
  place_id   text not null references public.places(id) on delete cascade,
  master_id  uuid not null references public.masters(id) on delete cascade,
  status     text not null default 'pending', -- pending — ждёт подтверждения организации; active — в команде
  via        text not null default 'invite',  -- invite — по ссылке организации; self — специалист сам попросился
  created_at timestamptz not null default now(),
  primary key (place_id, master_id)
);
create index if not exists org_members_master on public.org_members (master_id);
alter table public.org_members enable row level security;

alter table public.join_starts add column if not exists org_place_id text;
alter table public.requests add column if not exists org_place_id text;
