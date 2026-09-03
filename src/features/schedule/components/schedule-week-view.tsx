import { cn } from '@/lib/utils'
import {
  WEEKDAY_FULL,
  WEEKDAY_LABELS,
  formatDisplayDate,
  toIsoDate,
  type AcademicWeek,
  type DayOfWeek,
  type PeriodDefinition,
  type ScheduleLesson,
  type SessionType,
} from '../data/schema'
import type { EmptySlotContext } from '../types/slot'
import { ScheduleLessonCard } from './schedule-lesson-card'

const DAYS: DayOfWeek[] = [1, 2, 3, 4, 5]

type ScheduleWeekViewProps = {
  week: AcademicWeek
  academicYear: string
  lessons: ScheduleLesson[]
  periods: PeriodDefinition[]
  now?: Date
  onOpenDetail: (lesson: ScheduleLesson) => void
  onEditLesson: (lesson: ScheduleLesson) => void
  onEmptyClick: (slot: EmptySlotContext) => void
}

export function ScheduleWeekView({
  week,
  academicYear,
  lessons,
  periods,
  now = new Date(),
  onOpenDetail,
  onEditLesson,
  onEmptyClick,
}: ScheduleWeekViewProps) {
  const todayIso = toIsoDate(now)

  return (
    <div className="overflow-x-auto rounded-lg border">
      <div className="min-w-220">
        <div className="grid grid-cols-[88px_repeat(5,minmax(0,1fr))] border-b bg-muted/30">
          <div className="border-e p-2 text-xs font-medium text-muted-foreground">
            Tiết
          </div>
          {DAYS.map((day, index) => {
            const iso = week.dates[index]!
            const isToday = iso === todayIso
            return (
              <div
                key={day}
                className={cn(
                  'border-e p-2 text-center last:border-e-0',
                  isToday && 'bg-primary/8',
                )}
              >
                <p className="text-xs font-semibold">{WEEKDAY_LABELS[day]}</p>
                <p
                  className={cn(
                    'text-xs text-muted-foreground',
                    isToday && 'font-medium text-primary',
                  )}
                >
                  {formatDisplayDate(iso)}
                  {isToday ? ' · Hôm nay' : ''}
                </p>
              </div>
            )
          })}
        </div>

        <SessionBlock
          title="Buổi sáng"
          session="morning"
          periods={periods}
          week={week}
          academicYear={academicYear}
          lessons={lessons}
          todayIso={todayIso}
          now={now}
          onOpenDetail={onOpenDetail}
          onEditLesson={onEditLesson}
          onEmptyClick={onEmptyClick}
        />
        <SessionBlock
          title="Buổi chiều"
          session="afternoon"
          periods={periods}
          week={week}
          academicYear={academicYear}
          lessons={lessons}
          todayIso={todayIso}
          now={now}
          onOpenDetail={onOpenDetail}
          onEditLesson={onEditLesson}
          onEmptyClick={onEmptyClick}
        />
      </div>
    </div>
  )
}

function SessionBlock({
  title,
  session,
  periods,
  week,
  academicYear,
  lessons,
  todayIso,
  now,
  onOpenDetail,
  onEditLesson,
  onEmptyClick,
}: {
  title: string
  session: SessionType
  periods: PeriodDefinition[]
  week: AcademicWeek
  academicYear: string
  lessons: ScheduleLesson[]
  todayIso: string
  now: Date
  onOpenDetail: (lesson: ScheduleLesson) => void
  onEditLesson: (lesson: ScheduleLesson) => void
  onEmptyClick: (slot: EmptySlotContext) => void
}) {
  const sessionPeriods = periods.filter((p) => p.session === session)

  if (sessionPeriods.length === 0) return null

  return (
    <div>
      <div className="border-b bg-muted/50 px-3 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </div>
      {sessionPeriods.map((period) => (
        <div
          key={`${session}-${period.period}`}
          className="grid grid-cols-[88px_repeat(5,minmax(0,1fr))] border-b last:border-b-0"
        >
          <div className="border-e bg-muted/10 p-2">
            <p className="text-xs font-medium">{period.label}</p>
            <p className="text-[10px] text-muted-foreground">
              {period.startTime}–{period.endTime}
            </p>
          </div>
          {DAYS.map((day, index) => {
            const iso = week.dates[index]!
            const isToday = iso === todayIso
            const lesson = lessons.find(
              (item) =>
                item.date === iso &&
                item.session === session &&
                item.period === period.period,
            )
            return (
              <div
                key={`${day}-${period.period}`}
                className={cn(
                  'min-h-22 border-e p-1.5 last:border-e-0',
                  isToday && 'bg-primary/5',
                  !lesson && 'bg-muted/20',
                )}
              >
                {lesson ? (
                  <ScheduleLessonCard
                    lesson={lesson}
                    compact
                    now={now}
                    onOpenDetail={onOpenDetail}
                    onEdit={onEditLesson}
                  />
                ) : (
                  <EmptyPeriod
                    onClick={() =>
                      onEmptyClick({
                        weekId: week.id,
                        academicYear,
                        date: iso,
                        dayOfWeek: day,
                        dayLabel: WEEKDAY_FULL[day],
                        session,
                        period: period.period,
                        startTime: period.startTime,
                        endTime: period.endTime,
                      })
                    }
                  />
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function EmptyPeriod({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-full min-h-18 w-full items-center justify-center rounded-md border border-dashed border-muted-foreground/25 bg-muted/30 px-1 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
    >
      <span className="text-[11px] text-muted-foreground/80 hover:text-primary">
        + Thêm
      </span>
    </button>
  )
}
