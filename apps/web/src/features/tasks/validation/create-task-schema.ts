import { z } from 'zod'

import { TaskPriority, TaskStatus } from '@/lib/task-types'

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.nativeEnum(TaskPriority),
  status: z.nativeEnum(TaskStatus).optional(),
  assigneeIds: z
    .array(z.string().uuid())
    .min(1, 'Informe pelo menos um responsável'),
})

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>
