-- Nomerok — обновление 6: фото работ, где работает специалист, точка на карте.
-- Выполняется автоматически при выкладке (если задан DATABASE_URL) или вручную в SQL Editor.

alter table public.masters add column if not exists portfolio jsonb not null default '[]'::jsonb;
-- at_client — выезжаю к клиенту, at_place — принимаю у себя, both — и то и другое, online — онлайн
alter table public.masters add column if not exists work_mode text not null default 'at_client';
alter table public.masters add column if not exists place_address text not null default '';
alter table public.masters add column if not exists place_lat double precision;
alter table public.masters add column if not exists place_lng double precision;
alter table public.masters add column if not exists service_area text not null default '';
alter table public.masters add column if not exists work_hours text not null default '';
