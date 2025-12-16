import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { createRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DroppableProvided,
  type DraggableProvided,
  type DropResult,
} from '@hello-pangea/dnd'
import { tasksLayoutRoute } from '@/routes/tasks.layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import {
  tasksListQueryOptions,
  type TaskItem,
  updateTaskMutationFn,
} from '@/lib/queries'
import {
  useNotificationUiStore,
  markLocalTaskUpdate,
} from '@/lib/notifications'
import { TaskPriority, TaskStatus } from '@/lib/task-types'

type ColumnId = TaskStatus
type StatusFilter = 'ALL' | TaskStatus
type PriorityFilter = 'ALL' | TaskPriority

type BoardColumn = {
  id: ColumnId
  title: string
  tasks: TaskItem[]
}

export const tasksRoute = createRoute({
  getParentRoute: () => tasksLayoutRoute,
  path: '/',
  component: TasksPage,
})

function TasksPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [page] = useState(1)
  const [size] = useState(50)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL')
  const lastUpdatedTaskId = useNotificationUiStore(
    (state) => state.lastUpdatedTaskId
  )

  const { data, isLoading } = useQuery(tasksListQueryOptions(page, size))

  const [localColumns, setLocalColumns] = useState<BoardColumn[] | null>(null)

  const statusToLabel: Record<TaskStatus, string> = {
    [TaskStatus.TODO]: 'A Fazer',
    [TaskStatus.IN_PROGRESS]: 'Em Progresso',
    [TaskStatus.REVIEW]: 'Em Revisão',
    [TaskStatus.DONE]: 'Concluídas',
  }

  const initialColumns = useMemo<BoardColumn[]>(() => {
    const base: BoardColumn[] = [
      { id: TaskStatus.TODO, title: 'A Fazer', tasks: [] },
      { id: TaskStatus.IN_PROGRESS, title: 'Em Progresso', tasks: [] },
      { id: TaskStatus.REVIEW, title: 'Em Revisão', tasks: [] },
      { id: TaskStatus.DONE, title: 'Concluídas', tasks: [] },
    ]

    if (!data) return base

    const byColumn: Record<ColumnId, TaskItem[]> = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.REVIEW]: [],
      [TaskStatus.DONE]: [],
    }

    for (const task of data.data) {
      const status = task.status as ColumnId
      if (byColumn[status]) {
        byColumn[status].push(task)
      } else {
        byColumn[TaskStatus.TODO].push(task)
      }
    }

    return base.map((column) => ({
      ...column,
      tasks: byColumn[column.id],
    }))
  }, [data])

  const baseColumns = localColumns ?? initialColumns

  const columns = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return baseColumns.map((column) => ({
      ...column,
      tasks: column.tasks.filter((task) => {
        if (statusFilter !== 'ALL' && task.status !== statusFilter) {
          return false
        }

        if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) {
          return false
        }

        if (!normalizedSearch) {
          return true
        }

        const title = task.title.toLowerCase()
        const description = (task.description || '').toLowerCase()

        return (
          title.includes(normalizedSearch) ||
          description.includes(normalizedSearch)
        )
      }),
    }))
  }, [baseColumns, search, statusFilter, priorityFilter])

  const updateTaskMutation = useMutation({
    mutationFn: (payload: { taskId: string; status: ColumnId }) =>
      updateTaskMutationFn(payload.taskId)({ status: payload.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false })
    },
  })

  function handleDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result
    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const sourceColumn = columns.find(
      (c) => c.id === (source.droppableId as ColumnId)
    )
    const destColumn = columns.find(
      (c) => c.id === (destination.droppableId as ColumnId)
    )

    if (!sourceColumn || !destColumn) return

    const sourceTasks = Array.from(sourceColumn.tasks)
    const [moved] = sourceTasks.splice(source.index, 1)

    const destTasks =
      sourceColumn.id === destColumn.id
        ? sourceTasks
        : Array.from(destColumn.tasks)
    destTasks.splice(destination.index, 0, moved)

    const nextColumns = columns.map((column) => {
      if (column.id === sourceColumn.id && column.id === destColumn.id) {
        return { ...column, tasks: destTasks }
      }
      if (column.id === sourceColumn.id) {
        return { ...column, tasks: sourceTasks }
      }
      if (column.id === destColumn.id) {
        return { ...column, tasks: destTasks }
      }
      return column
    })

    setLocalColumns(nextColumns)

    if (sourceColumn.id !== destColumn.id) {
      const newStatus = destColumn.id
      const title = moved?.title ?? 'Tarefa'

      toast({
        title: 'Tarefa atualizada',
        description: `${title} → ${statusToLabel[newStatus]}`,
      })

      markLocalTaskUpdate(draggableId)

      updateTaskMutation.mutate({
        taskId: draggableId,
        status: destColumn.id,
      })
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
              Board de tarefas
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Organize o fluxo de trabalho da Jungle com um board em estilo
              eSports: arraste tarefas, acompanhe prioridades e mantenha o time
              alinhado em tempo real.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-emerald-500/40 bg-emerald-500/5 text-xs font-medium uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/10"
            >
              <Link to="/tasks/list">Visão em lista</Link>
            </Button>
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.4)]" />
              Jungle Squad Online
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-2 md:flex-row">
            <input
              type="text"
              placeholder="Buscar por título ou descrição..."
              className="h-9 flex-1 rounded-md border border-emerald-500/40 bg-slate-950/60 px-3 text-xs text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:w-40"
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value as PriorityFilter)
              }
            >
              <option value="ALL">Todas prioridades</option>
              <option value={TaskPriority.LOW}>Baixa</option>
              <option value={TaskPriority.MEDIUM}>Média</option>
              <option value={TaskPriority.HIGH}>Alta</option>
              <option value={TaskPriority.URGENT}>Urgente</option>
            </select>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start border-emerald-500/40 bg-slate-950/60 text-xs text-slate-200 hover:bg-slate-950 md:w-auto"
            onClick={() => {
              const cycle: StatusFilter[] = [
                'ALL',
                TaskStatus.TODO,
                TaskStatus.IN_PROGRESS,
                TaskStatus.REVIEW,
                TaskStatus.DONE,
              ]
              const idx = cycle.indexOf(statusFilter)
              const next = cycle[(idx + 1) % cycle.length]
              setStatusFilter(next)
            }}
          >
            <span className="mr-2 h-3 w-3 rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
              Status:{' '}
              {statusFilter === 'ALL'
                ? 'Todos'
                : statusFilter === TaskStatus.TODO
                  ? 'Backlog'
                  : statusFilter === TaskStatus.IN_PROGRESS
                    ? 'Em Progresso'
                    : statusFilter === TaskStatus.REVIEW
                      ? 'Revisão'
                      : 'Concluídas'}
            </span>
          </Button>
        </div>
      </div>
      <div className="relative flex flex-1 gap-6 overflow-x-auto rounded-2xl border border-emerald-500/20 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),transparent_55%),radial-gradient(circle_at_bottom,_rgba(22,163,74,0.16),transparent_55%)] p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.8)]">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent opacity-60" />
        <DragDropContext onDragEnd={handleDragEnd}>
          {columns.map((column) => (
            <Droppable droppableId={column.id} key={column.id}>
              {(provided: DroppableProvided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex min-w-[260px] flex-1 flex-col gap-4 md:min-w-[280px]"
                >
                  <Card className="relative flex h-full flex-col border border-emerald-500/25 bg-slate-950/70 shadow-[0_0_25px_rgba(16,185,129,0.22)] backdrop-blur-md">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent opacity-60" />
                    <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-emerald-500/20 bg-gradient-to-r from-slate-950/80 via-slate-900/80 to-slate-950/80 pb-3">
                      <div className="space-y-1">
                        <CardTitle className="text-sm font-semibold tracking-wide text-slate-50">
                          {column.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-emerald-400">
                          <span className="h-1 w-8 rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500" />
                          <span>
                            {column.tasks.length}{' '}
                            {column.tasks.length === 1 ? 'task' : 'tasks'}
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                        Lane
                      </span>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-2 py-3 pr-1">
                      {isLoading && !data
                        ? Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton
                              key={index}
                              className="h-[72px] w-full rounded-xl border border-emerald-500/10 bg-slate-900/60"
                            />
                          ))
                        : column.tasks.map((task, index) => (
                            <Draggable
                              draggableId={task.id}
                              index={index}
                              key={task.id}
                            >
                              {(
                                dragProvided: DraggableProvided,
                                dragSnapshot
                              ) => {
                                const card = (
                                  <Link
                                    to="/tasks/$taskId"
                                    params={{ taskId: task.id }}
                                    ref={dragProvided.innerRef}
                                    {...dragProvided.draggableProps}
                                    {...dragProvided.dragHandleProps}
                                    style={{
                                      ...(dragProvided.draggableProps
                                        .style as any),
                                      opacity: dragSnapshot.isDragging
                                        ? 0.95
                                        : 1,
                                    }}
                                    className={`group relative cursor-move rounded-xl border border-emerald-500/20 bg-slate-950/80 px-3 py-2.5 text-sm shadow-[0_0_18px_rgba(15,23,42,0.9)] transition-all hover:-translate-y-0.5 hover:border-emerald-400/80 hover:bg-slate-950 ${
                                      lastUpdatedTaskId === task.id
                                        ? 'shadow-[0_0_30px_rgba(16,185,129,0.7)] ring-2 ring-emerald-400'
                                        : 'hover:shadow-[0_0_26px_rgba(16,185,129,0.45)]'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <div className="mt-0.5 h-6 w-0.5 rounded-full bg-gradient-to-b from-emerald-400 via-green-400 to-emerald-500 opacity-80 group-hover:opacity-100" />
                                      <div className="flex flex-1 flex-col gap-1.5">
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="line-clamp-1 text-[13px] font-medium text-slate-50">
                                            {task.title}
                                          </div>
                                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)]">
                                            {task.priority}
                                          </span>
                                        </div>
                                        {task.description && (
                                          <div className="line-clamp-2 text-[11px] text-slate-300/85">
                                            {task.description}
                                          </div>
                                        )}
                                        <div className="mt-1 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-slate-500 group-hover:text-slate-300/90">
                                          <span className="flex items-center gap-1">
                                            <span className="h-1 w-1 rounded-full bg-emerald-400" />
                                            Jungle Task
                                          </span>
                                          <span className="text-emerald-300/80 group-hover:text-emerald-300">
                                            Ver detalhes
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </Link>
                                )

                                if (
                                  dragSnapshot.isDragging &&
                                  typeof document !== 'undefined'
                                ) {
                                  return createPortal(
                                    <div className="pointer-events-none fixed inset-0 z-[9999] flex items-start justify-start">
                                      <div className="pointer-events-auto">
                                        {card}
                                      </div>
                                    </div>,
                                    document.body
                                  )
                                }

                                return card
                              }}
                            </Draggable>
                          ))}
                      {provided.placeholder}
                    </CardContent>
                  </Card>
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>
    </div>
  )
}
