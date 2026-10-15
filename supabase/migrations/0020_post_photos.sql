-- NomerOk — обновление 20: несколько фото в записи журнала (галерея).
alter table public.posts add column if not exists photos text[] not null default '{}';
