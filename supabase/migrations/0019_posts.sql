-- NomerOk — обновление 19: журнал — новости и статьи, которые админ публикует сам из админки.
create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  lead         text not null default '',
  body         text not null default '',
  rubric       text not null default 'news',
  emoji        text not null default '📰',
  cover_url    text,
  source_name  text,
  source_url   text,
  cats         text[] not null default '{}',
  status       text not null default 'draft',
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists posts_pub_idx on public.posts (status, published_at desc);
alter table public.posts enable row level security;
