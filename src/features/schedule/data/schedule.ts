import type {
  AcademicWeek,
  ScheduleClassOption,
  ScheduleLesson,
  ScheduleSubjectOption,
  TeacherScheduleProfile,
} from './schema'
import { useTeacherStore } from '@/features/teachers/stores/teacher-store'

export const academicYears = ['2026 - 2027', '2025 - 2026'] as const

export const scheduleClasses: ScheduleClassOption[] = [
  { id: 'c-10a1', name: '10A1' },
  { id: 'c-10a2', name: '10A2' },
  { id: 'c-11a1', name: '11A1' },
]

/**
 * Giáo viên bộ môn Toán, GVCN 10A1 — cùng ngữ cảnh với module Điểm.
 * Lịch chỉ gồm: tiết Toán các lớp đang dạy + sinh hoạt lớp 10A1.
 * (Fallback khi chưa có bản ghi trong teacher store)
 */
export const DEFAULT_TEACHER_PROFILE: TeacherScheduleProfile = {
  email: 'teacher@demo.com',
  subjectId: 'math',
  subjectName: 'Toán',
  taughtClassIds: ['c-10a1', 'c-10a2', 'c-11a1'],
  homeroomClassId: 'c-10a1',
  homeroomClassName: '10A1',
}

export const TEACHER_PROFILES: TeacherScheduleProfile[] = [
  DEFAULT_TEACHER_PROFILE,
  {
    email: 'teacher2@demo.com',
    subjectId: 'math',
    subjectName: 'Toán',
    taughtClassIds: ['c-10a2', 'c-11a1'],
  },
]

export function getTeacherScheduleProfile(
  email?: string | null,
): TeacherScheduleProfile {
  if (!email) return DEFAULT_TEACHER_PROFILE

  const managed = useTeacherStore
    .getState()
    .teachers.find((item) => item.email.toLowerCase() === email.toLowerCase())

  if (managed) {
    const homeroomName = managed.homeroomClassId
      ? scheduleClasses.find((c) => c.id === managed.homeroomClassId)?.name
      : undefined
    return {
      email: managed.email,
      subjectId: managed.subjectId,
      subjectName: managed.subjectName,
      taughtClassIds: [...managed.taughtClassIds],
      homeroomClassId: managed.homeroomClassId,
      homeroomClassName: homeroomName,
    }
  }

  return (
    TEACHER_PROFILES.find(
      (item) => item.email.toLowerCase() === email.toLowerCase(),
    ) ?? DEFAULT_TEACHER_PROFILE
  )
}

export function getTeacherClasses(
  profile: TeacherScheduleProfile,
): ScheduleClassOption[] {
  const ids = new Set([
    ...profile.taughtClassIds,
    ...(profile.homeroomClassId ? [profile.homeroomClassId] : []),
  ])
  return scheduleClasses.filter((item) => ids.has(item.id))
}

export function getTeacherSubjectFilters(
  profile: TeacherScheduleProfile,
): ScheduleSubjectOption[] {
  const items: ScheduleSubjectOption[] = [
    { id: profile.subjectId, name: profile.subjectName },
  ]
  if (profile.homeroomClassId) {
    items.push({ id: 'homeroom', name: 'Sinh hoạt lớp' })
  }
  return items
}

/** Shared AcademicWeek concept with attendance module */
export const academicWeeks: AcademicWeek[] = [
  {
    id: 'week-03',
    number: 3,
    label: 'Tuần 3',
    startDate: '17/08/2026',
    endDate: '23/08/2026',
    dates: [
      '2026-08-17',
      '2026-08-18',
      '2026-08-19',
      '2026-08-20',
      '2026-08-21',
    ],
  },
  {
    id: 'week-04',
    number: 4,
    label: 'Tuần 4',
    startDate: '24/08/2026',
    endDate: '30/08/2026',
    dates: [
      '2026-08-24',
      '2026-08-25',
      '2026-08-26',
      '2026-08-27',
      '2026-08-28',
    ],
  },
  {
    id: 'week-05',
    number: 5,
    label: 'Tuần 5',
    startDate: '31/08/2026',
    endDate: '06/09/2026',
    dates: [
      '2026-08-31',
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
    ],
  },
]

