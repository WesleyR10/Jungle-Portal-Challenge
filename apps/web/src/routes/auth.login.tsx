import { createRoute, redirect } from '@tanstack/react-router'
import { rootRoute } from '@/routes/root'
import { getInitialAuthFromStorage } from '@/store/auth-store'
import { LoginPage } from '@/features/auth/pages/login/LoginPage'

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
