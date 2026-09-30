-- NomerOk — обновление 12: Telegram подключён и подтверждён, но номер в Telegram другой (например, украинский),
-- а в анкете оставили грузинский. Заявки такой специалист получает, отметки «Номер подтверждён» нет.
alter table public.masters add column if not exists tg_verified_at timestamptz;
