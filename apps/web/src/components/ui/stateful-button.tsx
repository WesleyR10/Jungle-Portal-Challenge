import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type StatefulButtonProps = {
  loading?: boolean
  className?: string
  children?: React.ReactNode
}

export function StatefulButton({
  loading,
  className,
  children,
}: StatefulButtonProps) {
  return (
    <Button
      type="submit"
      className={cn('group relative w-full overflow-hidden', className)}
      disabled={loading}
    >
      {loading ? (
        <span className="relative z-10 flex w-full items-center justify-center gap-2">
          <span>Processando...</span>
          <span className="inline-flex h-4 w-20 items-center justify-center">
            <span className="btn-loader-bar" />
          </span>
        </span>
      ) : (
        <span className="relative z-10">{children}</span>
      )}
      <span className="absolute inset-0 translate-y-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 transition-transform duration-500 group-hover:translate-y-0" />
    </Button>
  )
}
