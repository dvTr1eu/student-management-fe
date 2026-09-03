import type { TeacherScheduleProfile } from '@/features/schedule/data/schema'
import {
  getTeacherClasses as getScheduleTeacherClasses,
  getTeacherSubjectFilters,
  scheduleClasses,
} from '@/features/schedule/data/schedule'
import {
  computePunctualityRate,
  type AcademicWeek,
  type AttendanceClassOption,
  type AttendanceStudent,
  type Lesson,
  type PunctualityMonth,
  type StudentPunctualityRow,
} from './schema'

export const academicYears = ['2026 - 2027', '2025 - 2026']

/** @deprecated dùng getAttendanceClasses(profile) */
export const attendanceClasses: AttendanceClassOption[] = scheduleClasses.map(
  (item) => ({
    id: item.id,
    name: item.name,
    studentCount:
      item.id === 'c-10a1' ? 42 : item.id === 'c-10a2' ? 40 : 38,
  }),
)

export function getAttendanceClasses(
  profile: TeacherScheduleProfile,
): AttendanceClassOption[] {
  return getScheduleTeacherClasses(profile).map((item) => {
    const meta = attendanceClasses.find((c) => c.id === item.id)
    return {
      id: item.id,
      name: item.name,
      studentCount: meta?.studentCount ?? 40,
    }
  })
}

export function resolveAttendanceClassId(
  classes: AttendanceClassOption[],
  classIdOrName?: string,
): string {
  if (!classIdOrName) return classes[0]?.id ?? 'c-10a1'
  const matched = classes.find(
    (item) => item.id === classIdOrName || item.name === classIdOrName,
  )
  return matched?.id ?? classes[0]?.id ?? 'c-10a1'
}

export { getTeacherSubjectFilters }

export const weeks: AcademicWeek[] = [
  {
    id: 'week-03',
    number: 3,
    label: 'TUẦN 3',
    startDate: '17/08/2026',
    endDate: '23/08/2026',
  },
  {
    id: 'week-04',
    number: 4,
    label: 'TUẦN 4',
    startDate: '24/08/2026',
    endDate: '30/08/2026',
  },
]

/** Chỉ tiết môn GV dạy + sinh hoạt lớp (GVCN) */
export const lessons: Lesson[] = [
  {
    id: 'att-1',
    weekId: 'week-03',
    date: '17/08/2026',
    dayLabel: 'Thứ 2',
    period: 1,
    startTime: '07:00',
    endTime: '07:45',
    subject: 'Toán',
    subjectId: 'math',
    className: '10A1',
    classId: 'c-10a1',
    room: 'A203',
    lessonKind: 'SUBJECT',
    status: 'COMPLETED',
    presentCount: 39,
    totalStudents: 42,
  },
  {
    id: 'att-2',
    weekId: 'week-03',
    date: '17/08/2026',
    dayLabel: 'Thứ 2',
    period: 3,
    startTime: '08:40',
    endTime: '09:25',
    subject: 'Toán',
    subjectId: 'math',
    className: '10A2',
    classId: 'c-10a2',
    room: 'A205',
    lessonKind: 'SUBJECT',
    status: 'PENDING',
    totalStudents: 40,
  },
  {
    id: 'att-3',
    weekId: 'week-03',
    date: '18/08/2026',
    dayLabel: 'Thứ 3',
    period: 2,
    startTime: '07:50',
    endTime: '08:35',
    subject: 'Toán',
    subjectId: 'math',
    className: '10A1',
    classId: 'c-10a1',
    room: 'A203',
    lessonKind: 'SUBJECT',
    status: 'COMPLETED',
    presentCount: 41,
    totalStudents: 42,
  },
  {
    id: 'att-4',
    weekId: 'week-03',
    date: '19/08/2026',
    dayLabel: 'Thứ 4',
    period: 5,
    startTime: '10:30',
    endTime: '11:15',
    subject: 'Sinh hoạt lớp',
    subjectId: 'homeroom',
    className: '10A1',
    classId: 'c-10a1',
    room: 'A203',
    lessonKind: 'HOMEROOM',
    status: 'COMPLETED',
    presentCount: 40,
    totalStudents: 42,
  },
  {
    id: 'att-5',
    weekId: 'week-03',
    date: '20/08/2026',
    dayLabel: 'Thứ 5',
    period: 1,
    startTime: '07:00',
    endTime: '07:45',
    subject: 'Toán',
    subjectId: 'math',
    className: '11A1',
    classId: 'c-11a1',
    room: 'B101',
    lessonKind: 'SUBJECT',
    status: 'PARTIAL',
    presentCount: 35,
    totalStudents: 38,
  },
  {
    id: 'att-6',
    weekId: 'week-03',
    date: '20/08/2026',
    dayLabel: 'Thứ 5',
    period: 4,
    startTime: '09:40',
    endTime: '10:25',
    subject: 'Toán',
    subjectId: 'math',
    className: '10A1',
    classId: 'c-10a1',
    room: 'A203',
    lessonKind: 'SUBJECT',
    status: 'PENDING',
    totalStudents: 42,
  },
  {
    id: 'att-7',
    weekId: 'week-03',
    date: '21/08/2026',
    dayLabel: 'Thứ 6',
    period: 2,
    startTime: '07:50',
    endTime: '08:35',
    subject: 'Toán',
    subjectId: 'math',
    className: '10A2',
    classId: 'c-10a2',
    room: 'A205',
    lessonKind: 'SUBJECT',
    status: 'COMPLETED',
    presentCount: 40,
    totalStudents: 40,
  },
  {
    id: 'att-8',
    weekId: 'week-04',
    date: '24/08/2026',
    dayLabel: 'Thứ 2',
    period: 1,
    startTime: '07:00',
    endTime: '07:45',
    subject: 'Toán',
    subjectId: 'math',
    className: '10A1',
    classId: 'c-10a1',
    room: 'A203',
    lessonKind: 'SUBJECT',
    status: 'PENDING',
    totalStudents: 42,
  },
  {
    id: 'att-9',
    weekId: 'week-04',
    date: '26/08/2026',
    dayLabel: 'Thứ 4',
    period: 5,
    startTime: '10:30',
    endTime: '11:15',
    subject: 'Sinh hoạt lớp',
    subjectId: 'homeroom',
    className: '10A1',
    classId: 'c-10a1',
    room: 'A203',
    lessonKind: 'HOMEROOM',
    status: 'PENDING',
    totalStudents: 42,
  },
]

