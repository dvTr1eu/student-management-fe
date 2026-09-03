import { cn } from '@/lib/utils'
import type { AttendanceHubTab } from '../data/schema'

const TABS: { id: AttendanceHubTab; label: string }[] = [
  { id: 'lessons', label: 'Điểm danh tiết' },
  { id: 'punctuality', label: 'Chuyên cần' },
]

type AttendanceHubTabsProps = {
  value: AttendanceHubTab
  onChange: (value: AttendanceHubTab) => void
}

export function AttendanceHubTabs({ value, onChange }: AttendanceHubTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Chế độ điểm danh"
      className="flex w-fit gap-1 rounded-lg border p-1"
    >
      {TABS.map((tab) => (
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
