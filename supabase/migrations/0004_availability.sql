-- Nomerok — обновление 4: дополнительные направления и «в отпуске / не принимаю заявки».
-- Как применить: Supabase → SQL Editor → New query → вставить весь файл → Run.
-- Можно запускать повторно — ничего не сломается.

alter table public.masters add column if not exists extra_categories text[] not null default '{}';
alter table public.masters add column if not exists is_away boolean not null default false;
alter table public.masters add column if not exists away_until date;

create index if not exists masters_extra_categories_idx on public.masters using gin (extra_categories);
