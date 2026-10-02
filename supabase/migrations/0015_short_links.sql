-- NomerOk — обновление 15: короткая ссылка на профиль (nomerok.ge/anna) для шапки Instagram.
alter table public.masters add column if not exists short text;
create unique index if not exists masters_short_uniq on public.masters (lower(short)) where short is not null;
