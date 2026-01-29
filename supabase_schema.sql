-- Supabase schema para sincronización de CONSTRUCTORA WM/M&S
-- Copia y pega esto en: Supabase → SQL Editor → New query → Run
--
-- Esta app sincroniza por “snapshot” (estado completo) en JSONB.
-- Por eso NO necesita relaciones/foreign keys: todo el contenido vive en payload.

begin;

-- 1) Tabla principal (1 fila por group_id)
create table if not exists public.ms_constructora_state (
  group_id   text primary key,
  device_id  text,
  updated_at timestamptz not null default now(),
  payload    jsonb not null
);

-- 2) Índices útiles
create index if not exists ms_constructora_state_updated_at_idx
  on public.ms_constructora_state (updated_at desc);

create index if not exists ms_constructora_state_device_id_idx
  on public.ms_constructora_state (device_id);

-- 3) Trigger para mantener updated_at actualizado en UPDATE
create or replace function public.ms_constructora_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists ms_constructora_state_set_updated_at on public.ms_constructora_state;
create trigger ms_constructora_state_set_updated_at
before update on public.ms_constructora_state
for each row execute function public.ms_constructora_set_updated_at();

-- 4) Seguridad (RLS)
-- IMPORTANTE:
-- - Si activas RLS pero NO creas policies, la app no podrá leer/escribir y fallará.
-- - Para uso personal rápido puedes dejar RLS apagado (por defecto).
-- - Si quieres activarlo sí o sí, puedes usar las policies “abiertas” de abajo.

-- Opción A (recomendado para uso personal simple): NO activar RLS
--   (No hagas nada aquí.)

-- Opción B (si quieres activar RLS, pega estas líneas también):
--   Habilita RLS + policies abiertas para el rol anon.
--   Nota: esto no “protege” realmente si la anon key se filtra; solo evita bloqueos.

-- alter table public.ms_constructora_state enable row level security;

-- drop policy if exists ms_constructora_state_select_anon on public.ms_constructora_state;
-- create policy ms_constructora_state_select_anon
-- on public.ms_constructora_state
-- for select
-- to anon
-- using (true);

-- drop policy if exists ms_constructora_state_insert_anon on public.ms_constructora_state;
-- create policy ms_constructora_state_insert_anon
-- on public.ms_constructora_state
-- for insert
-- to anon
-- with check (true);

-- drop policy if exists ms_constructora_state_update_anon on public.ms_constructora_state;
-- create policy ms_constructora_state_update_anon
-- on public.ms_constructora_state
-- for update
-- to anon
-- using (true)
-- with check (true);

commit;

-- ==========================================================
-- PORTAL DE TRABAJADOR (WhatsApp link + firma + asistencia)
--
-- Diseño:
-- - El trabajador recibe un link: worker.html?t=TOKEN
-- - La app envía el header: X-Worker-Token: TOKEN
-- - RLS restringe SELECT/UPDATE/INSERT al token del header.
--
-- IMPORTANTE:
-- - Esto NO usa Supabase Auth.
-- - La seguridad se basa en que el TOKEN sea largo/no adivinable.
-- - Si quieres seguridad “empresa” (usuarios, revocación, etc.), se recomienda Auth.
-- ==========================================================

begin;

create extension if not exists pgcrypto;

create table if not exists public.ms_worker_contracts (
  token         text primary key,
  worker_name   text not null,
  project_name  text,
  contract_html text not null,
  status        text not null default 'pendiente',
  signed_name   text,
  signature_png text,
  signed_at     timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists ms_worker_contracts_updated_at_idx
  on public.ms_worker_contracts (updated_at desc);

create table if not exists public.ms_worker_attendance (
  id        uuid primary key default gen_random_uuid(),
  token     text not null references public.ms_worker_contracts(token) on delete cascade,
  tipo      text not null,
  fecha     timestamptz not null default now(),
  lat       double precision,
  lng       double precision,
  accuracy  double precision,
  nota      text,
  created_at timestamptz not null default now()
);

create index if not exists ms_worker_attendance_token_fecha_idx
  on public.ms_worker_attendance (token, fecha desc);

-- Mantener updated_at
create or replace function public.ms_worker_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists ms_worker_contracts_set_updated_at on public.ms_worker_contracts;
create trigger ms_worker_contracts_set_updated_at
before update on public.ms_worker_contracts
for each row execute function public.ms_worker_set_updated_at();

-- RLS
alter table public.ms_worker_contracts enable row level security;
alter table public.ms_worker_attendance enable row level security;

-- Helper: lee el token del header. PostgREST lo expone como current_setting('request.headers.<header>', true)
-- Nota: Postgres usa minúsculas en el nombre del header.

drop policy if exists ms_worker_contracts_select_token on public.ms_worker_contracts;
create policy ms_worker_contracts_select_token
on public.ms_worker_contracts
for select
to anon
using (token = current_setting('request.headers.x-worker-token', true));

drop policy if exists ms_worker_contracts_update_token on public.ms_worker_contracts;
create policy ms_worker_contracts_update_token
on public.ms_worker_contracts
for update
to anon
using (token = current_setting('request.headers.x-worker-token', true))
with check (token = current_setting('request.headers.x-worker-token', true));

-- NO permitimos INSERT desde el navegador (anon) por defecto.
-- El administrador crea contratos desde Supabase Dashboard/SQL.

drop policy if exists ms_worker_attendance_insert_token on public.ms_worker_attendance;
create policy ms_worker_attendance_insert_token
on public.ms_worker_attendance
for insert
to anon
with check (token = current_setting('request.headers.x-worker-token', true));

drop policy if exists ms_worker_attendance_select_token on public.ms_worker_attendance;
create policy ms_worker_attendance_select_token
on public.ms_worker_attendance
for select
to anon
using (token = current_setting('request.headers.x-worker-token', true));

commit;
