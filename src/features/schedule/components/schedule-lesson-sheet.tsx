import { Link } from '@tanstack/react-router'
import { Ban, MapPin, RefreshCw, TriangleAlert, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  WEEKDAY_FULL,
  formatDisplayDate,
  formatDisplayDateFull,
  getLessonScheduleStatus,
  type ScheduleLesson,
} from '../data/schema'

type ScheduleLessonSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  lesson: ScheduleLesson | null
  onEdit?: (lesson: ScheduleLesson) => void
}

export function ScheduleLessonSheet({
  open,
  onOpenChange,
  lesson,
  onEdit,
}: ScheduleLessonSheetProps) {
  const status = lesson ? getLessonScheduleStatus(lesson) : 'SCHEDULED'
  const cancelled = status === 'CANCELLED'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Chi tiết tiết học</SheetTitle>
          <SheetDescription>
            {lesson
              ? `${WEEKDAY_FULL[lesson.dayOfWeek]} · ${formatDisplayDateFull(lesson.date)}`
              : 'Thông tin tiết học'}
          </SheetDescription>
        </SheetHeader>

        {lesson ? (
          <div className="grid gap-4 px-4 pb-4">
            <div className="grid gap-1">
              <p
                className={
                  cancelled
                    ? 'text-lg font-semibold text-muted-foreground line-through'
                    : 'text-lg font-semibold'
                }
              >
                {lesson.subject}
              </p>
              <p
                className={
                  cancelled
                    ? 'text-sm text-muted-foreground line-through'
                    : 'text-sm text-muted-foreground'
                }
              >
                {lesson.className}
                {lesson.lessonKind === 'HOMEROOM' ? ' · Sinh hoạt lớp (GVCN)' : ''}
              </p>
            </div>

            {status === 'CHANGED' ? (
              <AlertBox tone="amber">
                <TriangleAlert className="size-4" />
                <div>
                  <p className="font-medium">Lịch thay đổi</p>
                  {lesson.originalRoom ? (
                    <p className="text-muted-foreground">
                      Phòng {lesson.originalRoom} → {lesson.room}
                    </p>
                  ) : null}
                  {lesson.originalDayLabel ? (
                    <p className="text-muted-foreground">
                      Dời từ {lesson.originalDayLabel}
                    </p>
                  ) : null}
                </div>
              </AlertBox>
            ) : null}

            {status === 'CANCELLED' ? (
              <AlertBox tone="destructive">
                <Ban className="size-4" />
                <div>
                  <p className="font-medium">Đã hủy</p>
                  <p className="text-muted-foreground">
                    {lesson.cancelReason ?? 'Không có lý do'}
                  </p>
                </div>
              </AlertBox>
            ) : null}

            {status === 'MAKEUP' && lesson.makeupForDate ? (
              <AlertBox tone="sky">
                <RefreshCw className="size-4" />
                <div>
                  <p className="font-medium">Dạy bù</p>
                  <p className="text-muted-foreground">
                    Bù cho tiết {formatDisplayDate(lesson.makeupForDate)}
                    {lesson.originalDayLabel
                      ? ` (${lesson.originalDayLabel})`
                      : ''}
                  </p>
                </div>
              </AlertBox>
            ) : null}

            <dl className="grid gap-2 text-sm">
              <Row
                label="Thời gian"
                value={`Tiết ${lesson.period} · ${lesson.startTime} – ${lesson.endTime}`}
              />
              <Row
                label="Buổi"
                value={lesson.session === 'morning' ? 'Sáng' : 'Chiều'}
              />
              <Row
                label="Phòng"
                value={
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {lesson.originalRoom && status === 'CHANGED'
                      ? `${lesson.originalRoom} → ${lesson.room}`
                      : lesson.room}
                  </span>
                }
              />
              <Row
                label="Sĩ số"
                value={
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3.5" />
                    {lesson.totalStudents} học sinh
                  </span>
                }
              />
            </dl>

            {!cancelled ? (
              <>
                <Separator />
                <div className="grid gap-1 text-sm">
                  <p className="font-medium">Điểm danh</p>
                  {lesson.attendanceStatus === 'COMPLETED' ? (
                    <ul className="grid gap-1 text-muted-foreground">
                      <li>✓ {lesson.presentCount ?? 0} có mặt</li>
                      <li>✗ {lesson.absentCount ?? 0} vắng</li>
                      <li>△ {lesson.lateCount ?? 0} đi trễ</li>
                    </ul>
                  ) : lesson.attendanceStatus === 'PARTIAL' ? (
                    <p className="text-amber-600">Điểm danh chưa hoàn tất</p>
                  ) : (
                    <p className="text-amber-600">Chưa điểm danh</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    render={
                      <Link
                        to="/attendance"
                        search={{ classId: lesson.classId }}
                      />
                    }
                  >
                    Điểm danh
                  </Button>
                  <Button
                    variant="outline"
                    render={
                      <Link
                        to="/classes/$classId"
                        params={{ classId: lesson.classId }}
                      />
                    }
                  >
                    Xem lớp
                  </Button>
                  <Button
                    variant="outline"
                    render={
                      <Link
                        to="/grades"
                        search={{
                          classId: lesson.className,
                          subjectId: lesson.subjectId,
                        }}
                      />
                    }
                  >
                    Xem bảng điểm
                  </Button>
                </div>
              </>
            ) : null}

            {onEdit ? (
              <Button
                type="button"
                variant={cancelled ? 'default' : 'outline'}
                onClick={() => onEdit(lesson)}
              >
                Sửa lịch
              </Button>
            ) : null}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function AlertBox({
  tone,
  children,
}: {
  tone: 'amber' | 'destructive' | 'sky'
  children: React.ReactNode
}) {
  const toneClass =
    tone === 'amber'
      ? 'border-amber-500/40 bg-amber-500/10 text-amber-900'
      : tone === 'sky'
        ? 'border-sky-500/40 bg-sky-500/10 text-sky-900'
        : 'border-destructive/40 bg-destructive/10 text-destructive'

  return (
    <div
      className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${toneClass}`}
    >
      {children}
    </div>
  )
}

function Row({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-end font-medium">{value}</dd>
    </div>
  )
}
