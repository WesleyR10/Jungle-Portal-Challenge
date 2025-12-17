import type { DropResult } from '@hello-pangea/dnd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { useToast } from '@/components/ui/toast'
import {
  markLocalTaskUpdate,
  useNotificationUiStore,
} from '@/lib/notifications'
import {
  deleteTaskMutationFn,
  type TaskItem,
  tasksListQueryOptions,
  updateTaskMutationFn,
} from '@/lib/queries'
import { taskStatusToLabel } from '@/lib/task-labels'
import { TaskPriority, TaskStatus } from '@/lib/task-types'
import { useAuthStore } from '@/store/auth-store'

export function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null
  try {
    const [, payloadBase64] = token.split('.')
    if (!payloadBase64) return null
    const payloadJson = atob(
      payloadBase64.replace(/-/g, '+').replace(/_/g, '/')
    )
    const payload = JSON.parse(payloadJson) as { sub?: string; userId?: string }
    return (payload.userId as string) ?? (payload.sub as string) ?? null
  } catch {
    return null
  }
}

export type ColumnId = TaskStatus
export type StatusFilter = 'ALL' | TaskStatus
export type PriorityFilter = 'ALL' | TaskPriority

export type BoardColumn = {
  id: ColumnId
  title: string
  tasks: TaskItem[]
}

type UseTasksBoardResult = {
  columns: BoardColumn[]
  isLoading: boolean
  data: { data: TaskItem[] } | undefined
  search: string
  setSearch: (value: string) => void
  statusFilter: StatusFilter
  setStatusFilter: (value: StatusFilter) => void
  priorityFilter: PriorityFilter
  setPriorityFilter: (value: PriorityFilter) => void
  handleDragEnd: (result: DropResult) => void
  lastUpdatedTaskId: string | null
  handleDeleteTask: (taskId: string) => Promise<void>
  canDeleteTask: (task: TaskItem, columnId: ColumnId) => boolean
}

export function useTasksBoard(): UseTasksBoardResult {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const accessToken = useAuthStore((state) => state.accessToken)
  const userId = getUserIdFromToken(accessToken)
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

  const statusToLabel = taskStatusToLabel

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

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => deleteTaskMutationFn(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false })
      toast({
        title: 'Tarefa removida',
        description: 'A tarefa foi excluída com sucesso.',
      })
    },
    onError: () => {
      toast({
        title: 'Erro ao excluir tarefa',
        description: 'Não foi possível excluir a tarefa. Tente novamente.',
        variant: 'destructive',
      })
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

  function canDeleteTask(task: TaskItem, columnId: ColumnId): boolean {
    if (columnId !== TaskStatus.DONE) return false
    if (!userId) return false
    return Array.isArray(task.assigneeIds) && task.assigneeIds.includes(userId)
  }

  async function handleDeleteTask(taskId: string) {
    await deleteTaskMutation.mutateAsync(taskId)
  }

  return {
    columns,
    isLoading,
    data,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    handleDragEnd,
    lastUpdatedTaskId,
    handleDeleteTask,
    canDeleteTask,
  }
}
