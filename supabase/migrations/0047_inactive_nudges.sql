-- NomerOk — обновление 47: сколько напоминаний «как у вас дела?» получил молчащий специалист.
-- Архив — только после трёх напоминаний (решение владельца, 06.11.2026: специалистов мало, не терять их).
alter table public.masters add column if not exists inactive_nudges int not null default 0;
