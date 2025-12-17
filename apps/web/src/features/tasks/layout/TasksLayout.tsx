import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import {
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  LogOut,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getDockButtonClasses } from '@/features/tasks/layout/tasks-dock-active-classes'
import { useAuthStore } from '@/store/auth-store'

export function TasksLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  if (!isAuthenticated) {
    return null
  }

  return (
    <TooltipProvider delayDuration={120}>
      <div className="tasks-layout flex flex-1 gap-4">
        <aside className="relative hidden w-16 flex-col items-center justify-between border-r border-emerald-500/20 bg-slate-950/80 py-4 sm:flex">
          <div className="flex flex-col items-center gap-4">
            <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-emerald-500">
              Nav
            </span>
            <div className="flex flex-col items-center gap-2 rounded-full border border-emerald-500/30 bg-slate-950/80 px-2 py-3 shadow-[0_0_45px_rgba(16,185,129,0.25)]">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className={`mb-1 ${getDockButtonClasses(pathname === '/tasks')}`}
                  >
                    <Link to="/tasks">
                      <LayoutDashboard className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="border border-emerald-500/50 bg-slate-950/95 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.45)]"
                >
                  Board
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className={getDockButtonClasses(
                      pathname.startsWith('/tasks/list')
                    )}
                  >
                    <Link to="/tasks/list">
                      <ListChecks className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="border border-emerald-500/50 bg-slate-950/95 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.45)]"
                >
                  Lista
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className={getDockButtonClasses(
                      pathname.startsWith('/tasks/new')
                    )}
                  >
                    <Link to="/tasks/new">
                      <ClipboardList className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="border border-emerald-500/50 bg-slate-950/95 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.45)]"
                >
                  Nova tarefa
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="mt-1 h-8 w-8 rounded-full border border-rose-500/70 bg-rose-500/10 text-rose-200 shadow-[0_0_24px_rgba(244,63,94,0.5)] hover:bg-rose-500/20 hover:text-rose-50"
                    onClick={() => {
                      logout()
                      window.location.href = '/login'
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="border border-rose-500/70 bg-slate-950/95 text-rose-100 shadow-[0_0_24px_rgba(244,63,94,0.6)]"
                >
                  Sair
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <Outlet />
        </div>
        <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-center border-t border-emerald-500/20 bg-slate-950/95 px-4 py-2 sm:hidden">
          <div className="flex items-center gap-4 rounded-full border border-emerald-500/30 bg-slate-950/90 px-4 py-2 shadow-[0_0_35px_rgba(16,185,129,0.4)]">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  size="icon"
                  variant="ghost"
                  className={getDockButtonClasses(pathname === '/tasks')}
                >
                  <Link to="/tasks">
                    <LayoutDashboard className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="border border-emerald-500/50 bg-slate-950/95 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.45)]"
              >
                Board
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  size="icon"
                  variant="ghost"
                  className={getDockButtonClasses(
                    pathname.startsWith('/tasks/list')
                  )}
                >
                  <Link to="/tasks/list">
                    <ListChecks className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="border border-emerald-500/50 bg-slate-950/95 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.45)]"
              >
                Lista
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  size="icon"
                  variant="ghost"
                  className={getDockButtonClasses(
                    pathname.startsWith('/tasks/new')
                  )}
                >
                  <Link to="/tasks/new">
                    <ClipboardList className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="border border-emerald-500/50 bg-slate-950/95 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.45)]"
              >
                Nova tarefa
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full border border-rose-500/70 bg-rose-500/10 text-rose-200 shadow-[0_0_24px_rgba(244,63,94,0.5)] hover:bg-rose-500/20 hover:text-rose-50"
                  onClick={() => {
                    logout()
                    window.location.href = '/login'
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="border border-rose-500/70 bg-slate-950/95 text-rose-100 shadow-[0_0_24px_rgba(244,63,94,0.6)]"
              >
                Sair
              </TooltipContent>
            </Tooltip>
          </div>
        </nav>
      </div>
    </TooltipProvider>
  )
}
