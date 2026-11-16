create table if not exists public.tenants (
  id text primary key,
  public_code text not null unique,
  name text not null,
  entity_type text not null default 'shop' check (entity_type in ('shop', 'independent')),
  license_status text not null default 'active' check (license_status in ('active', 'paused')),
  developer_blocked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_settings (
  id text primary key default 'global' check (id = 'global'),
  platform_name text not null default 'GOL CUT BARBER',
  support_whatsapp text not null default '573001234567',
  renewal_message text not null default 'Hola, deseo solicitar soporte y activar mi cuenta.',
  updated_at timestamptz not null default now()
);

insert into public.platform_settings (id)
values ('global')
on conflict (id) do nothing;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('developer', 'admin', 'barber', 'independent')),
  display_name text not null,
  username text unique,
  tenant_id text references public.tenants(id) on delete cascade,
  entity_id text,
  created_at timestamptz not null default now(),
  constraint user_profile_scope check (
    (role = 'developer' and tenant_id is null and entity_id is null)
    or (role = 'admin' and tenant_id is not null and entity_id = tenant_id)
    or (role = 'barber' and tenant_id is not null and entity_id is not null)
    or (role = 'independent' and tenant_id is not null and entity_id = tenant_id)
  )
);

create table if not exists public.booking_entities (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  entity_type text not null check (entity_type in ('barber', 'independent')),
  name text not null,
  user_id uuid unique references auth.users(id) on delete set null,
  contact_email text,
  whatsapp_phone text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id text primary key,
  tenant_id text not null references public.tenants(id),
  booking_entity_id text not null references public.booking_entities(id),
  customer_name text not null,
  service_name text not null,
  appointment_date date not null,
  appointment_time text not null,
  price numeric(12, 2) not null default 0,
  status text not null default 'confirmed' check (status in ('confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists appointments_tenant_date_idx
  on public.appointments (tenant_id, appointment_date);

create table if not exists public.booking_notifications (
  appointment_id text primary key references public.appointments(id) on delete cascade,
  status text not null default 'sending' check (status in ('sending', 'sent', 'partial', 'failed')),
  whatsapp_status text not null default 'skipped' check (whatsapp_status in ('skipped', 'sent', 'failed')),
  email_status text not null default 'skipped' check (email_status in ('skipped', 'sent', 'failed')),
  error_message text,
  updated_at timestamptz not null default now()
);

create table if not exists public.booking_rate_limits (
  key_hash text primary key,
  window_started_at timestamptz not null,
  request_count integer not null default 0
);

create or replace function public.current_staff_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.user_profiles where id = auth.uid()
$$;

create or replace function public.current_user_tenant_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from public.user_profiles where id = auth.uid()
$$;

create or replace function public.is_tenant_admin(target_tenant_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles
    where id = auth.uid()
      and role in ('admin', 'developer')
      and (role = 'developer' or tenant_id = target_tenant_id)
  )
$$;

create or replace function public.consume_booking_rate_limit(
  rate_key_hash text,
  max_requests integer,
  window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
begin
  insert into public.booking_rate_limits (key_hash, window_started_at, request_count)
  values (rate_key_hash, now(), 1)
  on conflict (key_hash) do update
  set
    window_started_at = case
      when public.booking_rate_limits.window_started_at <= now() - make_interval(secs => window_seconds) then now()
      else public.booking_rate_limits.window_started_at
    end,
    request_count = case
      when public.booking_rate_limits.window_started_at <= now() - make_interval(secs => window_seconds) then 1
      else public.booking_rate_limits.request_count + 1
    end
  returning request_count into current_count;

  return current_count <= max_requests;
end;
$$;

revoke all on function public.consume_booking_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_booking_rate_limit(text, integer, integer) to service_role;

alter table public.tenants enable row level security;
alter table public.platform_settings enable row level security;
alter table public.user_profiles enable row level security;
alter table public.booking_entities enable row level security;
alter table public.appointments enable row level security;
alter table public.booking_notifications enable row level security;
alter table public.booking_rate_limits enable row level security;

drop policy if exists "Public can read active tenants" on public.tenants;
create policy "Public can read active tenants"
  on public.tenants for select to anon, authenticated
  using (license_status = 'active' and not developer_blocked);

drop policy if exists "Public can read platform settings" on public.platform_settings;
create policy "Public can read platform settings"
  on public.platform_settings for select to anon, authenticated
  using (id = 'global');

drop policy if exists "Developers manage platform settings" on public.platform_settings;
create policy "Developers manage platform settings"
  on public.platform_settings for all to authenticated
  using (public.current_staff_role() = 'developer')
  with check (public.current_staff_role() = 'developer');

drop policy if exists "Staff can read their tenant" on public.tenants;
create policy "Staff can read their tenant"
  on public.tenants for select to authenticated
  using (
    public.current_staff_role() = 'developer'
    or id = public.current_user_tenant_id()
  );

drop policy if exists "Developers manage tenants" on public.tenants;
create policy "Developers manage tenants"
  on public.tenants for all to authenticated
  using (public.current_staff_role() = 'developer')
  with check (public.current_staff_role() = 'developer');

drop policy if exists "Staff can read permitted profiles" on public.user_profiles;
create policy "Staff can read permitted profiles"
  on public.user_profiles for select to authenticated
  using (
    id = auth.uid()
    or public.current_staff_role() = 'developer'
    or (public.current_staff_role() = 'admin' and tenant_id = public.current_user_tenant_id())
  );

drop policy if exists "Staff can read permitted booking entities" on public.booking_entities;
create policy "Staff can read permitted booking entities"
  on public.booking_entities for select to authenticated
  using (
    public.current_staff_role() = 'developer'
    or (
      (user_id = auth.uid() or public.is_tenant_admin(tenant_id))
      and exists (
        select 1 from public.tenants
        where id = tenant_id
          and license_status = 'active'
          and not developer_blocked
      )
    )
  );

drop policy if exists "Staff can update permitted booking contacts" on public.booking_entities;
create policy "Staff can update permitted booking contacts"
  on public.booking_entities for update to authenticated
  using (
    public.current_staff_role() = 'developer'
    or (
      (user_id = auth.uid() or public.is_tenant_admin(tenant_id))
      and exists (
        select 1 from public.tenants
        where id = tenant_id
          and license_status = 'active'
          and not developer_blocked
      )
    )
  )
  with check (
    public.current_staff_role() = 'developer'
    or (
      (user_id = auth.uid() or public.is_tenant_admin(tenant_id))
      and exists (
        select 1 from public.tenants
        where id = tenant_id
          and license_status = 'active'
          and not developer_blocked
      )
    )
  );

drop policy if exists "Staff can read permitted appointments" on public.appointments;
create policy "Staff can read permitted appointments"
  on public.appointments for select to authenticated
  using (
    public.current_staff_role() = 'developer'
    or (
      exists (
        select 1 from public.user_profiles
        where id = auth.uid() and entity_id = booking_entity_id
      )
      or public.is_tenant_admin(tenant_id)
    ) and exists (
      select 1 from public.tenants
      where id = tenant_id
        and license_status = 'active'
        and not developer_blocked
    )
  );

revoke all on public.booking_notifications, public.booking_rate_limits from anon, authenticated;
grant select on public.tenants to anon, authenticated;
grant select on public.platform_settings to anon, authenticated;
grant select on public.user_profiles, public.booking_entities, public.appointments to authenticated;
grant update (contact_email, whatsapp_phone, updated_at) on public.booking_entities to authenticated;
grant all on public.tenants, public.user_profiles, public.booking_entities, public.appointments,
  public.booking_notifications, public.booking_rate_limits, public.platform_settings to service_role;
