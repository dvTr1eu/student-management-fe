import type {
  GradeBookDto,
  GradeMetaClassDto,
  GradeMetaDto,
  GradeMetaSubjectDto,
  GradeOverviewItemDto,
  GradeStudentRowDto,
} from '../api/grades-api'
import type {
  GradeClass,
  GradeStudentRow,
  GradeSubject,
  StudentScores,
  SubjectClassOverview,
} from '../data/schema'

export const GRADES_ACADEMIC_YEARS = ['2025-2026', '2026-2027'] as const

export const GRADES_SEMESTERS = [
  { id: '1' as const, label: 'Học kỳ 1' },
  { id: '2' as const, label: 'Học kỳ 2' },
]

export function formatAcademicYearLabel(year: string): string {
  return year.replace('-', ' - ')
}

/** Normalize URL/search year like "2025 - 2026" → "2025-2026". */
export function normalizeAcademicYear(year?: string | null): string {
  if (!year) return GRADES_ACADEMIC_YEARS[0]
  const compact = year.replace(/\s+/g, '')
  if ((GRADES_ACADEMIC_YEARS as readonly string[]).includes(compact)) {
    return compact
  }
  return GRADES_ACADEMIC_YEARS[0]
}

export function parseSemester(value?: string | null): '1' | '2' {
  return value === '2' ? '2' : '1'
}

export function toSemesterNumber(semester: string): number {
  return semester === '2' ? 2 : 1
}

export function mapGradeClass(dto: GradeMetaClassDto): GradeClass {
  return {
    id: dto.id,
    name: dto.name,
    isHomeroom: dto.isHomeroom,
    subjectIds: dto.subjectIds ?? [],
    taughtSubjectIds: dto.taughtSubjectIds ?? [],
  }
}

export function mapGradeSubject(dto: GradeMetaSubjectDto): GradeSubject {
  return {
    id: dto.id,
    name: dto.name,
  }
}

export function mapGradesMeta(dto: GradeMetaDto): {
  classes: GradeClass[]
  subjects: GradeSubject[]
} {
  return {
    classes: (dto.classes ?? []).map(mapGradeClass),
    subjects: (dto.subjects ?? []).map(mapGradeSubject),
  }
}

function mapScores(dto?: GradeStudentRowDto['scores'] | null): StudentScores {
  return {
    tx1: dto?.tx1 ?? null,
    tx2: dto?.tx2 ?? null,
    tx3: dto?.tx3 ?? null,
    gk: dto?.gk ?? null,
    ck: dto?.ck ?? null,
  }
}

export function mapGradeStudentRow(dto: GradeStudentRowDto): GradeStudentRow {
  return {
    studentId: dto.studentId,
    studentCode: dto.studentCode,
    fullName: dto.fullName,
    scores: mapScores(dto.scores),
    locked: dto.isLocked,
    finalScore: dto.finalScore ?? null,
    status:
      dto.status === 'complete' ||
      dto.status === 'missing' ||
      dto.status === 'empty'
        ? dto.status
        : undefined,
  }
}

export function mapGradeBookRows(book: GradeBookDto): GradeStudentRow[] {
  return (book.students ?? []).map(mapGradeStudentRow)
}

export function mapOverviewItem(
  dto: GradeOverviewItemDto,
): SubjectClassOverview {
  return {
    subjectId: dto.subjectId,
    subjectName: dto.subjectName,
    average: dto.average,
    completeCount: dto.completeCount,
    totalCount: dto.totalCount,
    status: dto.status === 'complete' ? 'complete' : 'missing',
    canEdit: dto.canEdit,
  }
}
