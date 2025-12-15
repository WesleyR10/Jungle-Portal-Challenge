import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexPage,
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
