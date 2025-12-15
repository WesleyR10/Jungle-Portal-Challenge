import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/toast'

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
        status: string
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

export function useNotificationsSocket(userId: string | null) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  useEffect(() => {
    if (!userId) return

    const wsUrl =
      window.location.protocol === 'https:'
        ? `wss://${window.location.hostname}:3004`
        : `ws://${window.location.hostname}:3004`

    const socket = new WebSocket(
      `${wsUrl}?userId=${encodeURIComponent(userId)}`
    )

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as NotificationEvent

        if (data.type === 'task:created') {
          toast({
            title: 'Nova tarefa',
            description: data.payload.title,
          })
          queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false })
        } else if (data.type === 'task:updated') {
          toast({
            title: 'Tarefa atualizada',
            description: `${data.payload.title} (${data.payload.status})`,
          })
          queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false })
          queryClient.invalidateQueries({
            queryKey: ['task', data.payload.taskId],
            exact: false,
          })
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
      } catch {
        // noop
      }
    }

    return () => {
      socket.close()
    }
  }, [userId, queryClient, toast])
}
