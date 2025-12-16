import { zodResolver } from '@hookform/resolvers/zod'
import { createRoute, useRouter } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Calendar as CalendarIcon } from 'lucide-react'
import { tasksLayoutRoute } from '@/routes/tasks.layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { TaskPriority, TaskStatus } from '@/lib/task-types'
import { createTaskMutationFn, usersListQueryOptions } from '@/lib/queries'
import { AssigneesMultiSelect } from '@/components/assignees-multi-select'

const createTaskSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.nativeEnum(TaskPriority),
  status: z.nativeEnum(TaskStatus).optional(),
  assigneeIds: z
    .array(z.string().uuid())
    .min(1, 'Informe pelo menos um responsável'),
})

type CreateTaskFormValues = z.infer<typeof createTaskSchema>

export const tasksNewRoute = createRoute({
  getParentRoute: () => tasksLayoutRoute,
  path: '/new',
  component: TasksNewPage,
})

function TasksNewPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: users, isLoading: isLoadingUsers } = useQuery(
    usersListQueryOptions()
  )

  const createTaskMutation = useMutation({
    mutationFn: createTaskMutationFn,
    onSuccess: () => {
      toast({
        title: 'Tarefa criada',
        description: 'Nova tarefa adicionada com sucesso.',
      })
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false })
      router.navigate({ to: '/tasks' })
    },
    onError: () => {
      toast({
        title: 'Erro ao criar tarefa',
        description: 'Não foi possível criar a tarefa. Tente novamente.',
        variant: 'destructive',
      })
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      priority: TaskPriority.MEDIUM,
    },
  })

  const dueDateValue = watch('dueDate')

  function onSubmit(values: CreateTaskFormValues) {
    return createTaskMutation.mutateAsync(values)
  }

  return (
    <div className="relative flex flex-1 flex-col gap-4">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 blur-3xl">
        <div className="mx-auto h-full max-w-3xl bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.4),transparent_60%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.25),transparent_55%)]" />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Nova tarefa</h1>
          <p className="text-sm text-muted-foreground">
            Crie uma nova tarefa para o squad da Jungle.
          </p>
        </div>
        <div className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-400 sm:flex sm:flex-col sm:items-end">
          <span className="flex items-center gap-2">
            <span className="h-1 w-8 rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500" />
            Jungle Tasks
          </span>
          <span className="text-xs text-muted-foreground">
            Modo criação em destaque
          </span>
        </div>
      </div>

      <Card className="relative max-w-3xl border-emerald-500/30 bg-slate-950/70 shadow-[0_0_40px_rgba(16,185,129,0.35)] backdrop-blur-md">
        <div className="pointer-events-none absolute inset-x-12 -top-px h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
        <CardHeader className="border-b border-emerald-500/20 pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span>Detalhes da tarefa</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
              Jungle Squad
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)]">
              <div className="space-y-1">
                <Label htmlFor="title">Título</Label>
                <div
                  className="glow-input-wrap"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const mx = e.clientX - rect.left
                    const my = e.clientY - rect.top
                    e.currentTarget.style.setProperty('--mx', `${mx}px`)
                    e.currentTarget.style.setProperty('--my', `${my}px`)
                  }}
                >
                  <Input
                    id="title"
                    placeholder="Definir estratégia para próximo torneio"
                    {...register('title')}
                  />
                </div>
                {errors.title && (
                  <p className="text-xs text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">Descrição</Label>
              <div
                className="glow-input-wrap"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const mx = e.clientX - rect.left
                  const my = e.clientY - rect.top
                  e.currentTarget.style.setProperty('--mx', `${mx}px`)
                  e.currentTarget.style.setProperty('--my', `${my}px`)
                }}
              >
                <Input
                  id="description"
                  placeholder="Contexto, objetivos e próximos passos..."
                  {...register('description')}
                />
              </div>
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="dueDate">Prazo</Label>
                <div
                  className="glow-input-wrap"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const mx = e.clientX - rect.left
                    const my = e.clientY - rect.top
                    e.currentTarget.style.setProperty('--mx', `${mx}px`)
                    e.currentTarget.style.setProperty('--my', `${my}px`)
                  }}
                >
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          'flex h-9 w-full items-center justify-start gap-2 rounded-md border border-input bg-background px-3 text-left text-sm font-normal text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                          !dueDateValue && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {dueDateValue ? (
                          <span>
                            {new Date(dueDateValue).toLocaleDateString(
                              'pt-BR',
                              {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              }
                            )}
                          </span>
                        ) : (
                          <span>Selecionar data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto border border-emerald-500/30 bg-slate-950/95 p-0 shadow-[0_18px_45px_rgba(16,185,129,0.45)]"
                      align="start"
                      sideOffset={8}
                    >
                      <Calendar
                        mode="single"
                        selected={
                          dueDateValue ? new Date(dueDateValue) : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            const iso = date.toISOString().slice(0, 10)
                            setValue('dueDate', iso, { shouldValidate: true })
                          } else {
                            setValue('dueDate', '', { shouldValidate: true })
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {errors.dueDate && (
                  <p className="text-xs text-destructive">
                    {errors.dueDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="priority">Prioridade</Label>
                <div
                  className="glow-input-wrap"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const mx = e.clientX - rect.left
                    const my = e.clientY - rect.top
                    e.currentTarget.style.setProperty('--mx', `${mx}px`)
                    e.currentTarget.style.setProperty('--my', `${my}px`)
                  }}
                >
                  <select
                    id="priority"
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register('priority')}
                  >
                    <option value={TaskPriority.LOW}>Baixa</option>
                    <option value={TaskPriority.MEDIUM}>Média</option>
                    <option value={TaskPriority.HIGH}>Alta</option>
                    <option value={TaskPriority.URGENT}>Urgente</option>
                  </select>
                </div>
                {errors.priority && (
                  <p className="text-xs text-destructive">
                    {errors.priority.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="status">Status inicial</Label>
                <div
                  className="glow-input-wrap"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const mx = e.clientX - rect.left
                    const my = e.clientY - rect.top
                    e.currentTarget.style.setProperty('--mx', `${mx}px`)
                    e.currentTarget.style.setProperty('--my', `${my}px`)
                  }}
                >
                  <select
                    id="status"
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register('status')}
                  >
                    <option value={TaskStatus.TODO}>Backlog</option>
                    <option value={TaskStatus.IN_PROGRESS}>Em progresso</option>
                    <option value={TaskStatus.REVIEW}>Em revisão</option>
                    <option value={TaskStatus.DONE}>Concluída</option>
                  </select>
                </div>
                {errors.status && (
                  <p className="text-xs text-destructive">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="assigneeIds">Responsáveis</Label>
              <AssigneesMultiSelect
                users={users}
                isLoading={isLoadingUsers}
                value={watch('assigneeIds') || []}
                onChange={(val) =>
                  setValue('assigneeIds', val, { shouldValidate: true })
                }
              />
              {errors.assigneeIds && (
                <p className="text-xs text-destructive">
                  {errors.assigneeIds.message}
                </p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-emerald-500/20 pt-4">
              <div className="hidden flex-1 text-[11px] text-muted-foreground md:block">
                <div className="flex items-center gap-2">
                  <span className="h-1 w-16 rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500" />
                  <span className="font-semibold uppercase tracking-[0.18em] text-emerald-400">
                    Jungle Flow
                  </span>
                </div>
                <p className="mt-1 text-xs">
                  Use títulos claros e defina prioridade para manter o squad
                  alinhado.
                </p>
              </div>

              <div className="flex flex-1 justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.navigate({ to: '/tasks' })}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || createTaskMutation.isPending}
                >
                  {isSubmitting || createTaskMutation.isPending ? (
                    <span className="flex flex-col items-center gap-1">
                      <span>Criando tarefa</span>
                      <span className="btn-loader-bar" />
                    </span>
                  ) : (
                    'Criar tarefa'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
