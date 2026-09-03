export const scheduleKeys = {
  all: ['schedule'] as const,
  weeks: (schoolId: string, academicYear: string) =>
    [...scheduleKeys.all, 'weeks', schoolId, academicYear] as const,
  currentWeek: (schoolId: string, academicYear: string) =>
    [...scheduleKeys.all, 'current-week', schoolId, academicYear] as const,
  periods: (schoolId: string) =>
    [...scheduleKeys.all, 'periods', schoolId] as const,
  meta: (schoolId: string, academicYear: string) =>
    [...scheduleKeys.all, 'meta', schoolId, academicYear] as const,
  lessons: (params: Record<string, unknown>) =>
    [...scheduleKeys.all, 'lessons', params] as const,
  lessonDetail: (id: string, schoolId: string) =>
    [...scheduleKeys.all, 'lesson', id, schoolId] as const,
}
