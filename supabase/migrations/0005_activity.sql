-- Nomerok — обновление 5: активность специалистов и архив.
-- Как применить: Supabase → SQL Editor → New query → вставить весь файл → Run.
-- Можно запускать повторно — ничего не сломается.

-- Когда специалист последний раз был активен (бот, кабинет, отклик на заявку)
alter table public.masters add column if not exists last_active_at timestamptz not null default now();
-- Когда предупредили «вы давно не заходили»
alter table public.masters add column if not exists inactive_warned_at timestamptz;
-- Профиль в архиве: не показывается клиентам, возвращается одной кнопкой
alter table public.masters add column if not exists archived_at timestamptz;
alter table public.masters add column if not exists archived_reason text;
-- Сколько личных заявок подряд осталось без ответа
alter table public.masters add column if not exists missed_direct int not null default 0;

-- Личная заявка: когда проверили, ответил ли специалист
alter table public.requests add column if not exists direct_checked_at timestamptz;
