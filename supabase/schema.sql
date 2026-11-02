-- supabase/schema.sql
-- Cómo usarlo: Supabase > SQL Editor > New query > pegar TODO este archivo > Run.
-- Se puede ejecutar más de una vez sin romper nada.

-- 1) Numeración legible: SOL-001, SOL-002, ...
create sequence if not exists public.solicitudes_numero_seq;

-- 2) Tabla de solicitudes (lo que llena el formulario)
create table if not exists public.solicitudes (
  id             text primary key
                 default ('SOL-' || lpad(nextval('public.solicitudes_numero_seq')::text, 3, '0')),
  candidato      text not null,
  familia_cargo  text not null,
  cargo          text not null,
  cv_path        text,                                   -- ruta del CV dentro del bucket "cvs"
  estado         text not null default 'Pendiente'
                 check (estado in ('Pendiente', 'En Proceso', 'Completada')),
  fecha_solicitud date not null default current_date,
  created_at     timestamptz not null default now()
);

-- 3) Tabla de evaluaciones (el informe que escribe la psicóloga). Una por solicitud.
create table if not exists public.evaluaciones (
  id           bigint generated always as identity primary key,
  solicitud_id text not null unique references public.solicitudes (id) on delete cascade,
  resultado    text not null check (resultado in ('Apto', 'Apto con observaciones', 'No Apto')),
  informe      text not null,
  created_at   timestamptz not null default now()
);

-- 4) Seguridad por filas (RLS)
-- OJO: el login actual de la app es de demostración (no usa Supabase Auth), así que
-- estas políticas dejan que la llave "anon" lea y escriba. Sirve para desarrollar/presentar,
-- pero NO es seguro para datos reales: el siguiente paso sería Supabase Auth.
alter table public.solicitudes  enable row level security;
alter table public.evaluaciones enable row level security;

drop policy if exists "solicitudes_insert" on public.solicitudes;
drop policy if exists "solicitudes_select" on public.solicitudes;
drop policy if exists "solicitudes_update" on public.solicitudes;
create policy "solicitudes_insert" on public.solicitudes for insert to anon, authenticated
  with check (estado = 'Pendiente');
create policy "solicitudes_select" on public.solicitudes for select to anon, authenticated
  using (true);
create policy "solicitudes_update" on public.solicitudes for update to anon, authenticated
  using (true) with check (true);

drop policy if exists "evaluaciones_insert" on public.evaluaciones;
drop policy if exists "evaluaciones_select" on public.evaluaciones;
drop policy if exists "evaluaciones_update" on public.evaluaciones;
create policy "evaluaciones_insert" on public.evaluaciones for insert to anon, authenticated
  with check (true);
create policy "evaluaciones_select" on public.evaluaciones for select to anon, authenticated
  using (true);
create policy "evaluaciones_update" on public.evaluaciones for update to anon, authenticated
  using (true) with check (true);

-- 5) Storage: bucket privado "cvs" (máx. 5 MB; solo PDF, DOC y DOCX)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cvs', 'cvs', false, 5242880,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

drop policy if exists "cvs_subir" on storage.objects;
drop policy if exists "cvs_leer" on storage.objects;
create policy "cvs_subir" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'cvs');
create policy "cvs_leer" on storage.objects for select to anon, authenticated
  using (bucket_id = 'cvs');

-- 6) OPCIONAL: 3 solicitudes de ejemplo (las mismas del mockSolicitudes.js).
--    Quita los "--" de abajo si las quieres.
-- insert into public.solicitudes (candidato, familia_cargo, cargo, estado, fecha_solicitud) values
--   ('Juan Pérez',  'Recursos Humanos', 'Analista de Selección',      'Pendiente',  '2026-10-05'),
--   ('María Gómez', 'Operaciones',      'Supervisor de Producción',   'En Proceso', '2026-10-06'),
--   ('Carlos Soto', 'Tecnología',       'Analista de Soporte TI',     'Pendiente',  '2026-10-07');
