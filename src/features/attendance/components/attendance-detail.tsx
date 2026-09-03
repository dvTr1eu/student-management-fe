import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Loader2,
  MapPin,
  Save,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatLessonDisplayDate } from '../lib/map-attendance'
import {
  type AttendanceStatus,
  type AttendanceStudent,
  type Lesson,
} from '../data/schema'
import { AttendanceStudentList } from './attendance-student-list'

export function AttendanceDetail({
  lesson,
  students,
  isLoading,
  isSaving,
  onBack,
  onChange,
  onSave,
}: {
  lesson: Lesson
  students: AttendanceStudent[]
  isLoading?: boolean
  isSaving?: boolean
  onBack: () => void
  onChange: (studentId: string, status: AttendanceStatus) => void
  onSave: () => void
}) {
  const counts = students.reduce(
    (result, student) => ({
      ...result,
      [student.status]: result[student.status] + 1,
    }),
    {
      UNMARKED: 0,
      PRESENT: 0,
      ABSENT: 0,
      LATE: 0,
      EXCUSED: 0,
    } as Record<AttendanceStatus, number>,
  )

  return (
    <div className="grid gap-4">
      <Button variant="ghost" className="w-fit px-0" onClick={onBack}>
        <ArrowLeft />
        Quay lại lịch tuần
      </Button>
      <Card className="rounded-md">
        <CardHeader className="gap-3 border-b">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p
                className={
                  lesson.lessonKind === 'HOMEROOM'
                    ? 'text-xs font-semibold tracking-wider text-violet-700 uppercase'
                    : 'text-xs font-semibold tracking-wider text-primary uppercase'
                }
              >
                {lesson.lessonKind === 'HOMEROOM'
                  ? 'Điểm danh · Sinh hoạt lớp'
                  : 'Điểm danh · Bộ môn'}
              </p>
              <CardTitle className="mt-1 text-xl">
                {lesson.className} · {lesson.subject}
              </CardTitle>
            </div>
            <Button onClick={onSave} disabled={isLoading || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" /> Đang lưu
                </>
              ) : (
                <>
                  <Save />
                  Lưu điểm danh
                </>
              )}
            </Button>
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              {lesson.dayLabel}, {formatLessonDisplayDate(lesson.date)}
            </span>
            <span className="flex items-center gap-2">
              <Clock3 className="size-4" />
              Tiết {lesson.period} · {lesson.startTime} - {lesson.endTime}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="size-4" />
              Phòng {lesson.room}
            </span>
            <span className="flex items-center gap-2">
              <Users className="size-4" />
              {students.length} học sinh
            </span>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 pt-5">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {[
                  ['UNMARKED', 'Chưa điểm danh', 'text-slate-600'],
                  ['PRESENT', 'Có mặt', 'text-emerald-600'],
                  ['ABSENT', 'Vắng', 'text-red-600'],
                  ['LATE', 'Đi trễ', 'text-amber-600'],
                  ['EXCUSED', 'Có phép', 'text-sky-600'],
                ].map(([key, label, tone]) => (
                  <div key={key} className="rounded-md border p-3">
                    <p className={cn('text-xl font-semibold', tone)}>
                      {counts[key as AttendanceStatus]}
                    </p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
              <AttendanceStudentList students={students} onChange={onChange} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
