import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { AcademicWeek } from '../data/schema'

type ScheduleWeekNavProps = {
  week: AcademicWeek
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export function ScheduleWeekNav({
  week,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onToday,
}: ScheduleWeekNavProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={onToday}>
        Hôm nay
      </Button>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Tuần trước"
          disabled={!canPrev}
          onClick={onPrev}
        >
          <ChevronLeft />
        </Button>
        <div className="min-w-40 px-2 text-center">
          <p className="text-sm font-semibold">{week.label}</p>
          <p className="text-xs text-muted-foreground">
            {week.startDate} – {week.endDate}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Tuần sau"
          disabled={!canNext}
          onClick={onNext}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
