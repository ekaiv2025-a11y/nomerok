-- Что искали: в каком городе и сколько нашлось по всей Грузии (чтобы «никого не нашли» не путать с «нет в этом городе»)
alter table public.search_log add column if not exists city text;
alter table public.search_log add column if not exists found_all int;
