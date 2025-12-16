import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
import {
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/validation/login-schema'
import { useAuthStore } from '@/store/auth-store'
import { loginMutationFn } from '@/lib/queries'
import type { ApiError } from '@/lib/api'
import { useToast } from '@/components/ui/toast'

export function useLoginForm() {
  const loginStore = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()

  const loginMutation = useMutation({
    mutationFn: loginMutationFn,
    onSuccess: (tokens) => {
      loginStore.login(tokens)
      queryClient.setQueryData(['auth', 'isAuthenticated'], true)
      router.navigate({ to: '/tasks' })
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Falha no login',
        description:
          error.message || 'Não foi possível entrar. Tente novamente.',
        variant: 'destructive',
      })
    },
  })

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await loginMutation.mutateAsync(data)
    } catch {}
  })

  return {
    form,
    handleSubmit,
    isPending: loginMutation.isPending,
  }
}
