import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

import { useToast } from '@/components/ui/toast'
import {
  type RegisterFormValues,
  registerSchema,
} from '@/features/auth/validation/register-schema'
import type { ApiError } from '@/lib/api'
import { registerMutationFn } from '@/lib/queries'

export function useRegisterForm() {
  const { toast } = useToast()
  const router = useRouter()

  const registerMutation = useMutation({
    mutationFn: registerMutationFn,
    onSuccess: () => {
      toast({
        title: 'Conta criada',
        description: 'Cadastro realizado com sucesso! Você já pode entrar.',
      })
      router.navigate({ to: '/login' })
    },
    onError: (error: ApiError) => {
      const message =
        error.status === 400 && error.message
          ? error.message
          : error.status === 409
            ? 'E-mail já cadastrado.'
            : error.message || 'Não foi possível criar a conta.'
      toast({
        title: 'Falha no cadastro',
        description: message,
        variant: 'destructive',
      })
    },
  })

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await registerMutation.mutateAsync(data)
    } catch {}
  })

  return {
    form,
    handleSubmit,
    isPending: registerMutation.isPending,
  }
}
