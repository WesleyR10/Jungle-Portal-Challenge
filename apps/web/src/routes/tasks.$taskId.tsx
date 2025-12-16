import { z } from 'zod'
import { createRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tasksLayoutRoute } from '@/routes/tasks.layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  createCommentMutationFn,
  taskCommentsQueryOptions,
  taskDetailQueryOptions,
  usersListQueryOptions,
} from '@/lib/queries'
import { AssigneesMultiSelect } from '@/components/assignees-multi-select'

const commentSchema = z.object({
  content: z.string().min(1, 'Comentário não pode ser vazio'),
})

type CommentFormValues = z.infer<typeof commentSchema>

export const taskDetailRoute = createRoute({
  getParentRoute: () => tasksLayoutRoute,
  path: '/$taskId',
  component: TaskDetailPage,
})

function TaskDetailPage() {
  const { taskId } = taskDetailRoute.useParams()
  const queryClient = useQueryClient()

  const {
    data: task,
    isLoading: isTaskLoading,
    error: taskError,
  } = useQuery(taskDetailQueryOptions(taskId))

  const { data: users, isLoading: isLoadingUsers } = useQuery(
    usersListQueryOptions()
  )

  const {
    data: comments,
    isLoading: isCommentsLoading,
    error: commentsError,
  } = useQuery(taskCommentsQueryOptions(taskId, 1, 20))

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
  })

  const createCommentMutation = useMutation({
    mutationFn: createCommentMutationFn(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] })
      reset()
    },
  })

  function onSubmit(data: CommentFormValues) {
    return createCommentMutation.mutateAsync(data)
  }

  if (taskError) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-destructive">Erro ao carregar tarefa</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            {isTaskLoading || !task ? (
              <Skeleton className="h-6 w-40 bg-primary/20" />
            ) : (
              <CardTitle>{task.title}</CardTitle>
            )}
          </CardHeader>
          <CardContent>
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
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Status: {task.status}</span>
                  <span>Prioridade: {task.priority}</span>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
                    Responsáveis
                  </p>
                  <AssigneesMultiSelect
                    users={users}
                    isLoading={isLoadingUsers}
                    value={task.assigneeIds || []}
                    onChange={() => {}}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comentários</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {commentsError && (
              <p className="text-xs text-destructive">
                Erro ao carregar comentários
              </p>
            )}

            <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-1">
                <Label htmlFor="content">Novo comentário</Label>
                <Input
                  id="content"
                  placeholder="Digite um comentário..."
                  {...register('content')}
                />
                {errors.content && (
                  <p className="text-xs text-destructive">
                    {errors.content.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || createCommentMutation.isPending}
              >
                Adicionar comentário
              </Button>
            </form>

            <div className="space-y-3">
              {isCommentsLoading && !comments
                ? Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="space-y-1">
                      <Skeleton className="h-3 w-24 bg-primary/20" />
                      <Skeleton className="h-4 w-full bg-primary/10" />
                    </div>
                  ))
                : comments?.items.map((comment) => (
                    <div
                      key={comment.id}
                      className="space-y-1 rounded-md border bg-card px-3 py-2"
                    >
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{comment.authorName}</span>
                        <span>
                          {new Date(comment.createdAt).toLocaleString('pt-BR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
