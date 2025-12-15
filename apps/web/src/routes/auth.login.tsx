import { zodResolver } from '@hookform/resolvers/zod'
import { createRoute, redirect, Link } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { StatefulButton } from '@/components/ui/stateful-button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { rootRoute } from '@/routes/root'
import { useAuthStore } from '@/store/auth-store'
import { loginMutationFn } from '@/lib/queries'
import type { ApiError } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import logo from '@/assets/logo.svg'
import { ModeToggle } from '@/components/mode-toggle'
import { ArrowLeft, Mail, Lock } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

function LoginPage() {
  const loginStore = useAuthStore()
  const { toast } = useToast()

  const loginMutation = useMutation({
    mutationFn: loginMutationFn,
    onSuccess: (tokens) => {
      loginStore.login(tokens)
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormValues) {
    await loginMutation.mutateAsync(data)
    throw redirect({ to: '/tasks' })
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-gradient-to-br from-emerald-700 via-emerald-600 to-green-500 md:grid-cols-2">
      <div className="flex flex-col items-center justify-center bg-background/85 p-8 backdrop-blur-sm md:rounded-r-[32px]">
        <div className="flex w-full max-w-md flex-col gap-6">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
            <div className="flex items-center gap-3">
              <img src={logo} alt="Jungle" className="h-8" />
              <ModeToggle />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Bem-vindo à Jungle
            </h1>
            <p className="text-sm text-muted-foreground">
              Entre para gerenciar suas tarefas do portal.
            </p>
          </div>
          <Card className="border-transparent bg-transparent shadow-none">
            <CardContent className="pt-2">
              {(isSubmitting || loginMutation.isPending) && (
                <Skeleton className="mb-4 h-3 w-24 bg-primary/30" />
              )}
              <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-1">
                  <Label htmlFor="email" className="block pb-1 text-left">
                    E-mail
                  </Label>
                  <div
                    className="glow-input-wrap"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const mx = e.clientX - rect.left
                      const my = e.clientY - rect.top
                      e.currentTarget.style.setProperty('--mx', `${mx}px`)
                      e.currentTarget.style.setProperty('--my', `${my}px`)
                    }}
                  >
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="seuemail@exemplo.com"
                      className="pl-9"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password" className="block pb-1 text-left">
                    Senha
                  </Label>
                  <div
                    className="glow-input-wrap"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const mx = e.clientX - rect.left
                      const my = e.clientY - rect.top
                      e.currentTarget.style.setProperty('--mx', `${mx}px`)
                      e.currentTarget.style.setProperty('--my', `${my}px`)
                    }}
                  >
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="pl-9"
                      {...register('password')}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <StatefulButton
                  loading={isSubmitting || loginMutation.isPending}
                >
                  Entrar
                </StatefulButton>
              </form>
            </CardContent>
          </Card>
          <p className="text-center text-sm text-muted-foreground">
            Não tem conta?{' '}
            <Link
              to="/register"
              className="font-medium text-primary hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
      <div className="relative hidden md:block">
        <div className="absolute inset-0">
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-white/5 to-transparent" />
          <div className="absolute inset-6 rounded-[32px] border border-white/10 bg-transparent backdrop-blur-xl" />
        </div>
        <div className="relative z-10 flex h-full items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-transparent p-6 text-white shadow-2xl backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <img src={logo} alt="Jungle" className="h-6 invert" />
              <span className="text-sm uppercase tracking-widest">
                Jungle Gaming
              </span>
            </div>
            <h2 className="text-3xl font-semibold">Plataforma Premium</h2>
            <p className="mt-2 text-sm text-white/80">
              Experiência moderna com visual ousado, animações suaves e
              performance de alto nível.
            </p>
            <div className="mt-6 h-2 w-full rounded-full bg-white/20">
              <div className="h-2 w-1/2 rounded-full bg-white/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
