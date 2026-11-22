-- Карточки мест: меню, доставка, подписи к фото (интерьер, блюда, меню…) и откуда фото (22.11.2026)
alter table public.places add column if not exists menu_url text;
alter table public.places add column if not exists delivery text[] not null default '{}';
alter table public.places add column if not exists photo_kinds text[] not null default '{}';
alter table public.places add column if not exists photo_src text;
