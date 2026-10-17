-- NomerOk — обновление 25: отметка «искали координаты по адресу» (чтобы не повторять неудачные поиски).
alter table public.places add column if not exists geo_tried boolean not null default false;
