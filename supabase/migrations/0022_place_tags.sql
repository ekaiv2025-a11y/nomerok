-- NomerOk — обновление 22: признаки мест для подборок (вид на море, терраса, банкетный зал…) и отметка о закрытии.
alter table public.places add column if not exists tags text[] not null default '{}';
alter table public.places add column if not exists work_status text;
