import { Lock, Mail, User } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { GlowInputWrapper } from '@/components/ui/glow-input-wrapper'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatefulButton } from '@/components/ui/stateful-button'
import { useRegisterForm } from '@/features/auth/hooks/use-register-form'

export function RegisterForm() {
  const { form, handleSubmit, isPending } = useRegisterForm()
  const {
    register,
    formState: { errors },
  } = form

  return (
    <Card className="border-transparent bg-transparent shadow-none">
      <CardContent className="pt-2">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <Label htmlFor="email" className="block pb-1 text-left">
              E-mail
            </Label>
            <GlowInputWrapper>
              <Mail className="auth-input-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seuemail@exemplo.com"
                className="pl-9"
                {...register('email')}
              />
            </GlowInputWrapper>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="username" className="block pb-1 text-left">
              Usuário
            </Label>
            <GlowInputWrapper>
              <User className="auth-input-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                id="username"
                autoComplete="username"
                placeholder="seu-usuario"
                className="pl-9"
                {...register('username')}
              />
            </GlowInputWrapper>
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
            <GlowInputWrapper>
              <Lock className="auth-input-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className="pl-9"
                {...register('password')}
              />
            </GlowInputWrapper>
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirmPassword" className="block pb-1 text-left">
              Confirmar senha
            </Label>
            <GlowInputWrapper>
              <Lock className="auth-input-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className="pl-9"
                {...register('confirmPassword')}
              />
            </GlowInputWrapper>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <StatefulButton loading={isPending}>Criar conta</StatefulButton>
        </form>
      </CardContent>
    </Card>
  )
}
