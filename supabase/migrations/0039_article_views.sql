-- NomerOk — обновление 39: у просмотров статей — откуда пришли и время (для статистики журнала).
alter table public.article_views add column if not exists source text not null default '';
alter table public.article_views add column if not exists created_at timestamptz default now();
create index if not exists article_views_day on public.article_views (day);

create or replace function public.track_article_view(p_slug text, p_visitor text, p_source text) returns void
language plpgsql security definer as $$
begin
  insert into public.article_views (slug, visitor, day, source, created_at) values (p_slug, p_visitor, current_date, coalesce(p_source, ''), now()) on conflict do nothing;
  if found then
    insert into public.article_counts (slug, views) values (p_slug, 1)
    on conflict (slug) do update set views = public.article_counts.views + 1;
  end if;
end $$;
