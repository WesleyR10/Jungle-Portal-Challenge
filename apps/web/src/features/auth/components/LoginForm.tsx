import { Mail, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatefulButton } from '@/components/ui/stateful-button'
import { Card, CardContent } from '@/components/ui/card'
import { GlowInputWrapper } from '@/components/ui/glow-input-wrapper'
import { useLoginForm } from '@/features/auth/hooks/use-login-form'

export function LoginForm() {
  const { form, handleSubmit, isPending } = useLoginForm()
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
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80" />
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
            <Label htmlFor="password" className="block pb-1 text-left">
              Senha
            </Label>
            <GlowInputWrapper>
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
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

          <StatefulButton loading={isPending}>Entrar</StatefulButton>
        </form>
      </CardContent>
    </Card>
  )
}
