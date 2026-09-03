import type { ClassListItem } from '../api/classes-api'

/** UI class model — mapped from API ClassListItem. */
export type Class = {
  id: string
  schoolId: string
  name: string
  grade: string
  academicYear: string
  status: string
  studentCount: number
  isHomeroom: boolean
  homeroomTeacherId: string
  homeroomTeacher: string
  weeklyPeriods: number
  subject: string
}

export function mapClassItem(dto: ClassListItem): Class {
  return {
    id: dto.id,
    schoolId: dto.schoolId,
    name: dto.name,
    grade: dto.grade,
    academicYear: dto.academicYear,
    status: dto.status,
    studentCount: dto.studentCount,
    isHomeroom: dto.isHomeroom,
    homeroomTeacherId: dto.homeroomTeacherId ?? '',
    homeroomTeacher: dto.homeroomTeacherName?.trim() || 'Chưa có GVCN',
    weeklyPeriods: dto.weeklyPeriods,
    subject: dto.primarySubjectName?.trim() || '—',
  }
}
