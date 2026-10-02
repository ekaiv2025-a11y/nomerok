-- NomerOk — обновление 16: фото в заявке клиента («вот что сломалось»).
alter table public.requests add column if not exists photos text[] not null default '{}';
