import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CalendarDays, Check, Clock3, MapPin, Users } from 'lucide-react'
import { type Lesson } from '../data/schema'

const statusMap = {
  PENDING: {
    label: 'Chưa điểm danh',
    className: 'text-muted-foreground',
    dot: 'bg-red-500',
  },
  COMPLETED: {
    label: 'Đã điểm danh',
    className: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  PARTIAL: {
    label: 'Chưa hoàn tất',
    className: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
}

export function LessonCard({
  lesson,
  onClick,
}: {
  lesson: Lesson
  onClick: () => void
}) {
  const status = statusMap[lesson.status]
  const isHomeroom = lesson.lessonKind === 'HOMEROOM'

  return (
    <button
      className="w-full text-left"
      onClick={onClick}
      aria-label={`Mở điểm danh ${lesson.subject} tiết ${lesson.period}`}
    >
      <Card
        className={cn(
          'rounded-md transition-colors hover:border-primary/60 hover:bg-muted/30',
          isHomeroom && 'border-violet-500/40 bg-violet-500/5',
        )}
      >
        <CardContent className="grid gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 className="size-3.5" />
                Tiết {lesson.period} · {lesson.startTime} - {lesson.endTime}
              </div>
              <h3
                className={cn(
                  'font-semibold',
                  isHomeroom && 'text-violet-700',
                )}
              >
                {lesson.subject}
              </h3>
              {isHomeroom ? (
                <p className="text-[11px] font-medium text-violet-700">
                  Sinh hoạt lớp · GVCN
                </p>
              ) : null}
            </div>
            <span
              className={cn('mt-1 size-2 shrink-0 rounded-full', status.dot)}
            />
          </div>
          <div className="grid gap-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <Users className="size-3.5" />
              {lesson.className} · {lesson.totalStudents} học sinh
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="size-3.5" />
              Phòng {lesson.room}
            </span>
          </div>
          <div
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium',
              status.className,
            )}
          >
            {lesson.status === 'COMPLETED' ? (
              <Check className="size-3.5" />
            ) : (
              <CalendarDays className="size-3.5" />
            )}
            {status.label}  
            {lesson.presentCount !== undefined &&
              ` · ${lesson.presentCount}/${lesson.totalStudents}`}
          </div>
          {/* <Badge variant="outline" className="w-fit text-[11px]">
            {lesson.dayLabel}, {formatLessonDisplayDate(lesson.date)}
          </Badge> */}
        </CardContent>
      </Card>
    </button>
  )
}
