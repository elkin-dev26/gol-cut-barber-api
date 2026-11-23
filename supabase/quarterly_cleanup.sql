create table if not exists public.system_settings (
  id integer primary key default 1 check (id = 1),
  auto_cleanup_enabled boolean not null default false,
  retention_months integer not null default 3 check (retention_months > 0),
  last_cleanup_at timestamptz
);

insert into public.system_settings (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.monthly_summaries (
  barbershop_id text not null,
  barber_id text not null,
  year_month date not null,
  total_appointments integer not null default 0,
  total_revenue numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  primary key (barbershop_id, barber_id, year_month),
  check (year_month = date_trunc('month', year_month)::date)
);

alter table public.appointments
  add column if not exists deleted_at timestamptz;

alter table public.system_settings enable row level security;

revoke all on public.system_settings from public, anon, authenticated;
grant select, update on public.system_settings to authenticated;
grant all on public.system_settings to service_role;

drop policy if exists "Developers can read system settings"
  on public.system_settings;
create policy "Developers can read system settings"
  on public.system_settings for select to authenticated
  using (public.current_staff_role() = 'developer');

drop policy if exists "Developers can update system settings"
  on public.system_settings;
create policy "Developers can update system settings"
  on public.system_settings for update to authenticated
  using (public.current_staff_role() = 'developer')
  with check (public.current_staff_role() = 'developer');

alter table public.monthly_summaries enable row level security;
revoke all on public.monthly_summaries from public, anon, authenticated;
grant all on public.monthly_summaries to service_role;

create or replace function public.run_quarterly_cleanup(
  force_run boolean default false
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  cleanup_enabled boolean;
  configured_retention_months integer;
  cutoff_timestamp timestamptz;
begin
  select auto_cleanup_enabled, retention_months
    into cleanup_enabled, configured_retention_months
  from public.system_settings
  where id = 1;

  if not found then
    raise exception 'The system_settings singleton row (id = 1) is missing';
  end if;

  if not coalesce(force_run, false) and not cleanup_enabled then
    return;
  end if;

  perform pg_advisory_xact_lock(hashtext('public.run_quarterly_cleanup'));

  cutoff_timestamp := now() - make_interval(months => configured_retention_months);

  insert into public.monthly_summaries (
    barbershop_id,
    barber_id,
    year_month,
    total_appointments,
    total_revenue
  )
  select
    a.tenant_id,
    a.booking_entity_id,
    date_trunc('month', a.appointment_date::timestamp)::date,
    count(*)::integer,
    coalesce(sum(a.price), 0)::numeric(14, 2)
  from public.appointments as a
  where a.status = 'completed'
    and a.deleted_at is null
    and a.appointment_date < cutoff_timestamp
  group by
    a.tenant_id,
    a.booking_entity_id,
    date_trunc('month', a.appointment_date::timestamp)::date
  on conflict (barbershop_id, barber_id, year_month) do update
  set total_appointments =
        public.monthly_summaries.total_appointments + excluded.total_appointments,
      total_revenue =
        public.monthly_summaries.total_revenue + excluded.total_revenue;

  delete from public.appointments
  where (
      status in ('completed', 'cancelled')
      and appointment_date < cutoff_timestamp
    )
    or deleted_at < cutoff_timestamp;

  update public.system_settings
  set last_cleanup_at = now()
  where id = 1;
end;
$$;

revoke all on function public.run_quarterly_cleanup(boolean)
  from public, anon, authenticated;
grant execute on function public.run_quarterly_cleanup(boolean)
  to service_role;

-- select cron.schedule(
--   'quarterly-appointment-cleanup',
--   '0 2 1 */3 *',
--   'select public.run_quarterly_cleanup(false);'
-- );
