import { apiFetch } from '@/lib/api'
import type { TaskPriority, TaskStatus } from '@/lib/task-types'

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  accessToken: string
  refreshToken: string
}

export function loginMutationFn(data: LoginPayload) {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export type RegisterPayload = {
  email: string
  username: string
  password: string
}

export function registerMutationFn(data: RegisterPayload) {
  return apiFetch<void>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export type UserListItem = {
  id: string
  name: string
}

export function usersListQueryOptions() {
  return {
    queryKey: ['users'] as const,
    queryFn: () =>
      apiFetch<UserListItem[]>('/api/auth/users', {
        auth: true,
      }),
  }
}

export type TaskItem = {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeIds: string[]
}

export type TasksResponse = {
  data: TaskItem[]
  total: number
  page: number
  size: number
}

export function tasksListQueryOptions(page: number, size: number) {
  return {
    queryKey: ['tasks', page, size] as const,
    queryFn: () =>
      apiFetch<TasksResponse>(`/api/tasks?page=${page}&size=${size}`, {
        auth: true,
      }),
  }
}

export type TaskDetail = {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeIds: string[]
}

export function taskDetailQueryOptions(taskId: string) {
  return {
    queryKey: ['task', taskId] as const,
    queryFn: () =>
      apiFetch<TaskDetail>(`/api/tasks/${taskId}`, {
        auth: true,
      }),
  }
}

export type Comment = {
  id: string
  content: string
  taskId: string
  authorId: string
  authorName: string
  createdAt: string
}

export type CommentsResponse = {
  items: Comment[]
  total: number
  page: number
  size: number
}

type CommentApi = {
  id: string
  content: string
  taskId: string
  authorId: string
  created_at: string
}

type CommentsApiResponse = {
  data: CommentApi[]
  total: number
  page: number
  size: number
}

function normalizeComment(raw: CommentApi): Comment {
  return {
    id: String(raw.id),
    content: String(raw.content ?? ''),
    taskId: String(raw.taskId),
    authorId: String(raw.authorId),
    authorName: String(raw.authorId),
    createdAt: String(
      // API devolve created_at; normalizamos para string ISO
      (raw as any).createdAt ??
        raw.created_at ??
        (raw as any).createdAtISO ??
        new Date().toISOString()
    ),
  }
}

export function taskCommentsQueryOptions(
  taskId: string,
  page: number,
  size: number
) {
  return {
    queryKey: ['task-comments', taskId, page, size] as const,
    queryFn: async () => {
      const res = await apiFetch<CommentsApiResponse>(
        `/api/tasks/${taskId}/comments?page=${page}&size=${size}`,
        {
          auth: true,
        }
      )
      const rawItems = Array.isArray(res.data) ? res.data : []
      const items = rawItems.map(normalizeComment)
      return {
        items,
        total: res?.total ?? items.length,
        page: res?.page ?? page,
        size: res?.size ?? size,
      } as CommentsResponse
    },
  }
}

export type CreateCommentPayload = {
  content: string
}

export function createCommentMutationFn(taskId: string) {
  return (data: CreateCommentPayload) =>
    apiFetch<Comment>(`/api/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
      auth: true,
    })
}

export type UpdateTaskPayload = {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  assigneeIds?: string[]
}

export function updateTaskMutationFn(taskId: string) {
  return (data: UpdateTaskPayload) =>
    apiFetch<TaskDetail>(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      auth: true,
    })
}

export type CreateTaskPayload = {
  title: string
  description?: string
  dueDate?: string
  priority: TaskPriority
  status?: TaskStatus
  assigneeIds: string[]
}

export function createTaskMutationFn(data: CreateTaskPayload) {
  return apiFetch<void>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
    auth: true,
  })
}

export function deleteTaskMutationFn(taskId: string) {
  return apiFetch<{ id: string }>(`/api/tasks/${taskId}`, {
    method: 'DELETE',
    auth: true,
  })
}
