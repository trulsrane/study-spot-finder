-- Populära tider: snittet av trängselrapporterna per veckodag och timme för en plats.
-- security definer behövs eftersom RLS bara låter användare läsa sina egna rapporter.
-- Funktionen skickar bara tillbaka färdiga snitt, aldrig vem som rapporterat.
create or replace function public.popular_times(p_place_id uuid)
returns table(weekday int, hour int, avg_level numeric, report_count int)
language sql stable security definer
set search_path = public
as $$
  select extract(isodow from created_at at time zone 'Europe/Stockholm')::int as weekday, -- 1 = måndag, 7 = söndag
         extract(hour from created_at at time zone 'Europe/Stockholm')::int as hour,
         avg(case level when 'low' then 1 when 'medium' then 2 when 'high' then 3 end) as avg_level,
         count(*)::int as report_count
  from busyness_reports
  where place_id = p_place_id
    and level <> 'unknown'
    and created_at > now() - interval '8 weeks' -- bara senaste tiden, så gamla vanor inte hänger kvar
  group by 1, 2
  order by 1, 2;
$$;

revoke all on function public.popular_times(uuid) from public;
grant execute on function public.popular_times(uuid) to anon, authenticated;
