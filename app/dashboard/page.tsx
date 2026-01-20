import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';

async function createTask(formData: FormData) {
  'use server';

  const title = String(formData.get('title') ?? '').trim();
  if (!title) {
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
    user_id: user.id
  });

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
    .select('id, title, created_at')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Panel de Tareas</h1>
            <p className="mt-2 text-sm text-slate-300">
              Hola {user?.email}, estas son tus tareas pendientes.
            </p>
          </div>
          <form action={logout}>
            <button
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
              type="submit"
            >
              Cerrar sesión
            </button>
          </form>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-medium">Nueva tarea</h2>
          <form action={createTask} className="mt-4 flex flex-col gap-4 sm:flex-row">
            <input
              name="title"
              placeholder="Describe tu tarea"
              className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-indigo-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
            >
              Agregar
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">Tus tareas</h2>
          {tasks && tasks.length > 0 ? (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-100">{task.title}</p>
                    <p className="text-xs text-slate-400">
                      Creada el {new Date(task.created_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <form action={deleteTask}>
                    <input type="hidden" name="id" value={task.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-rose-500/50 px-3 py-1 text-xs text-rose-200 transition hover:border-rose-400"
                    >
                      Eliminar
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700 px-4 py-6 text-sm text-slate-400">
              No tienes tareas aún. Crea la primera desde arriba.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