function lesson(
  partial: Omit<ScheduleLesson, 'academicYear' | 'scheduleStatus' | 'lessonKind'> & {
    academicYear?: string
    scheduleStatus?: ScheduleLesson['scheduleStatus']
    lessonKind?: ScheduleLesson['lessonKind']
  },
): ScheduleLesson {
  return {
    academicYear: '2026 - 2027',
    scheduleStatus: 'SCHEDULED',
    lessonKind: 'SUBJECT',
    ...partial,
  }
}

/**
 * Lịch của GV Toán (có thể + GVCN 10A1).
 * Chỉ tiết môn Toán + sinh hoạt lớp chủ nhiệm — không lẫn môn khác.
 */
export const scheduleLessons: ScheduleLesson[] = [
  // —— Week 3 · Toán ——
  lesson({
    id: 'w3-mon-m1',
    weekId: 'week-03',
    date: '2026-08-17',
    dayOfWeek: 1,
    dayLabel: 'Thứ Hai',
    session: 'morning',
    period: 1,
    startTime: '07:00',
    endTime: '07:45',
    subject: 'Toán',
    subjectId: 'math',
    className: '10A1',
    classId: 'c-10a1',
    room: 'A203',
    attendanceStatus: 'COMPLETED',
    presentCount: 39,
    absentCount: 2,
    lateCount: 1,
    totalStudents: 42,
  }),
  lesson({
    id: 'w3-mon-m3',
    weekId: 'week-03',
    date: '2026-08-17',
    dayOfWeek: 1,
    dayLabel: 'Thứ Hai',
    session: 'morning',
    period: 3,
    startTime: '08:40',
    endTime: '09:25',
    subject: 'Toán',
    subjectId: 'math',
    className: '10A2',
    classId: 'c-10a2',
    room: 'A203',
    attendanceStatus: 'COMPLETED',
    presentCount: 38,
    absentCount: 2,
    lateCount: 0,
    totalStudents: 40,
  }),
  lesson({
    id: 'w3-tue-homeroom',
    weekId: 'week-03',
    date: '2026-08-18',
    dayOfWeek: 2,
    dayLabel: 'Thứ Ba',
    session: 'morning',
    period: 5,
    startTime: '10:30',
    endTime: '11:15',
    subject: 'Sinh hoạt lớp',
    subjectId: 'homeroom',
    className: '10A1',
    classId: 'c-10a1',
    room: 'A203',
    lessonKind: 'HOMEROOM',
    attendanceStatus: 'COMPLETED',
    presentCount: 41,
    absentCount: 1,
    lateCount: 0,
    totalStudents: 42,
  }),
  lesson({
    id: 'w3-wed-m1',
    weekId: 'week-03',
    date: '2026-08-19',
    dayOfWeek: 3,
    dayLabel: 'Thứ Tư',
    session: 'morning',
    period: 1,
    startTime: '07:00',
    endTime: '07:45',
    subject: 'Toán',
    subjectId: 'math',
    className: '10A1',
    classId: 'c-10a1',
    room: 'A203',
    attendanceStatus: 'COMPLETED',
    presentCount: 40,
    absentCount: 2,
    lateCount: 0,
    totalStudents: 42,
  }),
  lesson({
    id: 'w3-thu-m1',
    weekId: 'week-03',
    date: '2026-08-20',
    dayOfWeek: 4,
    dayLabel: 'Thứ Năm',
    session: 'morning',
    period: 1,
    startTime: '07:00',
    endTime: '07:45',
    subject: 'Toán',
    subjectId: 'math',
    className: '10A1',
    classId: 'c-10a1',
    room: 'A203',
    attendanceStatus: 'PARTIAL',
    presentCount: 38,
    absentCount: 3,
    lateCount: 1,
    totalStudents: 42,
  }),
  lesson({
    id: 'w3-thu-m4',
    weekId: 'week-03',
    date: '2026-08-20',
    dayOfWeek: 4,
    dayLabel: 'Thứ Năm',
    session: 'morning',
    period: 4,
    startTime: '09:40',
    endTime: '10:25',
    subject: 'Toán',
    subjectId: 'math',
    className: '10A2',
    classId: 'c-10a2',
    room: 'A203',
    attendanceStatus: 'PENDING',
    totalStudents: 40,
  }),
  lesson({
    id: 'w3-fri-m2',
    weekId: 'week-03',
    date: '2026-08-21',
    dayOfWeek: 5,
    dayLabel: 'Thứ Sáu',
    session: 'morning',
    period: 2,
    startTime: '07:50',
    endTime: '08:35',
    subject: 'Toán',
    subjectId: 'math',
    className: '11A1',
    classId: 'c-11a1',
    room: 'B102',
    attendanceStatus: 'COMPLETED',
    presentCount: 37,
    absentCount: 1,
    lateCount: 0,
    totalStudents: 38,
  }),

  // —— Week 4 · Toán + SHL ——
  lesson({
    id: 'w4-mon-m1',
    weekId: 'week-04',
    date: '2026-08-24',
    dayOfWeek: 1,
    dayLabel: 'Thứ Hai',
    session: 'morning',
    period: 1,
    startTime: '07:00',
    endTime: '07:45',
    subject: 'Toán',
    subjectId: 'math',
    className: '10A1',
    classId: 'c-10a1',
    room: 'A203',
    attendanceStatus: 'COMPLETED',
    presentCount: 40,
    absentCount: 1,
    lateCount: 1,
    totalStudents: 42,
  }),
  lesson({
    id: 'w4-mon-m3',
    weekId: 'week-04',
    date: '2026-08-24',
    dayOfWeek: 1,
    dayLabel: 'Thứ Hai',
    session: 'morning',
    period: 3,
    startTime: '08:40',
    endTime: '09:25',
    subject: 'Toán',
    subjectId: 'math',
    className: '11A1',
    classId: 'c-11a1',
    room: 'B102',
    attendanceStatus: 'COMPLETED',
    presentCount: 37,
    absentCount: 1,
    lateCount: 0,
    totalStudents: 38,
  }),
  lesson({
    id: 'w4-tue-m1',
    weekId: 'week-04',
    date: '2026-08-25',
    dayOfWeek: 2,
    dayLabel: 'Thứ Ba',
    session: 'morning',
    period: 1,
    startTime: '07:00',
    endTime: '07:45',
    subject: 'Toán',
    subjectId: 'math',
    className: '10A1',
    classId: 'c-10a1',
    room: 'A203',
    attendanceStatus: 'PENDING',
    totalStudents: 42,
  }),
  // Tiết 2 trống cố ý
  lesson({
    id: 'w4-tue-m3',
    weekId: 'week-04',
    date: '2026-08-25',
    dayOfWeek: 2,
    dayLabel: 'Thứ Ba',
    session: 'morning',
    period: 3,
    startTime: '08:40',
    endTime: '09:25',
    subject: 'Toán',
    subjectId: 'math',
    className: '10A2',
    classId: 'c-10a2',
    room: 'A203',
    attendanceStatus: 'PENDING',
    totalStudents: 40,
  }),
  lesson({
    id: 'w4-tue-homeroom',
    weekId: 'week-04',
    date: '2026-08-25',
    dayOfWeek: 2,
    dayLabel: 'Thứ Ba',
    session: 'morning',
    period: 5,
    startTime: '10:30',
    endTime: '11:15',
    subject: 'Sinh hoạt lớp',
    subjectId: 'homeroom',
    className: '10A1',
    classId: 'c-10a1',
    room: 'A203',
    lessonKind: 'HOMEROOM',
    attendanceStatus: 'PENDING',
    totalStudents: 42,
  }),
  lesson({
    id: 'w4-wed-m1',
    weekId: 'week-04',
    date: '2026-08-26',
    dayOfWeek: 3,
    dayLabel: 'Thứ Tư',
    session: 'morning',
    period: 1,
    startTime: '07:00',
    endTime: '07:45',
    subject: 'Toán',
    subjectId: 'math',
    className: '10A1',
    classId: 'c-10a1',
    room: 'B102',
    originalRoom: 'A203',
    scheduleStatus: 'CHANGED',
    attendanceStatus: 'PENDING',
    totalStudents: 42,
  }),
  lesson({
    id: 'w4-wed-m2',
    weekId: 'week-04',
    date: '2026-08-26',
    dayOfWeek: 3,
    dayLabel: 'Thứ Tư',
    session: 'morning',
    period: 2,
    startTime: '07:50',
    endTime: '08:35',
    subject: 'Toán',
    subjectId: 'math',
    className: '10A1',
    classId: 'c-10a1',
    room: 'A203',
    scheduleStatus: 'CANCELLED',
    cancelReason: 'Nghỉ lễ / hoạt động toàn trường',
    attendanceStatus: 'PENDING',
    totalStudents: 42,
  }),
  lesson({
    id: 'w4-thu-m1',
    weekId: 'week-04',
    date: '2026-08-27',
    dayOfWeek: 4,
    dayLabel: 'Thứ Năm',
    session: 'morning',
    period: 1,
    startTime: '07:00',
    endTime: '07:45',
    subject: 'Toán',
    subjectId: 'math',
    className: '10A1',
    classId: 'c-10a1',
    room: 'A203',
    attendanceStatus: 'PENDING',
    totalStudents: 42,
  }),
  lesson({
    id: 'w4-thu-a2',
    weekId: 'week-04',
    date: '2026-08-27',
    dayOfWeek: 4,
    dayLabel: 'Thứ Năm',
    session: 'afternoon',
    period: 2,
    startTime: '13:50',
    endTime: '14:35',
    subject: 'Toán',
    subjectId: 'math',
    className: '10A2',
    classId: 'c-10a2',
    room: 'A204',
    attendanceStatus: 'PENDING',
    totalStudents: 40,
  }),
  lesson({
    id: 'w4-fri-m2',
    weekId: 'week-04',
    date: '2026-08-28',
    dayOfWeek: 5,
    dayLabel: 'Thứ Sáu',
    session: 'morning',
    period: 2,
    startTime: '07:50',
    endTime: '08:35',
    subject: 'Toán',
    subjectId: 'math',
    className: '10A2',
    classId: 'c-10a2',
    room: 'A204',
    attendanceStatus: 'PENDING',
    totalStudents: 40,
  }),
  lesson({
    id: 'w4-fri-m5',
    weekId: 'week-04',
    date: '2026-08-28',
    dayOfWeek: 5,
    dayLabel: 'Thứ Sáu',
    session: 'morning',
    period: 5,
    startTime: '10:30',
    endTime: '11:15',
    subject: 'Toán',
    subjectId: 'math',
    className: '10A1',
    classId: 'c-10a1',
    room: 'A203',
    scheduleStatus: 'MAKEUP',
    makeupForDate: '2026-08-20',
    makeupForLessonId: 'w3-thu-m1',
    originalDayLabel: 'Thứ Năm',
    attendanceStatus: 'PENDING',
    totalStudents: 42,
  }),
]

