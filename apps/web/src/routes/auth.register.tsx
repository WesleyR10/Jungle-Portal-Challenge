import { createRoute, redirect } from '@tanstack/react-router'
import { rootRoute } from '@/routes/root'
import { RegisterPage } from '@/features/auth/pages/register/RegisterPage'

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
