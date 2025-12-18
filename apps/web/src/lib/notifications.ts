import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { create } from 'zustand'

import { useToast } from '@/components/ui/toast'
import { taskStatusToLabel } from '@/lib/task-labels'
import { TaskStatus } from '@/lib/task-types'

let lastLocalTaskUpdate: { taskId: string; at: number } | null = null
let lastTaskCreatedEvent: { taskId: string; at: number } | null = null
let lastSocketTaskUpdate: {
  taskId: string
  status: TaskStatus
  at: number
} | null = null
let lastCommentEvent: { taskId: string; commentId: string; at: number } | null =
  null

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
  typingTaskId: string | null
  typingUserId: string | null
  setTyping: (taskId: string | null, userId: string | null) => void
}

export const useNotificationUiStore = create<NotificationUiState>((set) => ({
  lastUpdatedTaskId: null,
  setLastUpdatedTaskId: (id) => set({ lastUpdatedTaskId: id }),
  typingTaskId: null,
  typingUserId: null,
  setTyping: (taskId, userId) =>
    set({ typingTaskId: taskId, typingUserId: userId }),
}))

export function useNotificationsSocket(userId: string | null) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!userId) {
      return
    }

    const url =
      window.location.protocol === 'https:'
        ? `https://${window.location.hostname}:3004`
        : `http://${window.location.hostname}:3004`

    const socket = io(url, {
      transports: ['polling', 'websocket'],
      query: { userId },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket
    ;(window as any).jungleSocket = socket
    socket.on('connect', () => {
      console.log(
        '[notifications] socket connected',
        socket.id,
        'userId=',
        userId
      )
      socket.emit('board:join')
    })
    socket.on('disconnect', (reason) => {
      console.log('[notifications] socket disconnected', reason)
    })

    const statusToLabel = taskStatusToLabel

    const handleEvent = (data: NotificationEvent) => {
      try {
        if (data.type === 'task:created') {
          if (
            lastTaskCreatedEvent &&
            lastTaskCreatedEvent.taskId === data.payload.taskId &&
            Date.now() - lastTaskCreatedEvent.at < 800
          ) {
            return
          }
          lastTaskCreatedEvent = {
            taskId: data.payload.taskId,
            at: Date.now(),
          }
          toast({
            title: 'Nova tarefa',
            description: data.payload.title,
          })
          queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false })
        } else if (data.type === 'task:updated') {
          console.log('[notifications] task:updated event', {
            payload: data.payload,
            now: Date.now(),
            lastSocketTaskUpdate,
          })
          if (
            lastSocketTaskUpdate &&
            lastSocketTaskUpdate.taskId === data.payload.taskId &&
            lastSocketTaskUpdate.status === data.payload.status &&
            Date.now() - lastSocketTaskUpdate.at < 800
          ) {
            return
          }
          lastSocketTaskUpdate = {
            taskId: data.payload.taskId,
            status: data.payload.status,
            at: Date.now(),
          }
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
          const status = data.payload.status
          const label = statusToLabel[status] ?? String(status)
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
          if (
            lastCommentEvent &&
            lastCommentEvent.taskId === data.payload.taskId &&
            lastCommentEvent.commentId === data.payload.commentId &&
            Date.now() - lastCommentEvent.at < 800
          ) {
            return
          }
          lastCommentEvent = {
            taskId: data.payload.taskId,
            commentId: data.payload.commentId,
            at: Date.now(),
          }
          toast({
            title: 'Novo comentário',
            description: `Novo comentário em uma tarefa`,
          })
          const taskId = data.payload.taskId
          if (taskId) {
            queryClient.invalidateQueries({
              queryKey: ['task-comments', taskId],
            })
            try {
              const hasData = !!queryClient.getQueryData([
                'task-comments',
                taskId,
                1,
                20,
              ])
              queryClient.refetchQueries({
                queryKey: ['task-comments', taskId],
                type: 'active',
              })
            } catch {}
          } else {
            queryClient.invalidateQueries({
              queryKey: ['task-comments'],
            })
          }
        }
      } catch {}
    }

    socket.on('task:created', (payload: any) =>
      handleEvent({ type: 'task:created', payload })
    )
    socket.on('task:updated', (payload: any) =>
      handleEvent({ type: 'task:updated', payload })
    )
    socket.on('comment:new', (payload: any) => {
      handleEvent({ type: 'comment:new', payload })
    })

    socket.on('task:typing', (payload: any) => {
      try {
        const taskId = payload?.taskId as string | undefined
        const userId = payload?.userId as string | undefined
        if (!taskId || !userId) return
        const store = useNotificationUiStore.getState()
        store.setTyping(taskId, userId)
        setTimeout(() => {
          const state = useNotificationUiStore.getState()
          if (state.typingTaskId === taskId && state.typingUserId === userId) {
            useNotificationUiStore.getState().setTyping(null, null)
          }
        }, 2000)
      } catch {}
    })

    return () => {
      socket.off('task:created')
      socket.off('task:updated')
      socket.off('comment:new')
      socket.off('task:typing')
      socket.emit('board:leave')
      socket.disconnect()
      socketRef.current = null
    }
  }, [userId, queryClient, toast])
}
