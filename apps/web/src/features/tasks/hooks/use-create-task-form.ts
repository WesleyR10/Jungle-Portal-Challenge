import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useToast } from '@/components/ui/toast'
import { TaskPriority } from '@/lib/task-types'
import { createTaskMutationFn, usersListQueryOptions } from '@/lib/queries'
import {
  createTaskSchema,
  type CreateTaskFormValues,
} from '@/features/tasks/validation/create-task-schema'
import { useAuthStore } from '@/store/auth-store'
import { getUserIdFromToken } from '@/features/tasks/hooks/use-tasks-board'

export function useCreateTaskForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const accessToken = useAuthStore((state) => state.accessToken)
  const currentUserId = getUserIdFromToken(accessToken)

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

  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: (() => {
      const assigneeIds =
        currentUserId && typeof currentUserId === 'string'
          ? [currentUserId]
          : []

      return {
        priority: TaskPriority.MEDIUM,
        assigneeIds,
      }
    })(),
  })

  return {
    form,
    users,
    isLoadingUsers,
    createTaskMutation,
    currentUserId,
  }
}
