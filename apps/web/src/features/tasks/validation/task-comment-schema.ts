import { z } from 'zod'

export const taskCommentSchema = z.object({
  content: z.string().min(1, 'Comentário não pode ser vazio'),
})

export type TaskCommentFormValues = z.infer<typeof taskCommentSchema>
