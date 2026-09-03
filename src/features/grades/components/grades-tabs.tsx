import { cn } from '@/lib/utils'
import type { GradeTab } from '../data/schema'

const TABS: { id: GradeTab; label: string }[] = [
  { id: 'scores', label: 'Bảng điểm' },
  { id: 'summary', label: 'Tổng kết' },
  { id: 'stats', label: 'Thống kê' },
]

type GradesTabsProps = {
  value: GradeTab
  onChange: (value: GradeTab) => void
  disabled?: boolean
}

export function GradesTabs({ value, onChange, disabled }: GradesTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Chế độ xem điểm"
      className="flex w-fit gap-1 rounded-lg border p-1"
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          disabled={disabled}
          onClick={() => onChange(tab.id)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            value === tab.id
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            disabled && 'pointer-events-none opacity-50',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
