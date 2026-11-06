-- NomerOk — обновление 48: анкеты, которые редакция составила по открытым данным (например, врачи с сайта клиники).
-- source_url — откуда взяты сведения; imported_at — когда добавлены. Связь с клиникой — через org_members (via = 'import').
-- Контакт такой анкеты — телефон клиники. Если специалист подтвердит анкету, imported_at можно обнулить.
alter table public.masters add column if not exists source_url text;
alter table public.masters add column if not exists imported_at timestamptz;
create unique index if not exists masters_source_url on public.masters (source_url) where source_url is not null;
