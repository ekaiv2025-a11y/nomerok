-- Недвижимость: объекты могут размещать все — собственники, агенты, агентства, застройщики (23.11.2026).
-- Объявление может быть без анкеты специалиста: тогда автор — аккаунт или Telegram-чат (owner_chat_id) и контакты в самом объявлении.
alter table public.listings alter column master_id drop not null;
alter table public.listings add column if not exists owner_chat_id bigint;
alter table public.listings add column if not exists poster_kind text;      -- owner | agent | agency | developer
alter table public.listings add column if not exists contact_name text;
alter table public.listings add column if not exists contact_phone text;
alter table public.listings add column if not exists project_slug text;     -- ЖК из раздела «Новостройки», если квартира в нём
create index if not exists listings_owner on public.listings (owner_chat_id);
create index if not exists listings_project on public.listings (project_slug) where project_slug is not null;
