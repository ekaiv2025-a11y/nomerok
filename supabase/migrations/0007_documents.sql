-- Nomerok — обновление 7: документы специалистов (дипломы, сертификаты, лицензии).
-- Выполняется автоматически при выкладке (если задан DATABASE_URL) или вручную в SQL Editor.

alter table public.masters add column if not exists documents jsonb not null default '[]'::jsonb;

-- Закрытое хранилище: файлы открываются только по временной ссылке, которую выдаёт сайт
insert into storage.buckets (id, name, public)
values ('docs', 'docs', false)
on conflict (id) do nothing;
