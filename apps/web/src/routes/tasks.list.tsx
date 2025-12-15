import { z } from 'zod'
import { createRoute, redirect } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { tasksLayoutRoute } from '@/routes/tasks.layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { tasksListQueryOptions } from '@/lib/queries'

const searchSchema = z.object({
  page: z.number().int().positive().optional(),
  size: z.number().int().positive().optional(),
})

export const tasksListRoute = createRoute({
  getParentRoute: () => tasksLayoutRoute,
  path: '/list',
  validateSearch: (search) => searchSchema.parse(search),
  component: TasksListPage,
})

function TasksListPage() {
  const { page = 1, size = 10 } = tasksListRoute.useSearch()

  const { data, isLoading, error } = useQuery(tasksListQueryOptions(page, size))

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-destructive">Erro ao carregar tarefas</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Lista de tarefas
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && !data
          ? Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-4 w-32 bg-primary/20" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full bg-primary/10" />
                    <Skeleton className="h-4 w-2/3 bg-primary/10" />
                  </div>
                </CardContent>
              </Card>
            ))
          : data?.data.map((task) => (
              <Card
                key={task.id}
                className="cursor-pointer transition hover:border-primary"
                onClick={() => {
                  throw redirect({
                    to: '/tasks/$taskId',
                    params: { taskId: task.id },
                  })
                }}
              >
                <CardHeader>
                  <CardTitle className="text-base">{task.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {task.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{task.status}</span>
                    <span>{task.priority}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  )
}
