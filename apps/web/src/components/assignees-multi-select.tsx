import { User, Users } from 'lucide-react'
import { useMemo } from 'react'

import type { UserListItem } from '@/lib/queries'
import { cn } from '@/lib/utils'

type AssigneesMultiSelectProps = {
  users: UserListItem[] | undefined
  value: string[]
  onChange?: (value: string[]) => void
  isLoading?: boolean
  currentUserId?: string | null
}

export function AssigneesMultiSelect({
  users,
  value,
  isLoading,
  onChange,
  currentUserId,
}: AssigneesMultiSelectProps) {
  const selectedUsers = useMemo(
    () => users?.filter((u) => value.includes(u.id)) ?? [],
    [users, value]
  )

  const primaryAssignee = selectedUsers[0]

  const isInteractive = typeof onChange === 'function'

  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-500/35 bg-slate-950/80 px-3 py-2.5 text-sm shadow-[0_0_26px_rgba(16,185,129,0.3)]">
      <div className="mb-2 flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.18em] text-emerald-400">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5" />
          <span>Owner principal</span>
        </div>
        {selectedUsers.length > 1 && (
          <span className="text-[10px] text-emerald-300/80">
            +{selectedUsers.length - 1} no squad
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        {primaryAssignee ? (
          <>
            <div className="flex flex-1 items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-[11px] font-semibold text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.5)]">
                {primaryAssignee.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-emerald-50">
                  {primaryAssignee.name}
                </p>
                <p className="truncate text-[11px] text-emerald-300/80">
                  Squad owner
                </p>
              </div>
            </div>
            <div className="h-7 w-px bg-emerald-500/30" />
          </>
        ) : (
          <p className="flex-1 text-xs text-tertiary-foreground">
            Nenhum responsável definido para esta tarefa.
          </p>
        )}

        <div className="flex min-w-[120px] flex-col items-end gap-1 text-[10px]">
          {isLoading && (
            <span className="text-emerald-300/80">
              Carregando responsáveis…
            </span>
          )}
          {!isLoading &&
            primaryAssignee &&
            (currentUserId && primaryAssignee.id === currentUserId ? (
              <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-200">
                Você
              </span>
            ) : (
              <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-200">
                Responsável atual
              </span>
            ))}
          {!isLoading && !primaryAssignee && (
            <span className="text-emerald-300/80">
              Defina um responsável no board principal
            </span>
          )}
        </div>
      </div>

      {selectedUsers.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedUsers.slice(1).map((user) => (
            <span
              key={user.id}
              className={cn(
                'rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-100'
              )}
            >
              {user.name}
            </span>
          ))}
        </div>
      )}

      {isInteractive && users && (
        <div className="mt-3 max-h-32 overflow-y-auto border-t border-emerald-500/15 pt-2">
          {users.map((user) => {
            const active = value.includes(user.id)
            const isCurrentUser = currentUserId === user.id
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
                  if (!onChange) return
                  if (active) {
                    if (isCurrentUser) return
                    onChange(value.filter((id) => id !== user.id))
                  } else {
                    onChange([...value, user.id])
                  }
                }}
              >
                <span className="truncate">{user.name}</span>
                <span className="flex items-center gap-1">
                  {isCurrentUser ? (
                    <>
                      <User className="h-3 w-3 text-emerald-300/80" />
                      <span className="text-[10px] text-emerald-300/80">
                        Você
                      </span>
                    </>
                  ) : (
                    active && (
                      <span className="text-[10px] text-emerald-300">
                        selecionado
                      </span>
                    )
                  )}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
