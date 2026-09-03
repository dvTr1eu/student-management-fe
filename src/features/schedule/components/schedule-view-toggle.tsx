import { cn } from '@/lib/utils'
import type { ScheduleViewMode } from '../data/schema'

type ScheduleViewToggleProps = {
  value: ScheduleViewMode
  onChange: (value: ScheduleViewMode) => void
}

export function ScheduleViewToggle({
  value,
  onChange,
}: ScheduleViewToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Chế độ xem lịch"
      className="flex w-fit gap-1 rounded-lg border p-1"
    >
      {(
        [
          { id: 'week', label: 'Tuần' },
          { id: 'day', label: 'Ngày' },
        ] as const
      ).map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            value === tab.id
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
