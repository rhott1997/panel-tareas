# Panel de Tareas

Aplicación web construida con Next.js 14 (App Router), Supabase y TailwindCSS para gestionar tareas personales con autenticación y tablero Kanban.

## Requisitos

- Node.js 18+
- Cuenta en Supabase

## Configuración de Supabase

1. Crea un proyecto en Supabase.
2. En la sección **SQL Editor**, ejecuta el script en [`supabase/tasks.sql`](supabase/tasks.sql).
3. Ve a **Authentication > Providers** y habilita el provider **Email**.
4. Copia las credenciales de **Project Settings > API**.

> Si ya tienes la tabla creada, vuelve a ejecutar el script para añadir la columna `status`, la política de update y el trigger de `updated_at`.

## Configuración local

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Duplica `.env.example` como `.env.local` y completa las variables:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. Ejecuta el proyecto:
   ```bash
   npm run dev
   ```

La app estará disponible en `http://localhost:3000`.

## Deploy en Vercel

1. Sube el repositorio a GitHub.
2. Crea un proyecto en Vercel y conecta el repositorio.
3. En **Environment Variables**, agrega las mismas variables de `.env.local`.
4. Despliega.

## Rutas principales

- `/login`: Login con email y contraseña.
- `/dashboard`: Panel protegido con tablero Kanban y CRUD básico de tareas.
