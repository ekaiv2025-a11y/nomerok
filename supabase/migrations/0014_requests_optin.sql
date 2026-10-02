-- NomerOk — обновление 14: общие заявки получают только специалисты, которые сами на них подписались.
alter table public.masters alter column notify_requests set default false;
-- Однократно выключаем у всех (делается один раз: отметка в служебной таблице)
create table if not exists public._nm_once (key text primary key, done_at timestamptz not null default now());
do $$
begin
  if not exists (select 1 from public._nm_once where key = 'requests_optin') then
    update public.masters set notify_requests = false;
    insert into public._nm_once (key) values ('requests_optin');
  end if;
end $$;
alter table public._nm_once enable row level security;
