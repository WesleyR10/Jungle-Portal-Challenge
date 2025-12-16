import { useEffect, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createCommentMutationFn,
  taskCommentsQueryOptions,
  taskDetailQueryOptions,
  usersListQueryOptions,
} from '@/lib/queries'
import { useNotificationUiStore } from '@/lib/notifications'
import { taskDetailRoute } from '@/routes/tasks.$taskId'
import {
  taskCommentSchema,
  type TaskCommentFormValues,
} from '@/features/tasks/validation/task-comment-schema'
import { taskPriorityToLabel, taskStatusToLabel } from '@/lib/task-labels'

export function useTaskDetail() {
  const { taskId } = taskDetailRoute.useParams()
  const queryClient = useQueryClient()
  const typingTaskId = useNotificationUiStore((state) => state.typingTaskId)
  const typingUserId = useNotificationUiStore((state) => state.typingUserId)

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

  const commentItems = comments?.items ?? []

  const statusToLabel = taskStatusToLabel

  const priorityToLabel = taskPriorityToLabel

  const usersById = useMemo(() => {
    if (!users) return {}
    return Object.fromEntries(users.map((user) => [user.id, user]))
  }, [users])

  const form = useForm<TaskCommentFormValues>({
    resolver: zodResolver(taskCommentSchema),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form

  const createCommentMutation = useMutation({
    mutationFn: createCommentMutationFn(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] })
      reset()
    },
  })

  useEffect(() => {
    const socket = (window as any).jungleSocket as
      | import('socket.io-client').Socket
      | undefined
    if (!socket) return

    socket.emit('task:join', { taskId })

    return () => {
      socket.emit('task:leave', { taskId })
    }
  }, [taskId])

  function onSubmit(data: TaskCommentFormValues) {
    return createCommentMutation.mutateAsync(data)
  }

  return {
    taskId,
    task,
    isTaskLoading,
    taskError,
    users,
    isLoadingUsers,
    comments,
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
  }
}
