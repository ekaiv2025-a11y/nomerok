-- NomerOk — обновление 9: города. У специалиста и заявки есть город (по умолчанию Батуми).
alter table public.masters add column if not exists city text not null default 'batumi';
alter table public.requests add column if not exists city text not null default 'batumi';
create index if not exists masters_city_idx on public.masters (city);
