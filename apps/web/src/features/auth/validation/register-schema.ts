import { z } from 'zod'

export const registerSchema = z
  .object({
    email: z.string().email('E-mail inválido'),
    username: z.string().min(3, 'Usuário deve ter pelo menos 3 caracteres'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
