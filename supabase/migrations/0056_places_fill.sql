-- Заполненность карточки места: чтобы в списках сначала шли места с описанием, фото, часами и телефоном (22.11.2026)
alter table public.places add column if not exists fill smallint generated always as (
  (case when desc_ru is not null then 8 else 0 end)
  + (case when cardinality(photos) > 0 then 4 else 0 end)
  + (case when hours is not null then 2 else 0 end)
  + (case when cardinality(phones) > 0 then 1 else 0 end)
) stored;
create index if not exists places_cat_fill_idx on public.places (cat, fill desc, name);
