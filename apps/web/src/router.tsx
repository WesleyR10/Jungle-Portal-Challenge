import { RouterProvider, createRouter } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { indexRoute } from '@/routes/index'
import { loginRoute } from '@/routes/auth.login'
import { registerRoute } from '@/routes/auth.register'
import { tasksLayoutRoute } from '@/routes/tasks.layout'
import { tasksRoute } from '@/routes/tasks.index'
import { tasksListRoute } from '@/routes/tasks.list'
import { taskDetailRoute } from '@/routes/tasks.$taskId'
import { tasksNewRoute } from '@/routes/tasks.new'
import { rootRoute } from '@/routes/root'
import { getInitialAuthFromStorage } from '@/store/auth-store'

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  tasksLayoutRoute.addChildren([
    tasksRoute,
    tasksListRoute,
    taskDetailRoute,
    tasksNewRoute,
  ]),
])

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})

const initialAuth = getInitialAuthFromStorage()
queryClient.setQueryData(['auth', 'isAuthenticated'], !!initialAuth.accessToken)

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 5_000,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function AppRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools buttonPosition="bottom-right" />
      <TanStackRouterDevtools router={router} position="bottom-left" />
    </QueryClientProvider>
  )
}
