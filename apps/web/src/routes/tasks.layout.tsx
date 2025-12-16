import {
  createRoute,
  redirect,
  Outlet,
  Link,
  useRouterState,
} from '@tanstack/react-router'
import { rootRoute } from '@/routes/root'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { ClipboardList, LayoutDashboard, ListChecks } from 'lucide-react'
import { getDockButtonClasses } from '@/routes/tasks.dock-active-classes'

export const tasksLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  component: TasksLayout,
  beforeLoad: ({ context }) => {
    const isAuthenticated = context.queryClient.getQueryData<boolean>([
      'auth',
      'isAuthenticated',
    ])

    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }

    return { isAuthenticated }
  },
})

function TasksLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex flex-1 gap-4">
      <aside className="relative hidden w-16 flex-col items-center justify-between border-r border-emerald-500/20 bg-slate-950/80 py-4 sm:flex">
        <div className="flex flex-col items-center gap-4">
          <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-emerald-500">
            Nav
          </span>
          <div className="flex flex-col items-center gap-2 rounded-full border border-emerald-500/30 bg-slate-950/80 px-2 py-3 shadow-[0_0_45px_rgba(16,185,129,0.25)]">
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
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-center border-t border-emerald-500/20 bg-slate-950/95 px-4 py-2 sm:hidden">
        <div className="flex items-center gap-4 rounded-full border border-emerald-500/30 bg-slate-950/90 px-4 py-2 shadow-[0_0_35px_rgba(16,185,129,0.4)]">
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
          <Button
            asChild
            size="icon"
            variant="ghost"
            className={getDockButtonClasses(pathname.startsWith('/tasks/list'))}
          >
            <Link to="/tasks/list">
              <ListChecks className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="icon"
            variant="ghost"
            className={getDockButtonClasses(pathname.startsWith('/tasks/new'))}
          >
            <Link to="/tasks/new">
              <ClipboardList className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </nav>
    </div>
  )
}
