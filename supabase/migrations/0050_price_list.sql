-- NomerOk — обновление 50: прайс специалиста — строки «услуга — цена от» ([{ name, from, unit }]).
-- На карточке в каталоге видны первые 3 строки, в анкете — весь список.
alter table public.masters add column if not exists price_list jsonb not null default '[]'::jsonb;
