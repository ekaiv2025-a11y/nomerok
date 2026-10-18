-- NomerOk — обновление 27: просмотры статей журнала (один человек в день = один просмотр).
create table if not exists public.article_views (
  slug    text not null,
  visitor text not null,
  day     date not null default current_date,
  primary key (slug, visitor, day)
);
alter table public.article_views enable row level security;

create table if not exists public.article_counts (
  slug  text primary key,
  views int not null default 0
);
alter table public.article_counts enable row level security;

create or replace function public.track_article_view(p_slug text, p_visitor text) returns void
language plpgsql security definer as $$
begin
  insert into public.article_views (slug, visitor, day) values (p_slug, p_visitor, current_date) on conflict do nothing;
  if found then
    insert into public.article_counts (slug, views) values (p_slug, 1)
    on conflict (slug) do update set views = public.article_counts.views + 1;
  end if;
end $$;
