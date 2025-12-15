import { useMemo, useState } from 'react'
import { createRoute } from '@tanstack/react-router'
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
import {
  tasksListQueryOptions,
  type TaskItem,
  updateTaskMutationFn,
} from '@/lib/queries'

type ColumnId = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'

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
  const [page] = useState(1)
  const [size] = useState(50)

  const { data, isLoading } = useQuery(tasksListQueryOptions(page, size))

  const [localColumns, setLocalColumns] = useState<BoardColumn[] | null>(null)

  const initialColumns = useMemo<BoardColumn[]>(() => {
    const base: BoardColumn[] = [
      { id: 'TODO', title: 'A Fazer', tasks: [] },
      { id: 'IN_PROGRESS', title: 'Em Progresso', tasks: [] },
      { id: 'REVIEW', title: 'Em Revisão', tasks: [] },
      { id: 'DONE', title: 'Concluídas', tasks: [] },
    ]

    if (!data) return base

    const byColumn: Record<ColumnId, TaskItem[]> = {
      TODO: [],
      IN_PROGRESS: [],
      REVIEW: [],
      DONE: [],
    }

    for (const task of data.data) {
      const status = task.status as ColumnId
      if (byColumn[status]) {
        byColumn[status].push(task)
      } else {
        byColumn.TODO.push(task)
      }
    }

    return base.map((column) => ({
      ...column,
      tasks: byColumn[column.id],
    }))
  }, [data])

  const columns = localColumns ?? initialColumns

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
      updateTaskMutation.mutate({
        taskId: draggableId,
        status: destColumn.id,
      })
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Tarefas</h1>
      <div className="flex gap-4 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          {columns.map((column) => (
            <Droppable droppableId={column.id} key={column.id}>
              {(provided: DroppableProvided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex w-80 flex-col gap-2"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {column.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {isLoading && !data
                        ? Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton
                              key={index}
                              className="h-10 w-full bg-primary/10"
                            />
                          ))
                        : column.tasks.map((task, index) => (
                            <Draggable
                              draggableId={task.id}
                              index={index}
                              key={task.id}
                            >
                              {(dragProvided: DraggableProvided) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  className="cursor-move rounded-md border bg-card px-3 py-2 text-sm shadow-sm"
                                >
                                  <div className="font-medium">
                                    {task.title}
                                  </div>
                                  {task.description && (
                                    <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                      {task.description}
                                    </div>
                                  )}
                                </div>
                              )}
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
