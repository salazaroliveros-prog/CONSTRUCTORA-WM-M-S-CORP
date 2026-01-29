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
