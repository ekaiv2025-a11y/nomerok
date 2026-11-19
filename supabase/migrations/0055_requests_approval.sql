-- Ручное одобрение заявок администратором: специалистам рассылаются только одобренные (решение владельца, 20.11.2026)
alter table public.requests add column if not exists approved_at timestamptz;
update public.requests set approved_at = created_at where approved_at is null;
