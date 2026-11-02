# AquaChile

Portal de solicitudes de evaluación psicolaboral (React + React Router + Supabase).

## Puesta en marcha

1. Instala las dependencias: `npm install`
2. Configura Supabase (una sola vez):
   1. En https://supabase.com crea un proyecto (o usa el que ya tienes).
   2. Abre **SQL Editor → New query**, pega el contenido de `supabase/schema.sql` y presiona **Run**.
      Esto crea las tablas `solicitudes` y `evaluaciones` y el bucket privado `cvs`.
   3. Ve a **Project Settings → API** y copia la **Project URL** y la llave **anon public**.
   4. Copia `.env.example` como `.env` (en esta misma carpeta) y pega esos dos valores.
3. Arranca la app: `npm start` → http://localhost:3000

> Si cambias `.env`, detén `npm start` (Ctrl + C) y vuelve a ejecutarlo.

## Pruebas

- `npm test` — ejecuta todas las pruebas (Vitest). No necesitan internet ni Supabase: usan un servicio falso.
- `npm run test:watch` — vuelve a correr las pruebas al guardar.
- `npm run test:coverage` — informe de cobertura.

## Dónde está la base de datos en el código

- `supabase/schema.sql` — tablas, políticas de seguridad (RLS) y bucket de CVs.
- `src/lib/supabaseClient.js` — conexión a Supabase (lee `.env`).
- `src/services/solicitudesService.js` — todas las consultas (listar, crear, evaluar, descargar CV).
- `src/services/solicitudesService.test.js` — pruebas de esas consultas.

## Importante sobre seguridad

El login actual es de demostración (no usa Supabase Auth), por eso las políticas de `schema.sql`
permiten leer y escribir con la llave `anon`. Está bien para desarrollar y presentar, pero antes de
usar datos reales de candidatos hay que agregar login real con Supabase Auth y restringir las políticas.