export function getLessonsForTeacher(
  profile: TeacherScheduleProfile,
  filters?: {
    weekId?: string
    /** ISO dates Mon–Fri for real-time calendar week */
    weekDates?: string[]
    classId?: string
    /** 'all' | subjectId | 'homeroom' */
    kindFilter?: string
  },
): Lesson[] {
  const taught = new Set(profile.taughtClassIds)
  const homeroomId = profile.homeroomClassId
  const weekDisplayDates = filters?.weekDates?.length
    ? new Set(
        filters.weekDates.map((iso) => {
          const [y, m, d] = iso.split('-')
          return `${d}/${m}/${y}`
        }),
      )
    : null

  return lessons.filter((item) => {
    if (weekDisplayDates) {
      if (!weekDisplayDates.has(item.date) && !filters!.weekDates!.includes(item.date)) {
        return false
      }
    } else if (filters?.weekId && item.weekId !== filters.weekId) {
      return false
    }

    const isHomeroom = item.lessonKind === 'HOMEROOM'
    const isTaughtSubject =
      !isHomeroom &&
      item.subjectId === profile.subjectId &&
      taught.has(item.classId)
    const isHomeroomLesson =
      isHomeroom && Boolean(homeroomId) && item.classId === homeroomId

    if (!isTaughtSubject && !isHomeroomLesson) return false

    if (
      filters?.classId &&
      filters.classId !== 'all' &&
      item.classId !== filters.classId
    ) {
      return false
    }

    if (filters?.kindFilter && filters.kindFilter !== 'all') {
      if (filters.kindFilter === 'homeroom') {
        if (!isHomeroom) return false
      } else if (item.subjectId !== filters.kindFilter) {
        return false
      }
    }

    return true
  })
}

const names = [
  'Nguyễn Văn An',
  'Trần Minh Anh',
  'Lê Hoàng Nam',
  'Phạm Minh Hương',
  'Đỗ Khánh Linh',
  'Võ Gia Bảo',
  'Bùi Đức Tùng',
  'Hoàng Thùy Vy',
  'Ngô Tuấn Nam',
  'Đặng Phương Thảo',
  'Lý Minh Khang',
  'Phan Ngọc Mai',
]

