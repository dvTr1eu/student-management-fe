export type AttendanceLessonStatus = 'PENDING' | 'COMPLETED' | 'PARTIAL'

/** Trạng thái lịch (khác điểm danh) */
export type LessonScheduleStatus =
  | 'SCHEDULED'
  | 'CHANGED'
  | 'CANCELLED'
  | 'MAKEUP'

export type ScheduleViewMode = 'week' | 'day'

export type DayOfWeek = 1 | 2 | 3 | 4 | 5 // Mon–Fri

export type SessionType = 'morning' | 'afternoon'

export type AcademicWeek = {
  id: string
  number: number
  label: string
  startDate: string
  endDate: string
  /** ISO dates Mon–Fri for the week */
  dates: string[]
}

export type PeriodDefinition = {
  id: string
  session: SessionType
  period: number
  label: string
  startTime: string
  endTime: string
}

export type ScheduleLesson = {
  id: string
  weekId: string
  academicYear: string
  /** ISO date YYYY-MM-DD */
  date: string
  dayOfWeek: DayOfWeek
  dayLabel: string
  session: SessionType
  period: number
  startTime: string
  endTime: string
  subject: string
  subjectId: string
  className: string
  classId: string
  room: string
  attendanceStatus: AttendanceLessonStatus
  presentCount?: number
  absentCount?: number
  lateCount?: number
  totalStudents: number
  /**
   * SUBJECT = tiết môn bộ môn giáo viên dạy
   * HOMEROOM = sinh hoạt lớp (chỉ khi là GVCN)
   */
  lessonKind?: 'SUBJECT' | 'HOMEROOM'
  /** Mặc định SCHEDULED */
  scheduleStatus?: LessonScheduleStatus
  /** Phòng trước khi đổi */
  originalRoom?: string
  /** Ngày / thứ trước khi dời lịch */
  originalDate?: string
  originalDayLabel?: string
  cancelReason?: string
  /** ISO date của tiết gốc khi đây là dạy bù */
  makeupForDate?: string
  makeupForLessonId?: string
}

export type TeacherScheduleProfile = {
  email: string
  /** Môn bộ môn chính */
  subjectId: string
  subjectName: string
  /** Lớp đang giảng dạy môn trên */
  taughtClassIds: string[]
  /** Lớp chủ nhiệm (nếu có) → hiện sinh hoạt lớp */
  homeroomClassId?: string
  homeroomClassName?: string
}

export type ScheduleClassOption = {
  id: string
  name: string
}

export type ScheduleSubjectOption = {
  id: string
  name: string
}

export const WEEKDAY_LABELS: Record<DayOfWeek, string> = {
  1: 'T2',
  2: 'T3',
  3: 'T4',
  4: 'T5',
  5: 'T6',
}

export const WEEKDAY_FULL: Record<DayOfWeek, string> = {
  1: 'Thứ Hai',
  2: 'Thứ Ba',
  3: 'Thứ Tư',
  4: 'Thứ Năm',
  5: 'Thứ Sáu',
}

/** Default timetable — clone per school for CRUD */
export const DEFAULT_PERIODS: PeriodDefinition[] = [
  { id: 'm1', session: 'morning', period: 1, label: 'Tiết 1', startTime: '07:00', endTime: '07:45' },
  { id: 'm2', session: 'morning', period: 2, label: 'Tiết 2', startTime: '07:50', endTime: '08:35' },
  { id: 'm3', session: 'morning', period: 3, label: 'Tiết 3', startTime: '08:40', endTime: '09:25' },
  { id: 'm4', session: 'morning', period: 4, label: 'Tiết 4', startTime: '09:40', endTime: '10:25' },
  { id: 'm5', session: 'morning', period: 5, label: 'Tiết 5', startTime: '10:30', endTime: '11:15' },
  { id: 'a1', session: 'afternoon', period: 1, label: 'Tiết 1', startTime: '13:00', endTime: '13:45' },
  { id: 'a2', session: 'afternoon', period: 2, label: 'Tiết 2', startTime: '13:50', endTime: '14:35' },
  { id: 'a3', session: 'afternoon', period: 3, label: 'Tiết 3', startTime: '14:40', endTime: '15:25' },
  { id: 'a4', session: 'afternoon', period: 4, label: 'Tiết 4', startTime: '15:40', endTime: '16:25' },
  { id: 'a5', session: 'afternoon', period: 5, label: 'Tiết 5', startTime: '16:30', endTime: '17:15' },
]

/** @deprecated use DEFAULT_PERIODS / school period store */
export const PERIODS = DEFAULT_PERIODS

export function getPeriodDef(
  periods: PeriodDefinition[],
  session: SessionType,
  period: number,
): PeriodDefinition | undefined {
  return periods.find((p) => p.session === session && p.period === period)
}

export function getLessonScheduleStatus(
  lesson: ScheduleLesson,
): LessonScheduleStatus {
  return lesson.scheduleStatus ?? 'SCHEDULED'
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

export function formatDisplayDate(iso: string): string {
  const date = parseIsoDate(iso)
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}`
}

export function formatDisplayDateFull(iso: string): string {
  const date = parseIsoDate(iso)
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getDayOfWeek(iso: string): DayOfWeek | null {
  const day = parseIsoDate(iso).getDay()
  if (day < 1 || day > 5) return null
  return day as DayOfWeek
}

export function isTimeBetween(
  now: Date,
  startTime: string,
  endTime: string,
): boolean {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const mins = now.getHours() * 60 + now.getMinutes()
  const start = sh! * 60 + sm!
  const end = eh! * 60 + em!
  return mins >= start && mins < end
}

export function isLessonPast(lesson: ScheduleLesson, now: Date): boolean {
  if (getLessonScheduleStatus(lesson) === 'CANCELLED') return true
  if (lesson.date < toIsoDate(now)) return true
  if (lesson.date > toIsoDate(now)) return false
  const [eh, em] = lesson.endTime.split(':').map(Number)
  const end = eh! * 60 + em!
  const mins = now.getHours() * 60 + now.getMinutes()
  return mins >= end
}

export function isLessonCurrent(lesson: ScheduleLesson, now: Date): boolean {
  if (getLessonScheduleStatus(lesson) === 'CANCELLED') return false
  return (
    lesson.date === toIsoDate(now) &&
    isTimeBetween(now, lesson.startTime, lesson.endTime)
  )
}
