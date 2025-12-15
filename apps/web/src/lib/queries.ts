import { apiFetch } from '@/lib/api'

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

export type TaskItem = {
  id: string
  title: string
  description: string
  status: string
  priority: string
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
  status: string
  priority: string
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
  authorName: string
  createdAt: string
}

export type CommentsResponse = {
  items: Comment[]
  total: number
  page: number
  size: number
}

export function taskCommentsQueryOptions(
  taskId: string,
  page: number,
  size: number
) {
  return {
    queryKey: ['task-comments', taskId, page, size] as const,
    queryFn: () =>
      apiFetch<CommentsResponse>(
        `/api/tasks/${taskId}/comments?page=${page}&size=${size}`,
        {
          auth: true,
        }
      ),
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
  status?: string
  priority?: string
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
