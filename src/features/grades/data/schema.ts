import { z } from 'zod'

export const academicYearSchema = z.string()
export const semesterSchema = z.enum(['1', '2'])
export const gradeTabSchema = z.enum(['scores', 'summary', 'stats'])
export const statusFilterSchema = z.enum([
  'all',
  'complete',
  'missing',
  'empty',
])

export const scoreColumnSchema = z.enum([
  'tx1',
  'tx2',
  'tx3',
  'gk',
  'ck',
])

export type ScoreColumn = z.infer<typeof scoreColumnSchema>
export type GradeTab = z.infer<typeof gradeTabSchema>
export type StatusFilter = z.infer<typeof statusFilterSchema>
export type Semester = z.infer<typeof semesterSchema>

export type GradeClass = {
  id: string
  name: string
  /** Homeroom teacher can view all subjects for this class */
  isHomeroom: boolean
  /** All subjects in the class (overview for GVCN) */
  subjectIds: string[]
  /** Subjects this teacher teaches — only these can be edited */
  taughtSubjectIds: string[]
}

export type GradeSubject = {
  id: string
  name: string
}

export type StudentScores = {
  tx1: number | null
  tx2: number | null
  tx3: number | null
  gk: number | null
  ck: number | null
}

export type GradeStudentRow = {
  studentId: string
  studentCode: string
  fullName: string
  scores: StudentScores
  locked?: boolean
  /** From API when available; otherwise compute client-side */
  finalScore?: number | null
  status?: 'complete' | 'missing' | 'empty'
}

export type SubjectClassOverview = {
  subjectId: string
  subjectName: string
  average: number | null
  completeCount: number
  totalCount: number
  status: 'complete' | 'missing'
  /** Current teacher can enter scores for this subject */
  canEdit: boolean
}

export function canEditSubject(
  gradeClass: GradeClass | undefined,
  subjectId: string,
): boolean {
  if (!gradeClass || !subjectId) return false
  return gradeClass.taughtSubjectIds.includes(subjectId)
}

export const SCORE_COLUMNS: { id: ScoreColumn; label: string }[] = [
  { id: 'tx1', label: 'TX1' },
  { id: 'tx2', label: 'TX2' },
  { id: 'tx3', label: 'TX3' },
  { id: 'gk', label: 'GK' },
  { id: 'ck', label: 'CK' },
]

/** (TB TX × 1 + GK × 2 + CK × 3) / 6 — chỉ tính khi đủ điểm */
export function computeFinalScore(scores: StudentScores): number | null {
  const { tx1, tx2, tx3, gk, ck } = scores
  if ([tx1, tx2, tx3, gk, ck].some((v) => v == null)) return null
  const txAvg = (tx1! + tx2! + tx3!) / 3
  return Math.round(((txAvg * 1 + gk! * 2 + ck! * 3) / 6) * 10) / 10
}

export function isScoreComplete(scores: StudentScores): boolean {
  return computeFinalScore(scores) != null
}

export function hasAnyScore(scores: StudentScores): boolean {
  return Object.values(scores).some((v) => v != null)
}

export function getRowStatus(
  scores: StudentScores,
): 'complete' | 'missing' | 'empty' {
  if (isScoreComplete(scores)) return 'complete'
  if (!hasAnyScore(scores)) return 'empty'
  return 'missing'
}
