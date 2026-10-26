-- NomerOk — обновление 40: уточнения направления, выбранные специалистом (интерьерная съёмка, репортаж, маникюр…).
alter table public.masters add column if not exists subcats text[] not null default '{}';
