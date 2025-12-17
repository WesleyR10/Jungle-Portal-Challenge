import { z } from 'zod'
import { createRoute, redirect } from '@tanstack/react-router'
import { rootRoute } from './root'
import { LoginPage } from '@/features/auth/pages/login/LoginPage'
import { RegisterPage } from '@/features/auth/pages/register/RegisterPage'
import { TasksLayout } from '@/features/tasks/layout/TasksLayout'
import { TasksBoardPage } from '@/features/tasks/pages/board/TasksBoardPage'
import { TasksListPage } from '@/features/tasks/pages/list/TasksListPage'
import { TaskDetailPage } from '@/features/tasks/pages/detail/TaskDetailPage'
import { TasksNewPage } from '@/features/tasks/pages/new/TasksNewPage'
import { getInitialAuthFromStorage } from '@/store/auth-store'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: ({ context }) => {
    const isAuthenticated = context.queryClient.getQueryData<boolean>([
      'auth',
      'isAuthenticated',
    ])

    if (isAuthenticated) {
      throw redirect({ to: '/tasks' })
    }

    throw redirect({ to: '/login' })
  },
  component: IndexPage,
})

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: () => {
    const initial = getInitialAuthFromStorage()
    if (initial.accessToken) {
      throw redirect({ to: '/tasks' })
    }
  },
  component: LoginPage,
})

export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  beforeLoad: ({ context }) => {
    const isAuthenticated = context.queryClient.getQueryData<boolean>([
      'auth',
      'isAuthenticated',
    ])

    if (isAuthenticated) {
      throw redirect({ to: '/tasks' })
    }
  },
  component: RegisterPage,
})

export const tasksLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  component: TasksLayout,
  beforeLoad: () => {
    const initial = getInitialAuthFromStorage()

    if (!initial.accessToken) {
      throw redirect({ to: '/login' })
    }

    return { isAuthenticated: true }
  },
})

export const tasksRoute = createRoute({
  getParentRoute: () => tasksLayoutRoute,
  path: '/',
  component: TasksBoardPage,
})

const listSearchSchema = z.object({
  page: z.number().int().positive().optional(),
  size: z.number().int().positive().optional(),
})

export const tasksListRoute = createRoute({
  getParentRoute: () => tasksLayoutRoute,
  path: '/list',
  validateSearch: (search) => listSearchSchema.parse(search),
  component: TasksListPage,
})

export const taskDetailRoute = createRoute({
  getParentRoute: () => tasksLayoutRoute,
  path: '/$taskId',
  component: TaskDetailPage,
})

export const tasksNewRoute = createRoute({
  getParentRoute: () => tasksLayoutRoute,
  path: '/new',
  component: TasksNewPage,
})

function IndexPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="rounded-lg border bg-card px-6 py-8 text-card-foreground shadow-sm">
        <h1 className="text-2xl font-semibold">Frontend base configurado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tailwind, tema verde do shadcn e toggle de tema já estão prontos.
        </p>
      </div>
    </div>
  )
}
