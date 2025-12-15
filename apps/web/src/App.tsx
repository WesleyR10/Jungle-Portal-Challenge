import { Outlet } from '@tanstack/react-router'
import './App.css'
import { ToastViewport } from '@/components/ui/toast'
import { useNotificationsSocket } from '@/lib/notifications'
import { useAuthStore } from '@/store/auth-store'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useNotificationsSocket(isAuthenticated ? 'me' : null)

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {isAuthenticated && (
        <header className="flex items-center justify-between border-b px-6 py-4">
          <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Jungle Tasks
          </span>
        </header>
      )}
      <main className="flex flex-1 flex-col gap-4 px-6 py-4">
        <Outlet />
      </main>
      <ToastViewport />
    </div>
  )
}

export default App
