import { HeadContent, Outlet } from '@tanstack/react-router'

import logo from '@/assets/logo.svg'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { ToastViewport } from '@/components/ui/toast'
import { useNotificationsSocket } from '@/lib/notifications'
import { useAuthStore } from '@/store/auth-store'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const accessToken = useAuthStore((state) => state.accessToken)

  let userId: string | null = null
  if (accessToken) {
    try {
      const [, payloadBase64] = accessToken.split('.')
      const json = atob(payloadBase64)
      const payload = JSON.parse(json) as { sub?: string }
      userId = payload.sub ?? null
    } catch {
      userId = null
    }
  }

  useNotificationsSocket(isAuthenticated && userId ? userId : null)

  return (
    <>
      <HeadContent />
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        {isAuthenticated && (
          <header className="tasks-layout flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Jungle Gaming" className="h-6" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
                Jungle Tasks
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-xs text-muted-foreground sm:block">
                <span className="font-medium">Workspace</span>{' '}
                <span className="text-emerald-500">Jungle Gaming</span>
              </div>
              <ModeToggle />
            </div>
          </header>
        )}
        <main className="flex flex-1 flex-col gap-4">
          <Outlet />
        </main>
        <ToastViewport />
      </div>
    </>
  )
}

export default App
