import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { CalendarDays, Clock3, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { gradesKeys } from '@/features/grades/api/query-keys'
import { GradesClassOverview } from '@/features/grades/components/grades-class-overview'
import {
  GRADES_SEMESTERS,
  toSemesterNumber,
} from '@/features/grades/lib/map-grades'
import { scheduleKeys } from '@/features/schedule/api/query-keys'
import { fetchLessons } from '@/features/schedule/api/schedule-api'
import { buildCalendarWeek } from '@/features/schedule/lib/calendar-week'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { cn } from '@/lib/utils'
import { type Class } from '../data/schema'
import { inferSemester } from '../lib/class-detail-helpers'
import {
  fetchClassTaughtGradeBooks,
  mapBooksToSubjectOverview,
} from '../lib/class-taught-grades'

type ClassSummaryPanelProps = {
  type: 'grades' | 'schedule'
  classItem: Class
}

export function ClassSummaryPanel({ type, classItem }: ClassSummaryPanelProps) {
  if (type === 'grades') return <GradesSummary classItem={classItem} />
  return <ScheduleSummary classItem={classItem} />
}

function GradesSummary({ classItem }: { classItem: Class }) {
  const navigate = useNavigate()
  const [semester, setSemester] = useState<'1' | '2'>(() => inferSemester())
  const schoolId = classItem.schoolId
  const academicYear = classItem.academicYear

  const booksQuery = useQuery({
    queryKey: [
      ...gradesKeys.all,
      'class-taught-books',
      schoolId,
      academicYear,
      toSemesterNumber(semester),
      classItem.id,
    ],
    queryFn: () =>
      fetchClassTaughtGradeBooks({
        schoolId,
        academicYear,
        semester,
        classId: classItem.id,
      }),
    enabled: Boolean(schoolId && academicYear && classItem.id),
    retry: false,
  })

  const items = mapBooksToSubjectOverview(booksQuery.data ?? [])

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Điểm môn đang dạy</h2>
          <p className="text-sm text-muted-foreground">
            {classItem.name} · {academicYear}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={semester}
            onValueChange={(value) => setSemester(value === '2' ? '2' : '1')}
          >
            <SelectTrigger className="w-[140px]" aria-label="Chọn học kỳ">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GRADES_SEMESTERS.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {booksQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Đang tải điểm môn…
        </div>
      ) : booksQuery.isError ? (
        <p className="text-sm text-muted-foreground">
          {getApiErrorMessage(
            booksQuery.error,
            'Không thể tải điểm môn cho lớp này.',
          )}
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Không có môn được gán để xem điểm trên lớp này.
        </p>
      ) : (
        <GradesClassOverview
          items={items}
          onSelectSubject={(subjectId) => {
            void navigate({
              to: '/grades',
              search: {
                classId: classItem.id,
                subjectId,
                year: academicYear,
                semester,
              },
            })
          }}
        />
      )}
    </div>
  )
}

function ScheduleSummary({ classItem }: { classItem: Class }) {
  const schoolId = classItem.schoolId
  const week = useMemo(() => buildCalendarWeek(new Date()), [])
  const from = week.dates[0]!
  const to = week.dates[week.dates.length - 1]!

  const lessonsQuery = useQuery({
    queryKey: scheduleKeys.lessons({
      schoolId,
      academicYear: classItem.academicYear,
      classId: classItem.id,
      from,
      to,
    }),
    queryFn: () =>
      fetchLessons({
        schoolId,
        academicYear: classItem.academicYear,
        classId: classItem.id,
        from,
        to,
      }),
    enabled: Boolean(schoolId && classItem.id),
  })

  const lessons = useMemo(() => {
    const rows = lessonsQuery.data ?? []
    return [...rows].sort((a, b) => {
      const byDate = a.date.localeCompare(b.date)
      if (byDate !== 0) return byDate
      return a.periodNumber - b.periodNumber
    })
  }, [lessonsQuery.data])

  return (
    <Card className="rounded-md">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="size-5" />
          Lịch học tuần này · {classItem.name}
        </CardTitle>
        <Link
          to="/schedule"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          Mở trang Lịch
        </Link>
      </CardHeader>
      <CardContent className="grid gap-3">
        <p className="text-xs text-muted-foreground">
          {week.label}: {from} → {to}
        </p>

        {lessonsQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Đang tải lịch học…
          </div>
        ) : lessonsQuery.isError ? (
          <p className="text-sm text-destructive">
            {getApiErrorMessage(
              lessonsQuery.error,
              'Không thể tải lịch học lớp.',
            )}
          </p>
        ) : lessons.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Không có tiết học trong tuần hiện tại.
          </p>
        ) : (
          lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 text-sm last:border-0 last:pb-0"
            >
              <span className="flex items-center gap-2">
                <Clock3 className="size-4 text-muted-foreground" />
                {lesson.dayLabel || lesson.date} · {lesson.startTime} -{' '}
                {lesson.endTime}
              </span>
              <span className="text-muted-foreground">
                {lesson.subjectName}
                {lesson.room?.trim() ? ` · ${lesson.room}` : ''}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
