import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  WEEKDAY_FULL,
  formatDisplayDateFull,
  type AcademicWeek,
  type DayOfWeek,
  type PeriodDefinition,
  type ScheduleLesson,
  type SessionType,
} from '../data/schema'
import type { EmptySlotContext } from '../types/slot'
import { ScheduleLessonCard } from './schedule-lesson-card'

type ScheduleDayViewProps = {
  week: AcademicWeek
  academicYear: string
  dayOfWeek: DayOfWeek
  lessons: ScheduleLesson[]
  periods: PeriodDefinition[]
  now?: Date
  onDayChange: (day: DayOfWeek) => void
  onOpenDetail: (lesson: ScheduleLesson) => void
  onEditLesson: (lesson: ScheduleLesson) => void
  onEmptyClick: (slot: EmptySlotContext) => void
}

export function ScheduleDayView({
  week,
  academicYear,
  dayOfWeek,
  lessons,
  periods,
  now = new Date(),
  onDayChange,
  onOpenDetail,
  onEditLesson,
  onEmptyClick,
}: ScheduleDayViewProps) {
  const dateIso = week.dates[dayOfWeek - 1]!
  const dayLessons = lessons.filter((item) => item.dayOfWeek === dayOfWeek)

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">
            {WEEKDAY_FULL[dayOfWeek]} · {formatDisplayDateFull(dateIso)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {dayLessons.length} tiết trong ngày
          </p>
        </div>
        <Select
          value={String(dayOfWeek)}
          onValueChange={(value) => onDayChange(Number(value) as DayOfWeek)}
        >
          <SelectTrigger className="w-44" aria-label="Chọn ngày trong tuần">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {([1, 2, 3, 4, 5] as DayOfWeek[]).map((day, index) => (
              <SelectItem key={day} value={String(day)}>
                {WEEKDAY_FULL[day]} · {week.dates[index]?.slice(8)}/
                {week.dates[index]?.slice(5, 7)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SessionTimeline
        title="Buổi sáng"
        session="morning"
        periods={periods}
        week={week}
        academicYear={academicYear}
        dayOfWeek={dayOfWeek}
        dateIso={dateIso}
        lessons={dayLessons}
        now={now}
        onOpenDetail={onOpenDetail}
        onEditLesson={onEditLesson}
        onEmptyClick={onEmptyClick}
      />
      <SessionTimeline
        title="Buổi chiều"
        session="afternoon"
        periods={periods}
        week={week}
        academicYear={academicYear}
        dayOfWeek={dayOfWeek}
        dateIso={dateIso}
        lessons={dayLessons}
        now={now}
        onOpenDetail={onOpenDetail}
        onEditLesson={onEditLesson}
        onEmptyClick={onEmptyClick}
      />
    </div>
  )
}

function SessionTimeline({
  title,
  session,
  periods,
  week,
  academicYear,
  dayOfWeek,
  dateIso,
  lessons,
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
  dayOfWeek: DayOfWeek
  dateIso: string
  lessons: ScheduleLesson[]
  now: Date
  onOpenDetail: (lesson: ScheduleLesson) => void
  onEditLesson: (lesson: ScheduleLesson) => void
  onEmptyClick: (slot: EmptySlotContext) => void
}) {
  const sessionPeriods = periods.filter((p) => p.session === session)
  if (sessionPeriods.length === 0) return null

  return (
    <section className="grid gap-2">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="grid gap-2">
        {sessionPeriods.map((period) => {
          const lesson = lessons.find(
            (item) =>
              item.date === dateIso &&
              item.session === session &&
              item.period === period.period,
          )
          return (
            <div
              key={`${session}-${period.period}`}
              className="grid gap-2 sm:grid-cols-[100px_1fr] sm:items-start"
            >
              <div className="pt-1 text-sm">
                <p className="font-medium">{period.label}</p>
                <p className="text-xs text-muted-foreground">
                  {period.startTime} – {period.endTime}
                </p>
              </div>
              {lesson ? (
                <ScheduleLessonCard
                  lesson={lesson}
                  now={now}
                  onOpenDetail={onOpenDetail}
                  onEdit={onEditLesson}
                />
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    onEmptyClick({
                      weekId: week.id,
                      academicYear,
                      date: dateIso,
                      dayOfWeek,
                      dayLabel: WEEKDAY_FULL[dayOfWeek],
                      session,
                      period: period.period,
                      startTime: period.startTime,
                      endTime: period.endTime,
                    })
                  }
                  className="flex min-h-16 items-center rounded-md border border-dashed border-muted-foreground/25 bg-muted/30 px-3 text-start transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="text-sm text-muted-foreground">
                    + Thêm lịch vào ô trống
                  </span>
                </button>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
