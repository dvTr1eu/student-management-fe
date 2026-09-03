export const gradesKeys = {
  all: ['grades'] as const,
  meta: (schoolId: string, academicYear: string) =>
    [...gradesKeys.all, 'meta', schoolId, academicYear] as const,
  overview: (params: {
    schoolId: string
    academicYear: string
    semester: number
    classId: string
  }) => [...gradesKeys.all, 'overview', params] as const,
  book: (params: {
    schoolId: string
    academicYear: string
    semester: number
    classId: string
    subjectId: string
  }) => [...gradesKeys.all, 'book', params] as const,
}
