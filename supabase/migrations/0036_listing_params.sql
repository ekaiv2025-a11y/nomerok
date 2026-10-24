-- NomerOk — обновление 36: подробные параметры объявлений (как на myhome.ge и больше), статистика и порядок по качеству.
alter table public.listings add column if not exists floor_n       int;          -- этаж
alter table public.listings add column if not exists floors_total  int;          -- этажей в доме
alter table public.listings add column if not exists rooms_total   int;          -- комнат всего
alter table public.listings add column if not exists bathrooms     int;          -- санузлов
alter table public.listings add column if not exists building      text;         -- new | old | construction
alter table public.listings add column if not exists condition     text;         -- new_renovation | renovated | old_renovation | white_frame | black_frame | green_frame | needs_renovation
alter table public.listings add column if not exists heating       text;         -- central | gas | electric | none
alter table public.listings add column if not exists parking       text;         -- underground | garage | yard | street | none
alter table public.listings add column if not exists amenities     text[] not null default '{}';
alter table public.listings add column if not exists deposit       numeric;      -- аренда: депозит
alter table public.listings add column if not exists min_months    int;          -- аренда: минимальный срок, мес.
alter table public.listings add column if not exists video         text;         -- ссылка на видео (YouTube, Instagram, TikTok)
alter table public.listings add column if not exists views         int not null default 0;
alter table public.listings add column if not exists contacts      int not null default 0;  -- нажали «Показать телефон» / «Написать»
alter table public.listings add column if not exists quality       int not null default 0;  -- заполненность 0–100
alter table public.listings add column if not exists rank_at       timestamptz;  -- порядок в списке: свежесть + бонус за заполненность
update public.listings set rank_at = coalesce(rank_at, updated_at, created_at);
create index if not exists listings_rank on public.listings (status, city, rank_at desc);

-- Счётчики одной командой (без гонок при одновременных просмотрах)
create or replace function public.listing_bump(lid uuid, field text) returns void language plpgsql as $$
begin
  if field = 'views' then update public.listings set views = views + 1 where id = lid;
  elsif field = 'contacts' then update public.listings set contacts = contacts + 1 where id = lid;
  end if;
end $$;
