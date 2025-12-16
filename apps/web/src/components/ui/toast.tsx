import { create } from 'zustand'

type ToastVariant = 'default' | 'destructive'

type Toast = {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

type ToastStore = {
  toasts: Toast[]
  push: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (toast) =>
    set((state) => {
      const id = crypto.randomUUID()
      const duration = toast.duration ?? 4000

      if (duration > 0) {
        setTimeout(() => {
          set((current) => ({
            toasts: current.toasts.filter((t) => t.id !== id),
          }))
        }, duration)
      }

      return {
        toasts: [
          ...state.toasts,
          {
            id,
            ...toast,
          },
        ],
      }
    }),
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))

export function useToast() {
  const push = useToastStore((state) => state.push)

  return {
    toast: push,
  }
}

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-0 flex items-start justify-end p-4">
      <div className="flex w-full flex-col gap-2 sm:max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex flex-col gap-1 rounded-md border bg-background px-4 py-3 text-sm shadow-lg"
          >
            {toast.title && <div className="font-medium">{toast.title}</div>}
            {toast.description && (
              <div className="text-xs text-muted-foreground">
                {toast.description}
              </div>
            )}
            <button
              type="button"
              className="self-end text-xs text-primary hover:underline"
              onClick={() => dismiss(toast.id)}
            >
              Fechar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
