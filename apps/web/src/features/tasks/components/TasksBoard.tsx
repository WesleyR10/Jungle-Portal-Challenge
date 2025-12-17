import {
  DragDropContext,
  Draggable,
  type DraggableProvided,
  Droppable,
  type DroppableProvided,
} from '@hello-pangea/dnd'
import { Link } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TasksBoardHeader } from '@/features/tasks/components/TasksBoardHeader'
import { useTasksBoard } from '@/features/tasks/hooks/use-tasks-board'
import { TaskPriority } from '@/lib/task-types'

export function TasksBoard() {
  const {
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
  } = useTasksBoard()

  const [taskIdToDelete, setTaskIdToDelete] = useState<string | null>(null)

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4">
        <TasksBoardHeader />
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
              onChange={(event) => setPriorityFilter(event.target.value as any)}
            >
              <option value="ALL">Todas prioridades</option>
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start border-emerald-500/40 bg-slate-950/60 text-xs text-slate-200 hover:bg-slate-950 md:w-auto"
            onClick={() => {
              const cycle = ['ALL', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']
              const idx = cycle.indexOf(statusFilter as string)
              const next = cycle[(idx + 1) % cycle.length] as any
              setStatusFilter(next)
            }}
          >
            <span className="mr-2 h-3 w-3 rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
              Status:{' '}
              {statusFilter === 'ALL'
                ? 'Todos'
                : statusFilter === 'TODO'
                  ? 'Backlog'
                  : statusFilter === 'IN_PROGRESS'
                    ? 'Em Progresso'
                    : statusFilter === 'REVIEW'
                      ? 'Revisão'
                      : 'Concluídas'}
            </span>
          </Button>
        </div>
      </div>
      <div className="tasks-board-surface relative flex flex-1 gap-6 overflow-x-auto rounded-2xl border border-emerald-500/20 p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.8)]">
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
                                const showDelete = canDeleteTask(
                                  task,
                                  column.id
                                )

                                const cardContent = (
                                  <div className="flex items-start gap-2">
                                    <div className="mt-0.5 h-6 w-0.5 rounded-full bg-gradient-to-b from-emerald-400 via-green-400 to-emerald-500 opacity-80 group-hover:opacity-100" />
                                    <div className="flex flex-1 flex-col gap-1.5">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="line-clamp-1 text-[13px] font-medium text-slate-50">
                                          {task.title}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span
                                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] shadow-[0_0_12px_rgba(16,185,129,0.35)] ${
                                              task.priority === TaskPriority.LOW
                                                ? 'border border-emerald-500/50 bg-emerald-500/15 text-emerald-200'
                                                : task.priority ===
                                                    TaskPriority.MEDIUM
                                                  ? 'border border-sky-500/45 bg-sky-500/15 text-sky-100'
                                                  : task.priority ===
                                                      TaskPriority.HIGH
                                                    ? 'border border-amber-400/60 bg-amber-500/20 text-amber-100'
                                                    : 'border border-rose-500/70 bg-rose-600/25 text-rose-100'
                                            }`}
                                          >
                                            {task.priority}
                                          </span>
                                        </div>
                                      </div>
                                      {task.description && (
                                        <div className="line-clamp-2 text-[11px] text-slate-300/85">
                                          {task.description}
                                        </div>
                                      )}
                                      <div className="mt-1 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-500 group-hover:text-slate-300/90">
                                        <span className="flex items-center gap-1">
                                          <span className="h-1 w-1 rounded-full bg-emerald-400" />
                                          Jungle Task
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-emerald-300/80 group-hover:text-emerald-300">
                                            Ver detalhes
                                          </span>
                                          {showDelete && (
                                            <button
                                              type="button"
                                              aria-label="Excluir tarefa"
                                              className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-rose-500/60 bg-rose-600/20 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.35)] transition-colors hover:border-rose-400 hover:bg-rose-600/30 hover:text-rose-100"
                                              onClick={(event) => {
                                                event.preventDefault()
                                                event.stopPropagation()
                                                setTaskIdToDelete(task.id)
                                              }}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )

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
                                    {cardContent}
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
        <AlertDialog
          open={taskIdToDelete !== null}
          onOpenChange={(open: boolean) => {
            if (!open) {
              setTaskIdToDelete(null)
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir tarefa</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não poderá ser desfeita. Tem certeza que deseja
                excluir esta tarefa?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-rose-600 text-rose-50 hover:bg-rose-700"
                onClick={() => {
                  if (taskIdToDelete) {
                    void handleDeleteTask(taskIdToDelete)
                  }
                  setTaskIdToDelete(null)
                }}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
