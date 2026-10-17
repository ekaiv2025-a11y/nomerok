-- NomerOk — обновление 26: дубли мест (одно место из двух источников) — ссылка на основную карточку.
alter table public.places add column if not exists dup_of text;
