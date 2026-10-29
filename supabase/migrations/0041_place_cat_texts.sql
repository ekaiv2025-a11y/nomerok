-- NomerOk — обновление 41: SEO-тексты разделов «Мест» (раздел + город): вступление, статья, вопросы.
create table if not exists public.place_cat_texts (
  key        text primary key,          -- "<city|all>:<cat>", например "batumi:health"
  data       jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.place_cat_texts enable row level security;
