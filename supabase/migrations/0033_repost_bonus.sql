-- NomerOk — обновление 33: бонус за репост.
-- Специалист может дать бонус клиенту, который поделился его профилем (условия и проверка — на специалисте).
alter table public.referral_offers add column if not exists repost text not null default '';
alter table public.referral_offers add column if not exists repost_active boolean not null default false;

