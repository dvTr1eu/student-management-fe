import { Link } from '@tanstack/react-router'
import {
  Ban,
  Check,
  MoreHorizontal,
  RefreshCw,
  TriangleAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  formatDisplayDate,
  getLessonScheduleStatus,
  isLessonCurrent,
  isLessonPast,
  type ScheduleLesson,
} from '../data/schema'

type ScheduleLessonCardProps = {
  lesson: ScheduleLesson
  compact?: boolean
  now?: Date
  onOpenDetail: (lesson: ScheduleLesson) => void
  onEdit?: (lesson: ScheduleLesson) => void
}

export function ScheduleLessonCard({
  lesson,
  compact = false,
  now = new Date(),
  onOpenDetail,
  onEdit,
}: ScheduleLessonCardProps) {
  const scheduleStatus = getLessonScheduleStatus(lesson)
  const cancelled = scheduleStatus === 'CANCELLED'
  const changed = scheduleStatus === 'CHANGED'
  const makeup = scheduleStatus === 'MAKEUP'
  const current = isLessonCurrent(lesson, now)
  const past = isLessonPast(lesson, now)
  const pending = !cancelled && lesson.attendanceStatus !== 'COMPLETED'

  return (
    <div
      className={cn(
        'relative rounded-md border bg-background p-2 text-start transition-colors',
        current && 'border-primary ring-1 ring-primary/30',
        past && !current && !cancelled && 'opacity-70',
        pending && !current && !changed && !makeup && lesson.lessonKind !== 'HOMEROOM' && 'border-amber-500/40',
        lesson.lessonKind === 'HOMEROOM' && !cancelled && 'border-violet-500/40 bg-violet-500/5',
        changed && 'border-amber-500/50 bg-amber-500/5',
        makeup && 'border-sky-500/50 bg-sky-500/5',
        cancelled && 'border-muted bg-muted/40 opacity-80',
      )}
    >
      {current ? (
        <p className="mb-1 text-[10px] font-semibold tracking-wide text-primary uppercase">
          Đang diễn ra
        </p>
      ) : null}

      <button
        type="button"
        className="w-full text-start"
        onClick={() => onOpenDetail(lesson)}
      >
        <p
          className={cn(
            'font-semibold',
            compact ? 'text-xs' : 'text-sm',
            cancelled && 'text-muted-foreground line-through',
            lesson.lessonKind === 'HOMEROOM' && !cancelled && 'text-violet-700',
          )}
        >
          {lesson.subject}
        </p>
        <p
          className={cn(
            'text-xs text-muted-foreground',
            cancelled && 'line-through',
          )}
        >
          {lesson.className}
          {lesson.lessonKind === 'HOMEROOM' ? ' · GVCN' : ''}
        </p>
        {!compact ? (
          <p className="mt-1 text-[11px] text-muted-foreground">
            {lesson.startTime} – {lesson.endTime}
          </p>
        ) : null}
        <p className="text-[11px] text-muted-foreground">
          {changed && lesson.originalRoom ? (
            <>
              P.{lesson.originalRoom} → <strong>{lesson.room}</strong>
            </>
          ) : (
            <>P.{lesson.room}</>
          )}
        </p>

        {cancelled ? (
          <p className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-medium text-destructive">
            <Ban className="size-3" />
            Đã hủy
            {lesson.cancelReason ? ` · ${lesson.cancelReason}` : ''}
          </p>
        ) : null}
        {changed ? (
          <p className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-700">
            <TriangleAlert className="size-3" />
            Lịch thay đổi
            {lesson.originalDayLabel
              ? ` · từ ${lesson.originalDayLabel}`
              : ''}
          </p>
        ) : null}
        {makeup && lesson.makeupForDate ? (
          <p className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-medium text-sky-700">
            <RefreshCw className="size-3" />
            Dạy bù cho {formatDisplayDate(lesson.makeupForDate)}
          </p>
        ) : null}
      </button>

      {!cancelled ? (
        <div className="mt-1.5 flex items-center justify-between gap-1">
          <StatusBadge lesson={lesson} />
          <div className="flex items-center gap-0.5">
            {pending ? (
              <Button
                size="xs"
                variant={current ? 'default' : 'outline'}
                render={
                  <Link
                    to="/attendance"
                    search={{ classId: lesson.classId }}
                  />
                }
              >
                {compact ? 'ĐD' : 'Điểm danh'}
              </Button>
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Thao tác tiết học"
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuItem asChild>
                  <Link to="/attendance" search={{ classId: lesson.classId }}>
                    Điểm danh
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/classes/$classId"
                    params={{ classId: lesson.classId }}
                  >
                    Xem lớp
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/grades"
                    search={{
                      classId: lesson.className,
                      subjectId: lesson.subjectId,
                    }}
                  >
                    Xem bảng điểm
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onOpenDetail(lesson)}>
                  Chi tiết tiết học
                </DropdownMenuItem>
                {onEdit ? (
                  <DropdownMenuItem onClick={() => onEdit(lesson)}>
                    Sửa lịch
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ) : (
        <div className="mt-1.5 flex items-center gap-1">
          <Button
            size="xs"
            variant="ghost"
            type="button"
            onClick={() => onOpenDetail(lesson)}
          >
            Chi tiết
          </Button>
          {onEdit ? (
            <Button
              size="xs"
              variant="outline"
              type="button"
              onClick={() => onEdit(lesson)}
            >
              Sửa
            </Button>
          ) : null}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ lesson }: { lesson: ScheduleLesson }) {
  if (lesson.attendanceStatus === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600">
        <Check className="size-3" />
        {lesson.presentCount != null
          ? `${lesson.presentCount}/${lesson.totalStudents}`
          : 'Đã điểm danh'}
      </span>
    )
  }
  if (lesson.attendanceStatus === 'PARTIAL') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600">
        <TriangleAlert className="size-3" />
        Chưa xong
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600">
      <TriangleAlert className="size-3" />
      Chưa ĐD
    </span>
  )
}
