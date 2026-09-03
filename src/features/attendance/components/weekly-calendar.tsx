import {
  WEEKDAY_FULL,
  formatDisplayDate,
  formatDisplayDateFull,
  toIsoDate,
  type DayOfWeek,
} from '@/features/schedule/data/schema'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { type Lesson } from '../data/schema'
import { LessonCard } from './lesson-card'

const DAYS: DayOfWeek[] = [1, 2, 3, 4, 5]

type WeekInfo = {
  label: string
  startDate: string
  endDate: string
  dates: string[]
}

export function WeeklyCalendar({
  week,
  lessons,
  onPrev,
  onNext,
  onToday,
  onSelectLesson,
}: {
  week: WeekInfo
  lessons: Lesson[]
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onSelectLesson: (lesson: Lesson) => void
}) {
  const todayIso = toIsoDate(new Date())

  function lessonsForDay(iso: string) {
    const displayDate = formatDisplayDateFull(iso)
    return lessons.filter(
      (lesson) => lesson.date === iso || lesson.date === displayDate,
    )
  }

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            Lịch học trong tuần
          </p>
          <h2 className="text-lg font-semibold">
            {week.label} · {week.startDate} – {week.endDate}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Tuần trước"
            onClick={onPrev}
          >
            <ChevronLeft />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onToday}>
            Tuần này
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Tuần sau"
            onClick={onNext}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="hidden overflow-x-auto rounded-md border md:block">
        <div className="grid min-w-190 grid-cols-5 divide-x">
          {DAYS.map((day, index) => {
            const iso = week.dates[index]!
            const isToday = iso === todayIso
            const dayLessons = lessonsForDay(iso)
            return (
              <div
                key={day}
                className={`min-h-72 p-2 ${isToday ? 'bg-primary/5' : 'bg-muted/10'}`}
              >
                <div className="mb-3 border-b pb-2 text-center text-xs font-semibold">
                  {WEEKDAY_FULL[day]}
                  <span
                    className={`block font-normal ${isToday ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    {formatDisplayDate(iso)}
                    {isToday ? ' · Hôm nay' : ''}
                  </span>
                </div>
                <div className="grid gap-2">
                  {dayLessons.length ? (
                    dayLessons.map((lesson) => (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        onClick={() => onSelectLesson(lesson)}
                      />
                    ))
                  ) : (
                    <p className="px-2 text-center text-xs text-muted-foreground">
                      Không có tiết
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {DAYS.map((day, index) => {
          const iso = week.dates[index]!
          const dayLessons = lessonsForDay(iso)
          if (!dayLessons.length) return null
          return (
            <div key={day} className="grid gap-2">
              <h3 className="text-sm font-semibold">
                {WEEKDAY_FULL[day]}{' '}
                <span className="font-normal text-muted-foreground">
                  · {formatDisplayDateFull(iso)}
                </span>
              </h3>
              {dayLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onClick={() => onSelectLesson(lesson)}
                />
              ))}
            </div>
          )
        })}
      </div>
    </section>
  )
}
