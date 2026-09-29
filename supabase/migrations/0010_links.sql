-- NomerOk — обновление 10: ссылки специалиста (соцсети, Telegram-канал, сайт).
alter table public.masters add column if not exists links jsonb not null default '{}'::jsonb;
