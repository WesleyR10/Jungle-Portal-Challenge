import { createRoute, redirect } from '@tanstack/react-router'
import { rootRoute } from '@/routes/root'
import { useAuthStore } from '@/store/auth-store'

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

  if (!isAuthenticated) {
    return null
  }

  return null
}