export function findWeekByDate(iso: string): AcademicWeek | undefined {
  return academicWeeks.find((week) => week.dates.includes(iso))
}

export function getLessonsForWeek(
  allLessons: ScheduleLesson[],
  weekId: string,
  academicYear: string,
  profile: TeacherScheduleProfile,
  filters?: {
    classId?: string
    /** 'all' | subjectId | 'homeroom' */
    kindFilter?: string
    pendingOnly?: boolean
  },
): ScheduleLesson[] {
  const taught = new Set(profile.taughtClassIds)
  const homeroomId = profile.homeroomClassId

  return allLessons.filter((item) => {
    if (item.weekId !== weekId) return false
    if (item.academicYear !== academicYear) return false

    const isHomeroom = item.lessonKind === 'HOMEROOM'
    const isTaughtSubject =
      !isHomeroom &&
      item.subjectId === profile.subjectId &&
      taught.has(item.classId)
    const isHomeroomLesson =
      isHomeroom && Boolean(homeroomId) && item.classId === homeroomId

    if (!isTaughtSubject && !isHomeroomLesson) return false

    if (filters?.classId && filters.classId !== 'all' && item.classId !== filters.classId)
      return false

    if (filters?.kindFilter && filters.kindFilter !== 'all') {
      if (filters.kindFilter === 'homeroom') {
        if (!isHomeroom) return false
      } else if (item.subjectId !== filters.kindFilter) {
        return false
      }
    }

    if (filters?.pendingOnly) {
      if (item.scheduleStatus === 'CANCELLED') return false
      if (item.attendanceStatus === 'COMPLETED') return false
    }
    return true
  })
}

export const CLASS_STUDENT_COUNTS: Record<string, number> = {
  'c-10a1': 42,
  'c-10a2': 40,
  'c-11a1': 38,
}
