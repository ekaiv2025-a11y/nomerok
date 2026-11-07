-- NomerOk — обновление 51: мероприятие специалиста. Ведущие, музыканты, фотографы, тренеры публикуют свои события
-- в афишу из кабинета; событие показывается в их анкете, а в событии — карточка организатора.
alter table public.events add column if not exists master_id uuid references public.masters(id) on delete set null;
create index if not exists events_master on public.events (master_id) where master_id is not null;
