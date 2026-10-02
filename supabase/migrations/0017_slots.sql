-- NomerOk — обновление 17: свободные окна специалиста (дата + время).
alter table public.masters add column if not exists slots jsonb not null default '[]'::jsonb;