export const attendanceStudents: AttendanceStudent[] = names.map(
  (name, index) => ({
    id: `student-${index + 1}`,
    name,
    code: `10A1${String(index + 1).padStart(2, '0')}`,
    status: index === 2 ? 'ABSENT' : index === 3 ? 'LATE' : 'PRESENT',
    reason: index === 2 ? 'Không phép' : undefined,
  }),
)

export const punctualityMonths: PunctualityMonth[] = [
  { id: '2026-08', label: 'Tháng 8/2026' },
  { id: '2026-07', label: 'Tháng 7/2026' },
  { id: '2026-06', label: 'Tháng 6/2026' },
]

const TOTAL_SESSIONS = 20

function buildClassRows(
  classId: string,
  className: string,
  monthId: string,
  studentNames: string[],
  seed: number,
): StudentPunctualityRow[] {
  return studentNames.map((name, index) => {
    const offset = (seed + index * 3) % 5
    const absent = index === 2 ? 4 : index === 6 ? 3 : offset === 0 ? 2 : 0
    const late = index === 3 ? 3 : index % 4 === 1 ? 2 : index % 5 === 0 ? 1 : 0
    const excused = index === 4 ? 1 : 0
    const present = Math.max(0, TOTAL_SESSIONS - absent - late - excused)
    return {
      studentId: `${classId}-s${index + 1}`,
      name,
      code: `${className}${String(index + 1).padStart(2, '0')}`,
      classId,
      className,
      monthId,
      totalSessions: TOTAL_SESSIONS,
      present,
      late,
      absent,
      excused,
      rate: computePunctualityRate(present, late, TOTAL_SESSIONS),
    }
  })
}

const names10a2 = [
  'Nguyễn Hải Đăng',
  'Trần Quỳnh Anh',
  'Lê Minh Triết',
  'Phạm Gia Hân',
  'Đỗ Nhật Nam',
  'Võ Thanh Tú',
  'Bùi Lan Chi',
  'Hoàng Đức Anh',
]

const names11a1 = [
  'Nguyễn Quốc Bảo',
  'Trần Mỹ Duyên',
  'Lê Nhật Hào',
  'Phạm Khánh Chi',
  'Đỗ Gia Huy',
  'Võ Bảo Ngọc',
]

export const punctualityRows: StudentPunctualityRow[] = [
  ...buildClassRows('c-10a1', '10A1', '2026-08', names, 1),
  ...buildClassRows('c-10a1', '10A1', '2026-07', names, 2),
  ...buildClassRows('c-10a1', '10A1', '2026-06', names, 3),
  ...buildClassRows('c-10a2', '10A2', '2026-08', names10a2, 4),
  ...buildClassRows('c-10a2', '10A2', '2026-07', names10a2, 5),
  ...buildClassRows('c-11a1', '11A1', '2026-08', names11a1, 6),
  ...buildClassRows('c-11a1', '11A1', '2026-07', names11a1, 7),
]

export function getPunctualityRows(
  classId: string,
  monthId: string,
): StudentPunctualityRow[] {
  return punctualityRows
    .filter((row) => row.classId === classId && row.monthId === monthId)
    .sort((a, b) => a.rate - b.rate || a.name.localeCompare(b.name, 'vi'))
}

export function getPunctualitySummary(rows: StudentPunctualityRow[]) {
  if (rows.length === 0) {
    return { avgRate: 0, atRisk: 0, excellent: 0, totalStudents: 0 }
  }
  const avgRate = Math.round(
    rows.reduce((sum, row) => sum + row.rate, 0) / rows.length,
  )
  const atRisk = rows.filter((row) => row.rate < 80).length
  const excellent = rows.filter((row) => row.rate >= 95).length
  return { avgRate, atRisk, excellent, totalStudents: rows.length }
}

export function findStudentPunctuality(
  studentName: string,
  className: string,
  monthId = punctualityMonths[0]!.id,
): StudentPunctualityRow | undefined {
  return punctualityRows.find(
    (row) =>
      row.monthId === monthId &&
      row.className === className &&
      row.name === studentName,
  )
}

export function getStudentPunctualityPreview(
  fullName: string,
  className: string,
  monthId = punctualityMonths[0]!.id,
): StudentPunctualityRow | undefined {
  const exact = findStudentPunctuality(fullName, className, monthId)
  if (exact) return exact

  const classRow = punctualityRows.find(
    (row) => row.monthId === monthId && row.className === className,
  )
  if (!classRow) return undefined

  return {
    ...classRow,
    studentId: `preview-${className}-${fullName}`,
    name: fullName,
    code: classRow.code,
  }
}
