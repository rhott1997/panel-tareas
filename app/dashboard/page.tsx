import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';

const STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'done', label: 'Completado' }
] as const;

type StatusValue = (typeof STATUS_OPTIONS)[number]['value'];

function isValidStatus(value: string): value is StatusValue {
  return STATUS_OPTIONS.some((option) => option.value === value);
}

async function createTask(formData: FormData) {
  'use server';

  const title = String(formData.get('title') ?? '').trim();
  const status = String(formData.get('status') ?? 'backlog');

  if (!title || !isValidStatus(status)) {
    return;
  }

  const supabase = createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase.from('tasks').insert({
    title,
    status,
    user_id: user.id
  });

  revalidatePath('/dashboard');
}

async function updateTaskStatus(formData: FormData) {
  'use server';

  const id = String(formData.get('id') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim();

  if (!id || !isValidStatus(status)) {
    return;
  }

  const supabase = createServerSupabase();
  await supabase.from('tasks').update({ status }).eq('id', id);

  revalidatePath('/dashboard');
}

async function deleteTask(formData: FormData) {
  'use server';

  const id = String(formData.get('id') ?? '').trim();
  if (!id) {
    return;
  }

  const supabase = createServerSupabase();
  await supabase.from('tasks').delete().eq('id', id);

  revalidatePath('/dashboard');
}

async function logout() {
  'use server';

  const supabase = createServerSupabase();
  await supabase.auth.signOut();
}

export default async function DashboardPage() {
  const supabase = createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, status, created_at')
    .order('created_at', { ascending: false });

  const grouped = {
    backlog: tasks?.filter((task) => task.status === 'backlog') ?? [],
    in_progress: tasks?.filter((task) => task.status === 'in_progress') ?? [],
    done: tasks?.filter((task) => task.status === 'done') ?? []
  };

  const totalTasks = tasks?.length ?? 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-slate-800/60 bg-slate-900/70 px-8 py-6 shadow-xl shadow-black/20">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Panel de Tareas
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Kanban personal</h1>
            <p className="mt-3 max-w-xl text-sm text-slate-300">
              Hola {user?.email}, organiza tu día en columnas y mantiene el foco en lo importante.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-2xl border border-slate-800/60 bg-slate-950/70 px-5 py-4 text-center">
              <p className="text-xs text-slate-400">Total tareas</p>
              <p className="mt-1 text-2xl font-semibold text-white">{totalTasks}</p>
            </div>
            <form action={logout}>
              <button
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-indigo-400 hover:text-white"
                type="submit"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </header>

        <section className="grid gap-6 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-8 shadow-lg shadow-black/10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-lg font-semibold">Nueva tarea</h2>
            <p className="mt-2 text-sm text-slate-300">
              Crea una tarjeta y envíala directo a la columna que corresponda.
            </p>
          </div>
          <form action={createTask} className="flex flex-col gap-4">
            <input
              name="title"
              placeholder="Ej. Preparar demo para el cliente"
              className="rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
            />
            <div className="flex flex-wrap gap-3">
              <select
                name="status"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-3 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
                defaultValue="backlog"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-400"
              >
                Crear tarea
              </button>
            </div>
          </form>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {STATUS_OPTIONS.map((column) => (
            <div
              key={column.value}
              className="flex h-full flex-col rounded-3xl border border-slate-800/70 bg-slate-900/70 p-5 shadow-xl shadow-black/10"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                  {column.label}
                </h3>
                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
                  {grouped[column.value].length}
                </span>
              </div>
              <div className="mt-4 flex flex-1 flex-col gap-4">
                {grouped[column.value].length > 0 ? (
                  grouped[column.value].map((task) => (
                    <article
                      key={task.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-md shadow-black/20"
                    >
                      <h4 className="text-sm font-semibold text-slate-100">{task.title}</h4>
                      <p className="mt-2 text-xs text-slate-400">
                        Creada el {new Date(task.created_at).toLocaleString('es-ES')}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <form action={updateTaskStatus}>
                          <input type="hidden" name="id" value={task.id} />
                          <input
                            type="hidden"
                            name="status"
                            value={
                              column.value === 'backlog'
                                ? 'in_progress'
                                : column.value === 'in_progress'
                                  ? 'done'
                                  : 'backlog'
                            }
                          />
                          <button
                            type="submit"
                            className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200 transition hover:border-indigo-400 hover:text-white"
                          >
                            {column.value === 'backlog'
                              ? 'Mover a En progreso'
                              : column.value === 'in_progress'
                                ? 'Mover a Completado'
                                : 'Reabrir'}
                          </button>
                        </form>
                        <form action={deleteTask}>
                          <input type="hidden" name="id" value={task.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-rose-500/50 px-3 py-1 text-xs text-rose-200 transition hover:border-rose-400"
                          >
                            Eliminar
                          </button>
                        </form>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-400">
                    Sin tareas en esta columna.
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
