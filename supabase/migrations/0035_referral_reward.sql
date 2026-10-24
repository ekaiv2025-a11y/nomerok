-- NomerOk — обновление 35: бонус тому, кто порекомендовал.
-- used_at — специалист отметил «друг пришёл» (уже было), reward_at — «бонус рекомендателю выдан».
alter table public.referrals add column if not exists reward_at timestamptz;
create index if not exists referrals_chat_idx on public.referrals (chat_id);
