import { CreateTaskForm } from '@/features/tasks/components/CreateTaskForm'

export function TasksNewPage() {
  return (
    <div className="relative flex flex-1 flex-col gap-4">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 blur-3xl">
        <div className="mx-auto h-full max-w-3xl bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.4),transparent_60%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.25),transparent_55%)]" />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Nova tarefa</h1>
          <p className="text-sm text-muted-foreground">
            Crie uma nova tarefa para o squad da Jungle.
          </p>
        </div>
        <div className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-400 sm:flex sm:flex-col sm:items-end">
          <span className="flex items-center gap-2">
            <span className="h-1 w-8 rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500" />
            Jungle Tasks
          </span>
          <span className="text-xs text-muted-foreground">
            Modo criação em destaque
          </span>
        </div>
      </div>

      <CreateTaskForm />
    </div>
  )
}
