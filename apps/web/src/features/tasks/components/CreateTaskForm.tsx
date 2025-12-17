import { Calendar as CalendarIcon } from 'lucide-react'

import { AssigneesMultiSelect } from '@/components/assignees-multi-select'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GlowInputWrapper } from '@/components/ui/glow-input-wrapper'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useCreateTaskForm } from '@/features/tasks/hooks/use-create-task-form'
import { TaskPriority, TaskStatus } from '@/lib/task-types'
import { cn } from '@/lib/utils'

export function CreateTaskForm() {
  const { form, users, isLoadingUsers, createTaskMutation, currentUserId } =
    useCreateTaskForm()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = form

  const dueDateValue = watch('dueDate')

  function onSubmit(
    values: Parameters<typeof handleSubmit>[0] extends (values: infer T) => any
      ? T
      : never
  ) {
    return createTaskMutation.mutateAsync(values as any)
  }

  return (
    <Card className="relative max-w-3xl border-emerald-500/30 bg-slate-950/70 shadow-[0_0_40px_rgba(16,185,129,0.35)] backdrop-blur-md">
      <div className="pointer-events-none absolute inset-x-12 -top-px h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
      <CardHeader className="border-b border-emerald-500/20 pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="text-highlight-foreground">Detalhes da tarefa</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Jungle Squad
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit as any)}>
          <div className="grid gap-4 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)]">
            <div className="space-y-1">
              <Label htmlFor="title" className="text-highlight-foreground">
                Título
              </Label>
              <GlowInputWrapper>
                <Input
                  id="title"
                  placeholder="Definir estratégia para próximo torneio"
                  {...register('title')}
                />
              </GlowInputWrapper>
              {errors.title && (
                <p className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description" className="text-highlight-foreground">
              Descrição
            </Label>
            <GlowInputWrapper>
              <Input
                id="description"
                placeholder="Contexto, objetivos e próximos passos..."
                {...register('description')}
              />
            </GlowInputWrapper>
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="dueDate" className="text-highlight-foreground">
                Prazo
              </Label>
              <GlowInputWrapper>
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
                          {new Date(dueDateValue).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
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
                      className="text-highlight-foreground"
                      classNames={{
                        chevron: 'text-emerald-50 fill-emerald-50',
                      }}
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
              </GlowInputWrapper>
              {errors.dueDate && (
                <p className="text-xs text-destructive">
                  {errors.dueDate.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="priority" className="text-highlight-foreground">
                Prioridade
              </Label>
              <GlowInputWrapper>
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
              </GlowInputWrapper>
              {errors.priority && (
                <p className="text-xs text-destructive">
                  {errors.priority.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="status" className="text-highlight-foreground">
                Status inicial
              </Label>
              <GlowInputWrapper>
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
              </GlowInputWrapper>
              {errors.status && (
                <p className="text-xs text-destructive">
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="assigneeIds" className="text-highlight-foreground">
              Responsáveis
            </Label>
            <AssigneesMultiSelect
              users={users}
              isLoading={isLoadingUsers}
              value={watch('assigneeIds') || []}
              currentUserId={currentUserId}
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
              <p className="mt-1 text-xs text-tertiary-foreground">
                Use títulos claros e defina prioridade para manter o squad
                alinhado.
              </p>
            </div>

            <div className="flex flex-1 justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => history.back()}
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
  )
}
