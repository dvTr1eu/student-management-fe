import type { LessonDto } from '@/features/schedule/api/schedule-api'
import {
  formatDisplayDateFull,
  type DayOfWeek,
} from '@/features/schedule/data/schema'
import type {
  ClassPunctualityDto,
  LessonAttendanceDto,
  LessonAttendanceStudentDto,
} from '../api/attendance-api'
import type {
  AttendanceClassOption,
  AttendanceLessonKind,
  AttendanceStatus,
  Lesson,
  PunctualityMonth,
  StudentPunctualityRow,
} from '../data/schema'

export const ATTENDANCE_ACADEMIC_YEARS = ['2025-2026', '2026-2027'] as const

export function formatAcademicYearLabel(year: string): string {
  return year.replace('-', ' - ')
}

function toFeLessonKind(value: string): AttendanceLessonKind {
  return value.toUpperCase() === 'HOMEROOM' ? 'HOMEROOM' : 'SUBJECT'
}

function toFeLessonStatus(
  value: string,
): Lesson['status'] {
  const upper = value.toUpperCase()
  if (upper === 'COMPLETED') return 'COMPLETED'
  if (upper === 'PARTIAL') return 'PARTIAL'
  return 'PENDING'
}

export function toApiAttendanceStatus(status: AttendanceStatus): string {
  const map: Record<AttendanceStatus, string> = {
    UNMARKED: 'Unmarked',
    PRESENT: 'Present',
    ABSENT: 'Absent',
    LATE: 'Late',
    EXCUSED: 'Excused',
  }
  return map[status]
}

function toFeStudentStatus(
  value?: string | null,
): AttendanceStatus {
  if (!value) return 'UNMARKED'
  const upper = value.toUpperCase()
  if (upper === 'UNMARKED' || upper === 'NONE') return 'UNMARKED'
  if (upper === 'PRESENT' || upper === 'ABSENT' || upper === 'LATE' || upper === 'EXCUSED') {
    return upper as AttendanceStatus
  }
  return 'UNMARKED'
}

/** Map Lessons list DTO → attendance calendar card. */
export function mapAttendanceLesson(dto: LessonDto): Lesson {
  return {
    id: dto.id,
    weekId: dto.weekId,
    date: dto.date,
    dayLabel: dto.dayLabel || formatDayLabel(dto.dayOfWeek),
    period: dto.periodNumber,
    startTime: dto.startTime,
    endTime: dto.endTime,
    subject: dto.subjectName,
    subjectId: dto.subjectId,
    className: dto.className,
    classId: dto.classId,
    room: dto.room?.trim() || '—',
    lessonKind: toFeLessonKind(dto.lessonKind),
    status: toFeLessonStatus(dto.attendanceStatus),
    presentCount: dto.presentCount,
    totalStudents: dto.totalStudents,
  }
}

function formatDayLabel(dayOfWeek: number): string {
  const labels: Record<number, string> = {
    1: 'Thứ Hai',
    2: 'Thứ Ba',
    3: 'Thứ Tư',
    4: 'Thứ Năm',
    5: 'Thứ Sáu',
  }
  return labels[dayOfWeek] ?? ''
}

export function mapAttendanceStudents(
  dto: LessonAttendanceDto,
): Array<{
  id: string
  name: string
  code: string
  status: AttendanceStatus
  reason?: string
  note?: string
}> {
  return dto.students.map((row: LessonAttendanceStudentDto) => ({
    id: row.studentId,
    name: row.fullName,
    code: row.studentCode,
    status: toFeStudentStatus(row.status),
    reason: row.reason ?? undefined,
    note: row.note ?? undefined,
  }))
}

export function mapClassOptionsFromMeta(
  classes: Array<{ id: string; name: string }>,
): AttendanceClassOption[] {
  return classes.map((item) => ({
    id: item.id,
    name: item.name,
    studentCount: 0,
  }))
}

export function mapClassPunctuality(
  dto: ClassPunctualityDto,
): {
  summary: {
    avgRate: number
    totalStudents: number
    excellent: number
    atRisk: number
  }
  rows: StudentPunctualityRow[]
} {
  return {
    summary: {
      avgRate: Math.round(Number(dto.summary.avgRate)),
      totalStudents: dto.summary.totalStudents,
      excellent: dto.summary.excellent,
      atRisk: dto.summary.atRisk,
    },
    rows: dto.students.map((row) => ({
      studentId: row.studentId,
      name: row.fullName,
      code: row.studentCode,
      classId: dto.classId,
      className: dto.className,
      monthId: dto.month,
      totalSessions: row.totalSessions,
      present: row.present,
      late: row.late,
      absent: row.absent,
      excused: row.excused,
      rate: Math.round(Number(row.rate)),
    })),
  }
}

/** Build recent months for punctuality filter (current + 5 previous). */
export function buildPunctualityMonths(reference = new Date()): PunctualityMonth[] {
  const items: PunctualityMonth[] = []
  for (let i = 0; i < 6; i++) {
    const d = new Date(reference.getFullYear(), reference.getMonth() - i, 1)
    const id = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    items.push({
      id,
      label: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`,
    })
  }
  return items
}

export function formatLessonDisplayDate(isoOrDisplay: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDisplay)) {
    return formatDisplayDateFull(isoOrDisplay)
  }
  return isoOrDisplay
}

export function buildAttendanceLessonParams(input: {
  schoolId: string
  academicYear: string
  from: string
  to: string
  classId: string
  kindFilter: string
}) {
  const params: {
    schoolId: string
    academicYear: string
    from: string
    to: string
    classId?: string
    subjectId?: string
    lessonKind?: string
  } = {
    schoolId: input.schoolId,
    academicYear: input.academicYear,
    from: input.from,
    to: input.to,
  }

  if (input.classId !== 'all') params.classId = input.classId

  if (input.kindFilter === 'homeroom') {
    params.lessonKind = 'Homeroom'
  } else if (input.kindFilter !== 'all') {
    params.subjectId = input.kindFilter
  }

  return params
}

export type { DayOfWeek }
