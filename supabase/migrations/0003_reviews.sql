-- Nomerok — обновление 3: отзывы, жалобы, напоминания клиентам после заявки.
-- Как применить: Supabase → SQL Editor → New query → вставить весь файл → Run.
-- Можно запускать повторно — ничего не сломается.

-- Заявки: чем закончилось и какие напоминания уже отправлены
alter table public.requests add column if not exists followup_at timestamptz;
alter table public.requests add column if not exists outcome text;
alter table public.requests add column if not exists outcome_master_id uuid references public.masters(id) on delete set null;
alter table public.requests add column if not exists outcome_at timestamptz;
alter table public.requests add column if not exists review_invited_at timestamptz;

-- Отзывы: только от людей, подтверждённых через Telegram; публикуются после проверки
create table if not exists public.reviews (
  id             uuid primary key default gen_random_uuid(),
  master_id      uuid not null references public.masters(id) on delete cascade,
  request_id     uuid references public.requests(id) on delete set null,
  author_name    text not null default '',
  author_chat_id bigint not null,
  rating         int not null check (rating between 1 and 5),
  text           text not null default '',
  photos         text[] not null default '{}',
  status         text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  reply          text not null default '',
  reply_at       timestamptz,
  created_at     timestamptz not null default now(),
  unique (master_id, author_chat_id)
);
create index if not exists reviews_master_idx on public.reviews (master_id, status);

-- Жалобы на профили
create table if not exists public.complaints (
  id          uuid primary key default gen_random_uuid(),
  master_id   uuid references public.masters(id) on delete set null,
  master_name text not null default '',
  reason      text not null,
  text        text not null default '',
  contact     text not null default '',
  photos      text[] not null default '{}',
  status      text not null default 'new' check (status in ('new', 'in_review', 'resolved', 'rejected')),
  admin_note  text not null default '',
  created_at  timestamptz not null default now()
);

alter table public.reviews    enable row level security;
alter table public.complaints enable row level security;
