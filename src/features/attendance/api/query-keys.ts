export const attendanceKeys = {
  all: ['attendance'] as const,
  lessons: (params: Record<string, unknown>) =>
    [...attendanceKeys.all, 'lessons', params] as const,
  lessonAttendance: (lessonId: string, schoolId: string) =>
    [...attendanceKeys.all, 'lesson', lessonId, schoolId] as const,
  classPunctuality: (
    classId: string,
    schoolId: string,
    month: string,
    teacherScope: boolean,
  ) =>
    [
      ...attendanceKeys.all,
      'class-punctuality',
      classId,
      schoolId,
      month,
      teacherScope,
    ] as const,
}
