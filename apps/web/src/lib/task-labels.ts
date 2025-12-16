import { TaskPriority, TaskStatus } from '@/lib/task-types'

export const taskStatusToLabel: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'A Fazer',
  [TaskStatus.IN_PROGRESS]: 'Em Progresso',
  [TaskStatus.REVIEW]: 'Em Revisão',
  [TaskStatus.DONE]: 'Concluída',
}

export const taskPriorityToLabel: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'Baixa',
  [TaskPriority.MEDIUM]: 'Média',
  [TaskPriority.HIGH]: 'Alta',
  [TaskPriority.URGENT]: 'Urgente',
}
