import { useQuery } from '@tanstack/react-query'
import {
  BookOpenText,
  CalendarDays,
  Loader2,
  TriangleAlert,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchClassPunctuality } from '@/features/attendance/api/attendance-api'
import { attendanceKeys } from '@/features/attendance/api/query-keys'
import { gradesKeys } from '@/features/grades/api/query-keys'
import { toSemesterNumber } from '@/features/grades/lib/map-grades'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { cn } from '@/lib/utils'
import { type Class } from '../data/schema'
import { currentMonthId, inferSemester } from '../lib/class-detail-helpers'
import {
  fetchClassTaughtGradeBooks,
  subjectAverageFromBooks,
} from '../lib/class-taught-grades'
import { ClassMetric } from './class-metric'

type ClassOverviewProps = {
  classItem: Class
}

export function ClassOverview({ classItem }: ClassOverviewProps) {
  const schoolId = classItem.schoolId
  const academicYear = classItem.academicYear
  const semester = inferSemester()
  const month = currentMonthId()

  const gradesQuery = useQuery({
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

  const punctualityQuery = useQuery({
    queryKey: attendanceKeys.classPunctuality(
      classItem.id,
      schoolId,
      month,
      true,
    ),
    queryFn: () => fetchClassPunctuality(classItem.id, schoolId, month),
    enabled: Boolean(schoolId && classItem.id),
    retry: false,
  })

  const { average: subjectAverage, subjectLabel } = subjectAverageFromBooks(
    gradesQuery.data ?? [],
  )

  const attentionStudents = (punctualityQuery.data?.students ?? [])
    .filter((row) => Number(row.rate) < 80)
    .sort((a, b) => Number(a.rate) - Number(b.rate))
    .slice(0, 8)

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <ClassMetric
          icon={Users}
          value={String(classItem.studentCount)}
          label="Học sinh"
        />
        <ClassMetric
          icon={BookOpenText}
          value={
            gradesQuery.isLoading
              ? '…'
              : subjectAverage == null
                ? '—'
                : subjectAverage.toFixed(1)
          }
          label={
            subjectLabel
              ? `Điểm TB · ${subjectLabel}`
              : 'Điểm trung bình'
          }
        />
        <ClassMetric
          icon={CalendarDays}
          value={String(classItem.weeklyPeriods)}
          label="Tiết / tuần"
        />
      </div>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TriangleAlert className="size-4 text-amber-500" />
            Học sinh cần chú ý
            <span className="font-normal text-muted-foreground">
              · chuyên cần tháng {month}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {punctualityQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Đang tải chuyên cần…
            </div>
          ) : punctualityQuery.isError ? (
            <p className="text-sm text-muted-foreground">
              {getApiErrorMessage(
                punctualityQuery.error,
                'Không thể tải chuyên cần lớp.',
              )}
            </p>
          ) : attentionStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Không có học sinh dưới 80% chuyên cần trong tháng này.
            </p>
          ) : (
            attentionStudents.map((student) => (
              <div
                key={student.studentId}
                className="flex items-center justify-between border-b pb-3 text-sm last:border-0 last:pb-0"
              >
                <span>{student.fullName}</span>
                <span className={cn('font-medium text-amber-500')}>
                  Chuyên cần {Math.round(Number(student.rate))}%
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
