import type { ClassListItem } from '@/features/classes/api/classes-api'
import type {
  AcademicWeekDto,
  LessonDto,
  LessonMetaDto,
  PeriodDefinitionDto,
} from '../api/schedule-api'
import {
  DEFAULT_PERIODS,
  formatDisplayDateFull,
  type AcademicWeek,
  type AttendanceLessonStatus,
  type DayOfWeek,
  type LessonScheduleStatus,
  type PeriodDefinition,
  type ScheduleClassOption,
  type ScheduleLesson,
  type ScheduleSubjectOption,
  type SessionType,
  type TeacherScheduleProfile,
} from '../data/schema'

export const ACADEMIC_YEARS = ['2025-2026', '2026-2027'] as const

export function formatAcademicYearLabel(year: string): string {
  return year.replace('-', ' - ')
}

function toFeSession(value: string): SessionType {
  return value.toLowerCase() as SessionType
}

export function toApiSession(value: SessionType): string {
  return value === 'morning' ? 'Morning' : 'Afternoon'
}

function toFeLessonKind(value: string): 'SUBJECT' | 'HOMEROOM' {
  return value.toUpperCase() as 'SUBJECT' | 'HOMEROOM'
}

export function toApiLessonKind(value: 'SUBJECT' | 'HOMEROOM'): string {
  return value === 'HOMEROOM' ? 'Homeroom' : 'Subject'
}

function toFeScheduleStatus(value: string): LessonScheduleStatus {
  return value.toUpperCase() as LessonScheduleStatus
}

export function toApiScheduleStatus(
  value: LessonScheduleStatus,
): string {
  const map: Record<LessonScheduleStatus, string> = {
    SCHEDULED: 'Scheduled',
    CHANGED: 'Changed',
    CANCELLED: 'Cancelled',
    MAKEUP: 'Makeup',
  }
  return map[value]
}

function toFeAttendanceStatus(value: string): AttendanceLessonStatus {
  return value.toUpperCase() as AttendanceLessonStatus
}

export function mapAcademicWeek(dto: AcademicWeekDto): AcademicWeek {
  return {
    id: dto.id,
    number: dto.weekNumber,
    label: dto.label,
    startDate: formatDisplayDateFull(dto.startDate),
    endDate: formatDisplayDateFull(dto.endDate),
    dates: [...dto.dates],
  }
}

export function mapPeriodDefinition(
  dto: PeriodDefinitionDto,
): PeriodDefinition {
  return {
    id: dto.id,
    session: toFeSession(dto.session),
    period: dto.periodNumber,
    label: dto.label,
    startTime: dto.startTime,
    endTime: dto.endTime,
  }
}

export function mapPeriodToApiItem(
  period: PeriodDefinition,
): {
  session: string
  periodNumber: number
  label: string
  startTime: string
  endTime: string
} {
  return {
    session: toApiSession(period.session),
    periodNumber: period.period,
    label: period.label,
    startTime: period.startTime,
    endTime: period.endTime,
  }
}

export function mapLesson(dto: LessonDto): ScheduleLesson {
  return {
    id: dto.id,
    weekId: dto.weekId,
    academicYear: dto.academicYear,
    date: dto.date,
    dayOfWeek: dto.dayOfWeek as DayOfWeek,
    dayLabel: dto.dayLabel,
    session: toFeSession(dto.session),
    period: dto.periodNumber,
    startTime: dto.startTime,
    endTime: dto.endTime,
    subject: dto.subjectName,
    subjectId: dto.subjectId,
    className: dto.className,
    classId: dto.classId,
    room: dto.room?.trim() || '',
    lessonKind: toFeLessonKind(dto.lessonKind),
    scheduleStatus: toFeScheduleStatus(dto.scheduleStatus),
    originalRoom: dto.originalRoom ?? undefined,
    originalDate: dto.originalDate ?? undefined,
    originalDayLabel: dto.originalDate
      ? undefined
      : undefined,
    cancelReason: dto.cancelReason ?? undefined,
    makeupForDate: dto.makeupForDate ?? undefined,
    makeupForLessonId: dto.makeupForLessonId ?? undefined,
    attendanceStatus: toFeAttendanceStatus(dto.attendanceStatus),
    presentCount: dto.presentCount,
    absentCount: dto.absentCount,
    lateCount: dto.lateCount,
    totalStudents: dto.totalStudents,
  }
}

export function findWeekByDate(
  weeks: AcademicWeek[],
  iso: string,
): AcademicWeek | undefined {
  return weeks.find((week) => week.dates.includes(iso))
}

export function buildTeacherProfile(
  meta: LessonMetaDto,
  classes: ClassListItem[],
  email?: string | null,
): TeacherScheduleProfile {
  const homeroomClass = classes.find((item) => item.isHomeroom)
  const primarySubject =
    meta.subjects.find((item) => item.id !== 'homeroom') ?? meta.subjects[0]

  return {
    email: email ?? '',
    subjectId: primarySubject?.id ?? '',
    subjectName: primarySubject?.name ?? 'Môn học',
    taughtClassIds: meta.classes.map((item) => item.id),
    homeroomClassId: homeroomClass?.id,
    homeroomClassName: homeroomClass?.name,
  }
}

export function buildClassOptions(
  meta: LessonMetaDto,
): ScheduleClassOption[] {
  return meta.classes.map((item) => ({
    id: item.id,
    name: item.name,
  }))
}

export function buildSubjectFilterOptions(
  meta: LessonMetaDto,
): ScheduleSubjectOption[] {
  return meta.subjects.map((item) => ({
    id: item.id,
    name: item.name,
  }))
}

export function resolvePeriods(
  dtos: PeriodDefinitionDto[] | undefined,
): PeriodDefinition[] {
  if (!dtos?.length) return DEFAULT_PERIODS.map((item) => ({ ...item }))
  return dtos.map(mapPeriodDefinition)
}

export function buildLessonListParams(input: {
  schoolId: string
  week: AcademicWeek
  academicYear: string
  classId: string
  kindFilter: string
  statusFilter: 'all' | 'pending'
}) {
  const params: {
    schoolId: string
    academicYear: string
    weekId?: string
    from?: string
    to?: string
    classId?: string
    subjectId?: string
    lessonKind?: string
    attendanceStatus?: string
  } = {
    schoolId: input.schoolId,
    academicYear: input.academicYear,
  }

  if (input.week.id.startsWith('cal-')) {
    params.from = input.week.dates[0]
    params.to = input.week.dates[4]
  } else {
    params.weekId = input.week.id
  }

  if (input.classId !== 'all') params.classId = input.classId

  if (input.kindFilter === 'homeroom') {
    params.lessonKind = 'Homeroom'
  } else if (input.kindFilter !== 'all') {
    params.subjectId = input.kindFilter
  }

  if (input.statusFilter === 'pending') {
    params.attendanceStatus = 'Pending'
  }

  return params
}
