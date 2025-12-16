import { useMemo } from 'react'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserListItem } from '@/lib/queries'

type AssigneesMultiSelectProps = {
  users: UserListItem[] | undefined
  value: string[]
  onChange: (value: string[]) => void
  isLoading?: boolean
}

export function AssigneesMultiSelect({
  users,
  value,
  onChange,
  isLoading,
}: AssigneesMultiSelectProps) {
  const selectedUsers = useMemo(
    () => users?.filter((u) => value.includes(u.id)) ?? [],
    [users, value]
  )

  return (
    <div className="relative overflow-hidden rounded-md border border-emerald-500/30 bg-slate-950/70 px-3 py-2 text-sm shadow-[0_0_25px_rgba(16,185,129,0.22)] transition hover:border-emerald-400/70">
      <div className="mb-2 flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.18em] text-emerald-400">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5" />
          <span>Squad owners</span>
        </div>
        <span className="text-[10px] text-emerald-300/80">
          {selectedUsers.length} selecionado(s)
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {selectedUsers.length === 0 && (
          <span className="text-xs text-muted-foreground">
            Selecione pelo menos um responsável
          </span>
        )}
        {selectedUsers.map((user) => (
          <button
            key={user.id}
            type="button"
            className="group inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-100 transition hover:border-emerald-300 hover:bg-emerald-500/20"
            onClick={() => onChange(value.filter((id) => id !== user.id))}
          >
            <span className="max-w-[120px] truncate">{user.name}</span>
            <span className="text-emerald-300/80 group-hover:text-emerald-100">
              ×
            </span>
          </button>
        ))}
      </div>

      <div className="mt-3 max-h-32 overflow-y-auto border-t border-emerald-500/15 pt-2">
        {isLoading && (
          <p className="text-[11px] text-muted-foreground">
            Carregando usuários...
          </p>
        )}
        {!isLoading && (!users || users.length === 0) && (
          <p className="text-[11px] text-muted-foreground">
            Nenhum usuário encontrado.
          </p>
        )}
        {!isLoading &&
          users?.map((user) => {
            const active = value.includes(user.id)
            return (
              <button
                key={user.id}
                type="button"
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-2 py-1 text-xs transition',
                  active
                    ? 'bg-emerald-500/15 text-emerald-100'
                    : 'text-slate-200 hover:bg-emerald-500/10'
                )}
                onClick={() => {
                  if (active) {
                    onChange(value.filter((id) => id !== user.id))
                  } else {
                    onChange([...value, user.id])
                  }
                }}
              >
                <span className="truncate">{user.name}</span>
                {active && (
                  <span className="text-[10px] text-emerald-300">
                    selecionado
                  </span>
                )}
              </button>
            )
          })}
      </div>
    </div>
  )
}
