-- NomerOk — обновление 45: фото жилых комплексов (загружает владелец сайта: свои снимки или с разрешения застройщика/агентства).
create table if not exists public.project_photos (
  slug       text primary key,
  photos     jsonb not null default '[]'::jsonb,  -- ссылки на фото, первое — обложка
  credit     text,                                -- «Фото: застройщик Alliance Group» / «Фото: NomerOk»
  updated_at timestamptz not null default now()
);
alter table public.project_photos enable row level security;
