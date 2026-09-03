export type AttendanceStatus =
  | 'UNMARKED'
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'EXCUSED'

export type AttendanceHubTab = 'lessons' | 'punctuality'

export type AttendanceLessonKind = 'SUBJECT' | 'HOMEROOM'

export type AttendanceStudent = {
  id: string
  name: string
  code: string
  status: AttendanceStatus
  reason?: string
  note?: string
}

export type Lesson = {
  id: string
  weekId: string
  date: string
  dayLabel: string
  period: number
  startTime: string
  endTime: string
  subject: string
  subjectId: string
  className: string
  classId: string
  room: string
  lessonKind: AttendanceLessonKind
  status: 'PENDING' | 'COMPLETED' | 'PARTIAL'
  presentCount?: number
  totalStudents: number
}

export type AcademicWeek = {
  id: string
  number: number
  label: string
  startDate: string
  endDate: string
  /** ISO dates Mon–Fri (when from real-time calendar) */
  dates?: string[]
}

export type AttendanceClassOption = {
  id: string
  name: string
  studentCount: number
}

/** Tháng báo cáo chuyên cần (YYYY-MM) */
export type PunctualityMonth = {
  id: string
  label: string
}

export type StudentPunctualityRow = {
  studentId: string
  name: string
  code: string
  classId: string
  className: string
  monthId: string
  totalSessions: number
  present: number
  late: number
  absent: number
  excused: number
  /** % chuyên cần = (present + late) / totalSessions */
  rate: number
}

export function computePunctualityRate(
  present: number,
  late: number,
  totalSessions: number,
): number {
  if (totalSessions <= 0) return 0
  return Math.round(((present + late) / totalSessions) * 100)
}

export function punctualityTone(rate: number): 'good' | 'warn' | 'bad' {
  if (rate >= 90) return 'good'
  if (rate >= 80) return 'warn'
  return 'bad'
}
