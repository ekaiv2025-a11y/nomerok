-- Nomerok — обновление 2: Telegram-бот, подтверждение номера, отклики на заявки, кабинет специалиста.
-- Как применить: Supabase → SQL Editor → New query → вставить весь файл → Run.
-- Можно запускать повторно — ничего не сломается.

-- Специалисты: язык, привязка Telegram, подтверждение номера, приём заявок
alter table public.masters add column if not exists lang text not null default 'ru';
alter table public.masters add column if not exists tg_chat_id bigint;
alter table public.masters add column if not exists tg_username text;
alter table public.masters add column if not exists tg_link_token text;
alter table public.masters add column if not exists phone_verified_at timestamptz;
alter table public.masters add column if not exists notify_requests boolean not null default true;

update public.masters set tg_link_token = encode(gen_random_bytes(12), 'hex') where tg_link_token is null;

create unique index if not exists masters_tg_link_token_idx on public.masters (tg_link_token);
create index if not exists masters_tg_chat_idx on public.masters (tg_chat_id);

-- Заявки: язык, Telegram клиента, сколько специалистов получили
alter table public.requests add column if not exists lang text not null default 'ru';
alter table public.requests add column if not exists client_tg_chat_id bigint;
alter table public.requests add column if not exists client_link_token text;
alter table public.requests add column if not exists sent_count int not null default 0;

update public.requests set client_link_token = encode(gen_random_bytes(12), 'hex') where client_link_token is null;
create unique index if not exists requests_client_link_token_idx on public.requests (client_link_token);

alter table public.requests drop constraint if exists requests_status_check;
alter table public.requests add constraint requests_status_check
  check (status in ('new', 'sent', 'taken', 'in_work', 'done', 'spam'));

-- Отклики специалистов на заявки (кнопка «Беру» в Telegram)
create table if not exists public.request_responses (
  id         bigint generated always as identity primary key,
  request_id uuid not null references public.requests(id) on delete cascade,
  master_id  uuid not null references public.masters(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (request_id, master_id)
);

-- Одноразовые ссылки для входа в кабинет специалиста
create table if not exists public.login_tokens (
  token      text primary key,
  master_id  uuid not null references public.masters(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.request_responses enable row level security;
alter table public.login_tokens      enable row level security;

-- Хранилище фотографий специалистов (публичное: фото показываются на сайте)
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;
