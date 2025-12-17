import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

export function TasksBoardHeader() {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Board de tarefas
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Organize o fluxo de trabalho da Jungle com um board em estilo eSports:
          arraste tarefas, acompanhe prioridades e mantenha o time alinhado em
          tempo real.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="border-emerald-500/40 bg-emerald-500/5 text-xs font-medium uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/10"
        >
          <Link to="/tasks/list">Visão em lista</Link>
        </Button>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.4)]" />
          Jungle Squad Online
        </div>
      </div>
    </div>
  )
}
