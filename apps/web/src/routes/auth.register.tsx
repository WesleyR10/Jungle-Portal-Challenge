import { zodResolver } from '@hookform/resolvers/zod'
import { createRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { StatefulButton } from '@/components/ui/stateful-button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { rootRoute } from '@/routes/root'
import { registerMutationFn } from '@/lib/queries'
import type { ApiError } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import logo from '@/assets/logo.svg'
import { ArrowLeft, Mail, User, Lock } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'

const registerSchema = z
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

type RegisterFormValues = z.infer<typeof registerSchema>

export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  beforeLoad: ({ context }) => {
    const isAuthenticated = context.queryClient.getQueryData<boolean>([
      'auth',
      'isAuthenticated',
    ])

    if (isAuthenticated) {
      throw redirect({ to: '/tasks' })
    }
  },
  component: RegisterPage,
})

function RegisterPage() {
  const { toast } = useToast()
  const router = useRouter()

  const registerMutation = useMutation({
    mutationFn: registerMutationFn,
    onSuccess: () => {
      toast({
        title: 'Conta criada',
        description: 'Cadastro realizado com sucesso! Você já pode entrar.',
      })
    },
    onError: (error: ApiError) => {
      const msg =
        error.status === 400 && error.message
          ? error.message
          : error.status === 409
            ? 'E-mail já cadastrado.'
            : error.message || 'Não foi possível criar a conta.'
      toast({
        title: 'Falha no cadastro',
        description: msg,
        variant: 'destructive',
      })
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterFormValues) {
    try {
      await registerMutation.mutateAsync(data)
      router.navigate({ to: '/login' })
    } catch {
      // já tratado por toast
    }
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
            <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
            <p className="text-sm text-muted-foreground">
              Personalize sua experiência na plataforma Jungle.
            </p>
          </div>
          <Card className="border-transparent bg-transparent shadow-none">
            <CardContent className="pt-2">
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
                  <Label htmlFor="username" className="block pb-1 text-left">
                    Usuário
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
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80" />
                    <Input
                      id="username"
                      autoComplete="username"
                      placeholder="seu-usuario"
                      className="pl-9"
                      {...register('username')}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-destructive">
                      {errors.username.message}
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
                      autoComplete="new-password"
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
                <div className="space-y-1">
                  <Label
                    htmlFor="confirmPassword"
                    className="block pb-1 text-left"
                  >
                    Confirmar senha
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
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className="pl-9"
                      {...register('confirmPassword')}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <StatefulButton loading={registerMutation.isPending}>
                  Criar conta
                </StatefulButton>
              </form>
            </CardContent>
          </Card>
          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              Entrar
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
            <h2 className="text-3xl font-semibold">Comece agora</h2>
            <p className="mt-2 text-sm text-white/80">
              Cadastre-se e explore uma interface moderna inspirada no site da
              Jungle.
            </p>
            <div className="mt-6 h-2 w-full rounded-full bg-white/20">
              <div className="h-2 w-3/4 rounded-full bg-white/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
