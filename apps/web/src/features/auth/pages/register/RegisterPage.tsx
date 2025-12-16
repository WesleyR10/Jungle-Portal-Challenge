import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import logo from '@/assets/logo.svg'

export function RegisterPage() {
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

          <RegisterForm />

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
