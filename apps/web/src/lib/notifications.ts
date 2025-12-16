import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io, Socket } from 'socket.io-client'
import { create } from 'zustand'
import { useToast } from '@/components/ui/toast'
import { TaskStatus } from '@/lib/task-types'

let lastLocalTaskUpdate: { taskId: string; at: number } | null = null

export function markLocalTaskUpdate(taskId: string) {
  lastLocalTaskUpdate = { taskId, at: Date.now() }
}

type NotificationEvent =
  | {
      type: 'task:created'
      payload: {
        taskId: string
        title: string
      }
    }
  | {
      type: 'task:updated'
      payload: {
        taskId: string
        title: string
        status: TaskStatus
      }
    }
  | {
      type: 'comment:new'
      payload: {
        taskId: string
        commentId: string
        authorName: string
      }
    }

type NotificationUiState = {
  lastUpdatedTaskId: string | null
  setLastUpdatedTaskId: (id: string | null) => void
}

export const useNotificationUiStore = create<NotificationUiState>((set) => ({
  lastUpdatedTaskId: null,
  setLastUpdatedTaskId: (id) => set({ lastUpdatedTaskId: id }),
}))

export function useNotificationsSocket(userId: string | null) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!userId) return

    const url =
      window.location.protocol === 'https:'
        ? `https://${window.location.hostname}:3004`
        : `http://${window.location.hostname}:3004`

    const socket = io(url, {
      transports: ['websocket'],
      query: { userId },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    const statusToLabel: Record<TaskStatus, string> = {
      [TaskStatus.TODO]: 'A Fazer',
      [TaskStatus.IN_PROGRESS]: 'Em Progresso',
      [TaskStatus.REVIEW]: 'Em Revisão',
      [TaskStatus.DONE]: 'Concluída',
    }

    const handleEvent = (data: NotificationEvent) => {
      try {
        if (data.type === 'task:created') {
          toast({
            title: 'Nova tarefa',
            description: data.payload.title,
          })
          queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false })
        } else if (data.type === 'task:updated') {
          if (
            lastLocalTaskUpdate &&
            lastLocalTaskUpdate.taskId === data.payload.taskId &&
            Date.now() - lastLocalTaskUpdate.at < 1000
          ) {
            lastLocalTaskUpdate = null
            queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false })
            queryClient.invalidateQueries({
              queryKey: ['task', data.payload.taskId],
              exact: false,
            })
            return
          }
          const title =
            data.payload.title && data.payload.title.trim().length > 0
              ? data.payload.title
              : 'Tarefa atualizada'
          const status = data.payload.status
          const label = statusToLabel[status] ?? String(status)

          toast({
            title: 'Tarefa atualizada',
            description: `${title} → ${label}`,
          })
          queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false })
          queryClient.invalidateQueries({
            queryKey: ['task', data.payload.taskId],
            exact: false,
          })

          const store = useNotificationUiStore.getState()
          store.setLastUpdatedTaskId(data.payload.taskId)
          setTimeout(() => {
            const current = useNotificationUiStore.getState().lastUpdatedTaskId
            if (current === data.payload.taskId) {
              useNotificationUiStore.getState().setLastUpdatedTaskId(null)
            }
          }, 2500)
        } else if (data.type === 'comment:new') {
          toast({
            title: 'Novo comentário',
            description: `Novo comentário em uma tarefa`,
          })
          queryClient.invalidateQueries({
            queryKey: ['task-comments'],
            exact: false,
          })
        }
      } catch {}
    }

    socket.on('task:created', (payload: any) =>
      handleEvent({ type: 'task:created', payload })
    )
    socket.on('task:updated', (payload: any) =>
      handleEvent({ type: 'task:updated', payload })
    )
    socket.on('comment:new', (payload: any) =>
      handleEvent({ type: 'comment:new', payload })
    )

    return () => {
      socket.off('task:created')
      socket.off('task:updated')
      socket.off('comment:new')
      socket.disconnect()
      socketRef.current = null
    }
  }, [userId, queryClient, toast])
}
