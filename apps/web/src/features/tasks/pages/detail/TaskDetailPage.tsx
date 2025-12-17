import { AssigneesMultiSelect } from '@/components/assignees-multi-select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GlowInputWrapper } from '@/components/ui/glow-input-wrapper'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useTaskDetail } from '@/features/tasks/hooks/use-task-detail'
import { TaskPriority, TaskStatus } from '@/lib/task-types'

export function TaskDetailPage() {
  const {
    taskId,
    task,
    isTaskLoading,
    taskError,
    users,
    isLoadingUsers,
    commentItems,
    isCommentsLoading,
    commentsError,
    statusToLabel,
    priorityToLabel,
    usersById,
    register,
    handleSubmit,
    errors,
    isSubmitting,
    typingTaskId,
    typingUserId,
    createCommentMutation,
    onSubmit,
  } = useTaskDetail()

  if (taskError) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-destructive">Erro ao carregar tarefa</p>
      </div>
    )
  }

  return (
    <div className="relative flex flex-1 flex-col gap-4">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 blur-3xl">
        <div className="mx-auto h-full max-w-4xl bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.4),transparent_60%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.25),transparent_55%)]" />
      </div>

      <div className="grid gap-4 md:grid-cols-[2.1fr,1.1fr]">
        <Card className="border-emerald-500/25 bg-slate-950/75 shadow-[0_0_40px_rgba(16,185,129,0.35)] backdrop-blur-md">
          <CardHeader className="border-b border-emerald-500/20 pb-3">
            {isTaskLoading || !task ? (
              <Skeleton className="h-6 w-40 bg-primary/20" />
            ) : (
              <CardTitle className="flex items-center justify-between text-base">
                <span>{task.title}</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
                  Jungle Task Detail
                </span>
              </CardTitle>
            )}
          </CardHeader>
          <CardContent className="pt-4">
            {isTaskLoading || !task ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-primary/10" />
                <Skeleton className="h-4 w-3/4 bg-primary/10" />
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {task.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <div className="inline-flex items-center gap-1 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.4)]" />
                    <span>Status:</span>
                    <span className="font-medium">
                      {statusToLabel[task.status as TaskStatus] ??
                        String(task.status)}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[11px] text-sky-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_0_4px_rgba(56,189,248,0.4)]" />
                    <span>Prioridade:</span>
                    <span className="font-medium">
                      {priorityToLabel[task.priority as TaskPriority] ??
                        String(task.priority)}
                    </span>
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
                    Owner da tarefa
                  </p>
                  <AssigneesMultiSelect
                    users={users}
                    isLoading={isLoadingUsers}
                    value={task.assigneeIds || []}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-emerald-500/25 bg-slate-950/75 shadow-[0_0_32px_rgba(16,185,129,0.3)] backdrop-blur-md">
          <CardHeader className="border-b border-emerald-500/20 pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span>Comentários</span>
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-400">
                Activity Feed
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {commentsError && (
              <p className="text-xs text-destructive">
                Erro ao carregar comentários
              </p>
            )}

            <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-1.5">
                <Label htmlFor="content">Novo comentário</Label>
                <GlowInputWrapper>
                  <Input
                    id="content"
                    placeholder="Digite um comentário..."
                    {...register('content', {
                      onChange: () => {
                        try {
                          const socket = (window as any).jungleSocket as
                            | import('socket.io-client').Socket
                            | undefined
                          if (!socket) return
                          socket.emit('task:typing', { taskId })
                        } catch {}
                      },
                    })}
                  />
                </GlowInputWrapper>
                {errors.content && (
                  <p className="text-xs text-destructive">
                    {errors.content.message}
                  </p>
                )}
              </div>
              {typingTaskId === taskId && typingUserId && (
                <p className="text-xs text-muted-foreground">
                  Outro membro está digitando...
                </p>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || createCommentMutation.isPending}
              >
                {isSubmitting || createCommentMutation.isPending ? (
                  <span className="flex flex-col items-center gap-1">
                    <span>Enviando</span>
                    <span className="btn-loader-bar" />
                  </span>
                ) : (
                  'Adicionar comentário'
                )}
              </Button>
            </form>

            <div className="space-y-3">
              {isCommentsLoading && !commentItems.length
                ? Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="space-y-1">
                      <Skeleton className="h-3 w-24 bg-primary/20" />
                      <Skeleton className="h-4 w-full bg-primary/10" />
                    </div>
                  ))
                : commentItems.map((comment) => {
                    const author = (
                      usersById as Record<string, { name: string }>
                    )[comment.authorId]
                    const displayName =
                      author?.name && author.name.trim().length > 0
                        ? author.name
                        : 'Membro do squad'

                    return (
                      <div
                        key={comment.id}
                        className="space-y-1 rounded-md border border-emerald-500/20 bg-slate-950/80 px-3 py-2 shadow-[0_0_20px_rgba(15,23,42,0.9)]"
                      >
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{displayName}</span>
                          <span>
                            {new Date(comment.createdAt).toLocaleString(
                              'pt-BR',
                              {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              }
                            )}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    )
                  })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
