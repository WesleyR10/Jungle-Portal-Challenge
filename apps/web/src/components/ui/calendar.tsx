import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  formatters,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={ptBR}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button:
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input bg-background text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground',
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell:
          'w-9 text-center text-[0.7rem] font-medium uppercase tracking-[0.08em] leading-none text-muted-foreground',
        weekdays: 'mt-1 flex w-full justify-between px-1',
        weekday:
          'w-8 text-center text-[0.7rem] font-medium uppercase tracking-[0.08em] leading-none text-muted-foreground',
        row: 'flex w-full mt-2',
        cell: 'relative h-9 w-9 text-center text-sm p-0 focus-within:relative focus-within:z-20',
        day: 'inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-normal aria-selected:opacity-100 hover:bg-emerald-500/15 hover:text-emerald-200 transition-colors mx-auto',
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full',
        day_today: 'bg-accent text-accent-foreground',
        day_outside: 'text-muted-foreground opacity-50',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      formatters={{
        ...formatters,
        formatWeekdayName: (weekday) =>
          weekday.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3),
      }}
      {...props}
    />
  )
}
