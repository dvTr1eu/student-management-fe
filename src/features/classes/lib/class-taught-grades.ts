import {
  fetchGradeBook,
  fetchGradesMeta,
  type GradeBookDto,
} from '@/features/grades/api/grades-api'
import { mapGradesMeta, toSemesterNumber } from '@/features/grades/lib/map-grades'
import type { SubjectClassOverview } from '@/features/grades/data/schema'
import { averageOfSubjectAverages } from './class-detail-helpers'

/** Subjects the current user can grade-view for this class (taught; Admin = all). */
export async function resolveClassTaughtSubjectIds(
  schoolId: string,
  academicYear: string,
  classId: string,
): Promise<{ subjectIds: string[]; subjectNames: Map<string, string> }> {
  const meta = mapGradesMeta(await fetchGradesMeta(schoolId, academicYear))
  const clazz = meta.classes.find((item) => item.id === classId)
  const subjectNames = new Map(meta.subjects.map((s) => [s.id, s.name]))

  if (!clazz) {
    return { subjectIds: [], subjectNames }
  }

  // Subject teacher / Admin: taught subjects. GVCN-only with no taught: all class subjects.
  const subjectIds =
    clazz.taughtSubjectIds.length > 0
      ? clazz.taughtSubjectIds
      : clazz.isHomeroom
        ? clazz.subjectIds
        : []

  return { subjectIds, subjectNames }
}

export async function fetchClassTaughtGradeBooks(params: {
  schoolId: string
  academicYear: string
  semester: string
  classId: string
}): Promise<GradeBookDto[]> {
  const { subjectIds } = await resolveClassTaughtSubjectIds(
    params.schoolId,
    params.academicYear,
    params.classId,
  )

  if (subjectIds.length === 0) return []

  const semester = toSemesterNumber(params.semester)
  const results = await Promise.allSettled(
    subjectIds.map((subjectId) =>
      fetchGradeBook({
        schoolId: params.schoolId,
        academicYear: params.academicYear,
        semester,
        classId: params.classId,
        subjectId,
      }),
    ),
  )

  return results
    .filter(
      (result): result is PromiseFulfilledResult<GradeBookDto> =>
        result.status === 'fulfilled',
    )
    .map((result) => result.value)
}

export function mapBooksToSubjectOverview(
  books: GradeBookDto[],
): SubjectClassOverview[] {
  return books.map((book) => {
    const total = book.summary?.totalStudents ?? book.students?.length ?? 0
    const complete = book.summary?.completeCount ?? 0
    return {
      subjectId: book.subjectId,
      subjectName: book.subjectName,
      average: book.summary?.average ?? null,
      completeCount: complete,
      totalCount: total,
      status: total > 0 && complete === total ? 'complete' : 'missing',
      canEdit: book.canEdit,
    }
  })
}

export function subjectAverageFromBooks(books: GradeBookDto[]): {
  average: number | null
  subjectLabel: string | null
} {
  if (books.length === 0) {
    return { average: null, subjectLabel: null }
  }
  if (books.length === 1) {
    const book = books[0]!
    return {
      average: book.summary?.average ?? null,
      subjectLabel: book.subjectName,
    }
  }
  return {
    average: averageOfSubjectAverages(
      books.map((book) => book.summary?.average),
    ),
    subjectLabel: null,
  }
}
