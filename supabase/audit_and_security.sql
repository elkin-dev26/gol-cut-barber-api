alter table public.appointments
  add column if not exists deleted_at timestamptz;

create table if not exists public.system_settings (
  id integer primary key default 1 check (id = 1),
  auto_cleanup_enabled boolean not null default false,
  production_shield_enabled boolean not null default false,
  retention_months integer not null default 3 check (retention_months > 0),
  last_cleanup_at timestamptz
);
insert into public.system_settings (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id text,
  actor_name text not null,
  actor_role text not null,
  action_type text not null,
  details_before_after jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.audit_logs
  drop constraint if exists audit_logs_tenant_id_fkey;

create index if not exists audit_logs_tenant_created_at_idx
  on public.audit_logs (tenant_id, created_at desc);

alter table public.system_settings
  add column if not exists production_shield_enabled boolean not null default false;

create unique index if not exists appointments_active_slot_unique_idx
  on public.appointments (booking_entity_id, appointment_date, appointment_time)
  where status <> 'cancelled'
    and deleted_at is null;

alter table public.tenants
  add column if not exists expires_at timestamptz,
  add column if not exists is_indefinite boolean not null default false;

alter table public.booking_entities
  add column if not exists expires_at timestamptz,
  add column if not exists is_indefinite boolean not null default false,
  add column if not exists password_changed_at timestamptz,
  add column if not exists last_active_at timestamptz;

alter table public.user_profiles
  add column if not exists password_changed_at timestamptz,
  add column if not exists last_active_at timestamptz;

update public.booking_entities
set expires_at = coalesce(billing_cycle_started_at, created_at, now())
  + make_interval(days => coalesce(billing_cycle_days, 30))
where expires_at is null and not is_indefinite;

update public.tenants
set expires_at = now() + interval '30 days'
where expires_at is null and not is_indefinite;

update public.tenants as tenant
set
  expires_at = entity.expires_at,
  is_indefinite = entity.is_indefinite
from public.booking_entities as entity
where tenant.id = entity.tenant_id
  and entity.entity_type = 'independent';

update public.user_profiles
set
  password_changed_at = coalesce(password_changed_at, created_at),
  last_active_at = coalesce(last_active_at, created_at);

update public.booking_entities as entity
set
  password_changed_at = coalesce(entity.password_changed_at, profile.password_changed_at),
  last_active_at = coalesce(entity.last_active_at, profile.last_active_at)
from public.user_profiles as profile
where profile.id = entity.user_id;

update public.booking_entities
set
  password_changed_at = coalesce(password_changed_at, created_at),
  last_active_at = coalesce(last_active_at, created_at)
where user_id is null;

alter table public.tenants
  alter column expires_at set default (now() + interval '30 days');

alter table public.booking_entities
  alter column expires_at set default (now() + interval '30 days');

create or replace function public.renew_subscription(
  target_kind text,
  target_id text,
  subscription_days integer,
  make_indefinite boolean
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  updated_entity public.booking_entities%rowtype;
  updated_tenant public.tenants%rowtype;
begin
  if target_kind not in ('tenant', 'booking_entity') then
    raise exception 'Unsupported subscription target';
  end if;
  if not make_indefinite and (
    subscription_days is null
    or subscription_days < 1
    or subscription_days > 3650
  ) then
    raise exception 'Invalid subscription duration';
  end if;

  if target_kind = 'tenant' then
    update public.tenants
    set
      expires_at = case
        when make_indefinite then null
        else greatest(coalesce(expires_at, now()), now())
          + make_interval(days => subscription_days)
      end,
      is_indefinite = make_indefinite
    where id = target_id
    returning * into updated_tenant;
    if not found then
      raise exception 'Tenant not found';
    end if;
    return to_jsonb(updated_tenant);
  end if;

  update public.booking_entities
  set
    expires_at = case
      when make_indefinite then null
      else greatest(coalesce(expires_at, now()), now())
        + make_interval(days => subscription_days)
    end,
    is_indefinite = make_indefinite,
    updated_at = now()
  where id = target_id
  returning * into updated_entity;
  if not found then
    raise exception 'Booking entity not found';
  end if;

  if updated_entity.entity_type = 'independent' then
    update public.tenants
    set expires_at = updated_entity.expires_at,
        is_indefinite = updated_entity.is_indefinite
    where id = updated_entity.tenant_id
      and entity_type = 'independent';
    if not found then
      raise exception 'Independent tenant not found';
    end if;
  end if;

  return to_jsonb(updated_entity);
end;
$$;

revoke all on function public.renew_subscription(text, text, integer, boolean)
  from public, anon, authenticated;
grant execute on function public.renew_subscription(text, text, integer, boolean)
  to service_role;

create or replace function public.update_staff_activity_on_completed_appointment()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  target_user_id uuid;
begin
  if new.status <> 'completed' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status = 'completed' then
    return new;
  end if;

  update public.booking_entities
  set last_active_at = now()
  where id = new.booking_entity_id
  returning user_id into target_user_id;

  if target_user_id is not null then
    update public.user_profiles
    set last_active_at = now()
    where id = target_user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists appointments_update_staff_activity
  on public.appointments;
create trigger appointments_update_staff_activity
  after insert or update of status on public.appointments
  for each row
  execute function public.update_staff_activity_on_completed_appointment();

create or replace function public.write_audit_log(
  target_tenant_id text,
  target_type text,
  target_id text,
  action text,
  before_values jsonb,
  after_values jsonb,
  extra_values jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  request_headers jsonb := coalesce(
    nullif(current_setting('request.headers', true), '')::jsonb,
    '{}'::jsonb
  );
  authenticated_name text;
  authenticated_role text;
  audit_details jsonb;
begin
  if auth.uid() is not null then
    select display_name, role
      into authenticated_name, authenticated_role
    from public.user_profiles
    where id = auth.uid();
  end if;

  audit_details := jsonb_strip_nulls(jsonb_build_object(
    'target_type', target_type,
    'target_id', target_id,
    'before', before_values,
    'after', after_values,
    'extra', extra_values
  ));

  insert into public.audit_logs (
    tenant_id,
    actor_name,
    actor_role,
    action_type,
    details_before_after
  )
  values (
    target_tenant_id,
    coalesce(authenticated_name, request_headers ->> 'x-audit-actor', 'Backend'),
    coalesce(
      authenticated_role,
      request_headers ->> 'x-audit-role',
      current_setting('request.jwt.claim.role', true),
      'service_role'
    ),
    action,
    audit_details
  );
end;
$$;

revoke all on function public.write_audit_log(text, text, text, text, jsonb, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.write_audit_log(text, text, text, text, jsonb, jsonb, jsonb)
  to service_role;

create or replace function public.audit_booking_entity_change()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  old_values jsonb;
  new_values jsonb;
  target_tenant text;
  target_entity text;
  entity_kind text;
begin
  if tg_op <> 'INSERT' then
    old_values := to_jsonb(old) - 'last_active_at' - 'updated_at'
      - 'password_changed_at' - 'user_id';
  end if;
  if tg_op <> 'DELETE' then
    new_values := to_jsonb(new) - 'last_active_at' - 'updated_at'
      - 'password_changed_at' - 'user_id';
  end if;

  if tg_op = 'UPDATE' and old_values is not distinct from new_values then
    return new;
  end if;

  if tg_op = 'DELETE' then
    target_tenant := old.tenant_id;
    target_entity := old.id::text;
    entity_kind := coalesce(old.entity_type, 'barber');
  else
    target_tenant := new.tenant_id;
    target_entity := new.id::text;
    entity_kind := coalesce(new.entity_type, 'barber');
  end if;

  perform public.write_audit_log(
    target_tenant,
    case when entity_kind = 'independent' then 'independent_profile' else 'barber' end,
    target_entity,
    case tg_op
      when 'INSERT' then case when entity_kind = 'independent' then 'independent.created' else 'barber.created' end
      when 'UPDATE' then case when entity_kind = 'independent' then 'independent.updated' else 'barber.updated' end
      else case when entity_kind = 'independent' then 'independent.deleted' else 'barber.deleted' end
    end,
    old_values,
    new_values
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists booking_entities_audit_change on public.booking_entities;
create trigger booking_entities_audit_change
  after insert or update or delete on public.booking_entities
  for each row execute function public.audit_booking_entity_change();

create or replace function public.audit_user_profile_change()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  old_values jsonb;
  new_values jsonb;
  target_tenant text;
  target_profile text;
  action text;
begin
  if tg_op <> 'INSERT' then
    old_values := to_jsonb(old) - 'last_active_at';
  end if;
  if tg_op <> 'DELETE' then
    new_values := to_jsonb(new) - 'last_active_at';
  end if;

  if tg_op = 'UPDATE' and old_values is not distinct from new_values then
    return new;
  end if;

  if tg_op = 'DELETE' then
    target_tenant := old.tenant_id;
    target_profile := coalesce(old.entity_id, old.tenant_id, old.id::text);
    action := 'account.deleted';
  else
    target_tenant := new.tenant_id;
    target_profile := coalesce(new.entity_id, new.tenant_id, new.id::text);
    action := case tg_op
      when 'INSERT' then 'account.created'
      when 'UPDATE' then case
        when old.password_changed_at is distinct from new.password_changed_at then 'password.changed'
        else 'account.updated'
      end
    end;
  end if;

  perform public.write_audit_log(
    target_tenant,
    case when tg_op = 'DELETE' then coalesce(old.role, 'account') else coalesce(new.role, 'account') end,
    target_profile,
    action,
    old_values,
    new_values
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists user_profiles_audit_change on public.user_profiles;
create trigger user_profiles_audit_change
  after insert or update or delete on public.user_profiles
  for each row execute function public.audit_user_profile_change();

create or replace function public.audit_tenant_change()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  old_values jsonb;
  new_values jsonb;
  old_settings jsonb;
  new_settings jsonb;
  target_tenant text;
  action text;
  services_changed boolean := false;
  incentives_changed boolean := false;
  chair_fee_changed boolean := false;
  independent_services_changed boolean := false;
begin
  if tg_op <> 'INSERT' then
    old_values := to_jsonb(old) - 'app_settings' - 'updated_at';
    old_settings := jsonb_build_object(
      'services', old.app_settings -> 'services',
      'incentives', old.app_settings -> 'incentives',
      'chairFeeConfig', old.app_settings -> 'chairFeeConfig',
      'independentServices', old.app_settings -> 'independentServices'
    );
    old_values := old_values || jsonb_build_object('settings', old_settings);
  end if;
  if tg_op <> 'DELETE' then
    new_values := to_jsonb(new) - 'app_settings' - 'updated_at';
    new_settings := jsonb_build_object(
      'services', new.app_settings -> 'services',
      'incentives', new.app_settings -> 'incentives',
      'chairFeeConfig', new.app_settings -> 'chairFeeConfig',
      'independentServices', new.app_settings -> 'independentServices'
    );
    new_values := new_values || jsonb_build_object('settings', new_settings);
  end if;

  if tg_op = 'UPDATE' then
    services_changed := old.app_settings -> 'services' is distinct from new.app_settings -> 'services';
    incentives_changed := old.app_settings -> 'incentives' is distinct from new.app_settings -> 'incentives';
    chair_fee_changed := old.app_settings -> 'chairFeeConfig' is distinct from new.app_settings -> 'chairFeeConfig';
    independent_services_changed := old.app_settings -> 'independentServices' is distinct from new.app_settings -> 'independentServices';
    if old_values is not distinct from new_values then
      return new;
    end if;
  end if;

  if tg_op = 'DELETE' then
    target_tenant := old.id::text;
    action := 'tenant.deleted';
  elsif tg_op = 'INSERT' then
    target_tenant := new.id::text;
    action := 'tenant.created';
  else
    target_tenant := new.id::text;
    action := case
      when services_changed and not incentives_changed and not chair_fee_changed and not independent_services_changed then 'services.updated'
      when incentives_changed and not services_changed and not chair_fee_changed and not independent_services_changed then 'incentives.updated'
      when chair_fee_changed and not services_changed and not incentives_changed and not independent_services_changed then 'chair_fee.updated'
      when independent_services_changed and not services_changed and not incentives_changed and not chair_fee_changed then 'independent_services.updated'
      else 'tenant.updated'
    end;
  end if;

  perform public.write_audit_log(
    target_tenant,
    'tenant',
    target_tenant,
    action,
    old_values,
    new_values
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists tenants_audit_change on public.tenants;
create trigger tenants_audit_change
  after insert or update or delete on public.tenants
  for each row execute function public.audit_tenant_change();

create or replace function public.audit_appointment_change()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  old_values jsonb;
  new_values jsonb;
  target_tenant text;
  target_entity text;
  appointment_id text;
begin
  if tg_op <> 'INSERT' then
    old_values := jsonb_strip_nulls(jsonb_build_object(
      'status', old.status,
      'appointment_date', old.appointment_date,
      'appointment_time', old.appointment_time,
      'service_name', old.service_name,
      'price', old.price,
      'cancellation_reason', old.cancellation_reason
    ));
  end if;
  if tg_op <> 'DELETE' then
    new_values := jsonb_strip_nulls(jsonb_build_object(
      'status', new.status,
      'appointment_date', new.appointment_date,
      'appointment_time', new.appointment_time,
      'service_name', new.service_name,
      'price', new.price,
      'cancellation_reason', new.cancellation_reason
    ));
  end if;

  if tg_op = 'DELETE' then
    target_tenant := old.tenant_id;
    target_entity := old.booking_entity_id::text;
    appointment_id := old.id::text;
  else
    target_tenant := new.tenant_id;
    target_entity := new.booking_entity_id::text;
    appointment_id := new.id::text;
  end if;
  perform public.write_audit_log(
    target_tenant,
    'appointment',
    target_entity,
    case tg_op
      when 'INSERT' then 'appointment.created'
      when 'UPDATE' then 'appointment.updated'
      else 'appointment.deleted'
    end,
    old_values,
    new_values,
    jsonb_build_object('appointment_id', appointment_id)
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists appointments_audit_change on public.appointments;
create trigger appointments_audit_change
  after insert or update or delete on public.appointments
  for each row execute function public.audit_appointment_change();

create or replace function public.audit_system_settings_change()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'UPDATE' and to_jsonb(old) is not distinct from to_jsonb(new) then
    return new;
  end if;

  perform public.write_audit_log(
    null,
    'system_settings',
    case when tg_op = 'DELETE' then old.id::text else new.id::text end,
    case tg_op
      when 'INSERT' then 'system_settings.created'
      when 'UPDATE' then 'system_settings.updated'
      else 'system_settings.deleted'
    end,
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists system_settings_audit_change on public.system_settings;
create trigger system_settings_audit_change
  after insert or update or delete on public.system_settings
  for each row execute function public.audit_system_settings_change();

alter table public.system_settings enable row level security;
revoke all on public.system_settings from public, anon, authenticated;
grant select, update on public.system_settings to authenticated;
grant all on public.system_settings to service_role;

drop policy if exists "Developers can read system settings" on public.system_settings;
create policy "Developers can read system settings"
  on public.system_settings for select to authenticated
  using (public.current_staff_role() = 'developer');
drop policy if exists "Developers can update system settings" on public.system_settings;
create policy "Developers can update system settings"
  on public.system_settings for update to authenticated
  using (public.current_staff_role() = 'developer')
  with check (public.current_staff_role() = 'developer');

alter table public.audit_logs enable row level security;
revoke all on public.audit_logs from public, anon, authenticated;
grant select on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;

drop policy if exists "Scoped staff can read audit logs" on public.audit_logs;
create policy "Scoped staff can read audit logs"
  on public.audit_logs for select to authenticated
  using (
    public.current_staff_role() = 'developer'
    or (
      tenant_id = public.current_user_tenant_id()
      and (
        public.current_staff_role() in ('admin', 'independent')
        or (
          public.current_staff_role() = 'barber'
          and details_before_after ->> 'target_id' = (
            select profile.entity_id::text
            from public.user_profiles as profile
            where profile.id = auth.uid()
          )
        )
      )
    )
  );

drop policy if exists "Public can read active tenants" on public.tenants;
drop policy if exists "Staff can read their tenant" on public.tenants;
create policy "Staff can read their tenant"
  on public.tenants for select to authenticated
  using (
    public.current_staff_role() = 'developer'
    or id = public.current_user_tenant_id()
  );
revoke all on public.tenants from public, anon;
grant select on public.tenants to authenticated;
grant all on public.tenants to service_role;

drop policy if exists "Staff can read permitted booking entities" on public.booking_entities;
create policy "Staff can read permitted booking entities"
  on public.booking_entities for select to authenticated
  using (
    public.current_staff_role() = 'developer'
    or (
      public.current_staff_role() = 'admin'
      and tenant_id = public.current_user_tenant_id()
    )
    or (
      public.current_staff_role() in ('barber', 'independent')
      and id = (
        select profile.entity_id
        from public.user_profiles as profile
        where profile.id = auth.uid()
      )
      and tenant_id = public.current_user_tenant_id()
    )
  );

drop policy if exists "Staff can update permitted booking contacts" on public.booking_entities;
create policy "Staff can update permitted booking contacts"
  on public.booking_entities for update to authenticated
  using (
    public.current_staff_role() = 'developer'
    or (
      public.current_staff_role() = 'admin'
      and tenant_id = public.current_user_tenant_id()
    )
  )
  with check (
    public.current_staff_role() = 'developer'
    or (
      public.current_staff_role() = 'admin'
      and tenant_id = public.current_user_tenant_id()
    )
  );

drop policy if exists "Staff can read permitted appointments" on public.appointments;
create policy "Staff can read permitted appointments"
  on public.appointments for select to authenticated
  using (
    public.current_staff_role() = 'developer'
    or (
      tenant_id = public.current_user_tenant_id()
      and (
        public.current_staff_role() = 'admin'
        or (
          public.current_staff_role() in ('barber', 'independent')
          and booking_entity_id = (
            select profile.entity_id
            from public.user_profiles as profile
            where profile.id = auth.uid()
          )
        )
      )
    )
  );

alter table public.monthly_summaries enable row level security;
revoke all on public.monthly_summaries from public, anon, authenticated;
grant select on public.monthly_summaries to authenticated;
grant all on public.monthly_summaries to service_role;
drop policy if exists "Developers can read monthly summaries" on public.monthly_summaries;
create policy "Developers can read monthly summaries"
  on public.monthly_summaries for select to authenticated
  using (public.current_staff_role() = 'developer');

-- The service_role retains its normal RLS bypass for backend requests.
-- tenant-assets object names use the tenant/entity folder order.
alter table storage.objects enable row level security;
drop policy if exists "Tenant asset objects stay within staff scope" on storage.objects;
create policy "Tenant asset objects stay within staff scope"
  on storage.objects as restrictive for all to anon, authenticated
  using (
    bucket_id <> 'tenant-assets'
    or (
      public.current_staff_role() = 'developer'
      or (
        public.current_user_tenant_id() = (storage.foldername(name))[1]
        and (
          public.current_staff_role() = 'admin'
          or (
            public.current_staff_role() in ('barber', 'independent')
            and (storage.foldername(name))[2] = (
              select profile.entity_id::text
              from public.user_profiles as profile
              where profile.id = auth.uid()
            )
          )
        )
      )
    )
  )
  with check (
    bucket_id <> 'tenant-assets'
    or (
      public.current_staff_role() = 'developer'
      or (
        public.current_user_tenant_id() = (storage.foldername(name))[1]
        and (
          public.current_staff_role() = 'admin'
          or (
            public.current_staff_role() in ('barber', 'independent')
            and (storage.foldername(name))[2] = (
              select profile.entity_id::text
              from public.user_profiles as profile
              where profile.id = auth.uid()
            )
          )
        )
      )
    )
  );

drop policy if exists "Staff can access scoped tenant assets" on storage.objects;
create policy "Staff can access scoped tenant assets"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'tenant-assets'
    and (
      public.current_staff_role() = 'developer'
      or (
        public.current_user_tenant_id() = (storage.foldername(name))[1]
        and (
          public.current_staff_role() = 'admin'
          or (
            public.current_staff_role() in ('barber', 'independent')
            and (storage.foldername(name))[2] = (
              select profile.entity_id::text
              from public.user_profiles as profile
              where profile.id = auth.uid()
            )
          )
        )
      )
    )
  )
  with check (
    bucket_id = 'tenant-assets'
    and (
      public.current_staff_role() = 'developer'
      or (
        public.current_user_tenant_id() = (storage.foldername(name))[1]
        and (
          public.current_staff_role() = 'admin'
          or (
            public.current_staff_role() in ('barber', 'independent')
            and (storage.foldername(name))[2] = (
              select profile.entity_id::text
              from public.user_profiles as profile
              where profile.id = auth.uid()
            )
          )
        )
      )
    )
  );

create or replace function public.consume_booking_rate_limit(
  rate_key_hash text,
  max_requests integer default 8,
  window_seconds integer default 900
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current_count integer;
  shield_enabled boolean := false;
  effective_max integer;
begin
  select coalesce(production_shield_enabled, false)
    into shield_enabled
  from public.system_settings
  where id = 1;

  effective_max := case
    when shield_enabled then least(max_requests, 4)
    else max_requests
  end;

  insert into public.booking_rate_limits (key_hash, window_started_at, request_count)
  values (rate_key_hash, now(), 1)
  on conflict (key_hash) do update
  set
    window_started_at = case
      when public.booking_rate_limits.window_started_at
        + make_interval(secs => window_seconds) <= now()
      then now()
      else public.booking_rate_limits.window_started_at
    end,
    request_count = case
      when public.booking_rate_limits.window_started_at
        + make_interval(secs => window_seconds) <= now()
      then 1
      else public.booking_rate_limits.request_count + 1
    end
  returning request_count into current_count;

  return current_count <= effective_max;
end;
$$;

revoke all on function public.consume_booking_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_booking_rate_limit(text, integer, integer)
  to service_role;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'appointments'
    ) then
      alter publication supabase_realtime add table public.appointments;
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'audit_logs'
    ) then
      alter publication supabase_realtime add table public.audit_logs;
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'monthly_summaries'
    ) then
      alter publication supabase_realtime add table public.monthly_summaries;
    end if;
  end if;
end;
$$;
