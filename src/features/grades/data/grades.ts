import type {
  GradeClass,
  GradeStudentRow,
  GradeSubject,
  StudentScores,
  SubjectClassOverview,
} from './schema'
import { computeFinalScore, isScoreComplete, canEditSubject } from './schema'

export const academicYears = ['2025 - 2026', '2026 - 2027'] as const

export const semesters = [
  { id: '1' as const, label: 'Học kỳ 1' },
  { id: '2' as const, label: 'Học kỳ 2' },
]

export const gradeSubjects: GradeSubject[] = [
  { id: 'math', name: 'Toán' },
  { id: 'literature', name: 'Ngữ văn' },
  { id: 'english', name: 'Tiếng Anh' },
  { id: 'physics', name: 'Vật lý' },
  { id: 'chemistry', name: 'Hóa học' },
  { id: 'biology', name: 'Sinh học' },
  { id: 'history', name: 'Lịch sử' },
  { id: 'geography', name: 'Địa lý' },
]

/** Mock: GVCN 10A1, trực tiếp dạy Toán — các môn khác chỉ xem */
export const gradeClasses: GradeClass[] = [
  {
    id: 'c-10a1',
    name: '10A1',
    isHomeroom: true,
    subjectIds: [
      'math',
      'literature',
      'english',
      'physics',
      'chemistry',
      'biology',
      'history',
      'geography',
    ],
    taughtSubjectIds: ['math'],
  },
  {
    id: 'c-10a2',
    name: '10A2',
    isHomeroom: false,
    subjectIds: ['math'],
    taughtSubjectIds: ['math'],
  },
  {
    id: 'c-11a1',
    name: '11A1',
    isHomeroom: false,
    subjectIds: ['math', 'physics'],
    taughtSubjectIds: ['math', 'physics'],
  },
]

function scores(
  tx1: number | null,
  tx2: number | null,
  tx3: number | null,
  gk: number | null,
  ck: number | null,
): StudentScores {
  return { tx1, tx2, tx3, gk, ck }
}

const students10A1: Omit<GradeStudentRow, 'scores'>[] = [
  { studentId: 's1', studentCode: 'HS001', fullName: 'Nguyễn Văn An' },
  { studentId: 's2', studentCode: 'HS002', fullName: 'Trần Minh Bình' },
  { studentId: 's3', studentCode: 'HS003', fullName: 'Lê Hoàng Cường' },
  { studentId: 's4', studentCode: 'HS004', fullName: 'Phạm Thu Dung' },
  { studentId: 's5', studentCode: 'HS005', fullName: 'Hoàng Đức Em' },
  { studentId: 's6', studentCode: 'HS006', fullName: 'Vũ Thị Phương' },
  { studentId: 's7', studentCode: 'HS007', fullName: 'Đặng Quốc Giang' },
  { studentId: 's8', studentCode: 'HS008', fullName: 'Bùi Thanh Hà' },
]

const mathScores10A1: StudentScores[] = [
  scores(8, 9, 7.5, 8, 9),
  scores(7, 8, 8.5, 7, 8),
  scores(9, null, 7, 8, null),
  scores(8.5, 8, 9, 8.5, 9),
  scores(6, 7, 6.5, 7, 6.5),
  scores(null, null, null, null, null),
  scores(8, 8.5, 9, 8, 8.5),
  scores(7.5, 7, null, 7.5, 8),
]

function buildRows(
  base: Omit<GradeStudentRow, 'scores'>[],
  scoreList: StudentScores[],
): GradeStudentRow[] {
  return base.map((student, index) => ({
    ...student,
    scores: { ...scoreList[index]! },
  }))
}

/** Key: `${year}|${semester}|${classId}|${subjectId}` */
const gradeBook: Record<string, GradeStudentRow[]> = {
  '2026 - 2027|1|c-10a1|math': buildRows(students10A1, mathScores10A1),
  '2026 - 2027|1|c-10a1|literature': buildRows(students10A1, [
    scores(7.5, 8, 7, 7.5, 8),
    scores(8, 7.5, 8, 8, 7.5),
    scores(7, 7, 6.5, null, null),
    scores(8, 8.5, 8, 8, 8.5),
    scores(6.5, 7, 7, 6.5, 7),
    scores(7, 7.5, 7, 7, 7.5),
    scores(8.5, 8, 9, 8.5, 9),
    scores(7, null, 7.5, 7, 8),
  ]),
  '2026 - 2027|1|c-10a1|english': buildRows(students10A1, [
    scores(8, 8.5, 9, 8, 9),
    scores(7.5, 8, 8, 7.5, 8),
    scores(9, 8.5, 9, 9, 8.5),
    scores(8, 8, 8.5, 8, 8),
    scores(7, 7.5, 7, 7, 7.5),
    scores(8.5, 9, 8, 8.5, 9),
    scores(8, 8, 8, 8, 8),
    scores(7.5, 8, 7.5, 8, 8),
  ]),
  '2026 - 2027|1|c-10a1|physics': buildRows(students10A1, [
    scores(7, 7.5, 8, 7, 8),
    scores(8, 8, 7.5, 8, 7.5),
    scores(6.5, 7, null, 7, null),
    scores(7.5, 8, 8, 7.5, 8),
    scores(null, 6, 6.5, 6, 6.5),
    scores(7, 7, 7.5, 7, 7),
    scores(8, 8.5, 8, 8, 8.5),
    scores(7.5, 7, 7, 7.5, 7),
  ]),
  '2026 - 2027|1|c-10a2|math': [
    {
      studentId: 's9',
      studentCode: 'HS009',
      fullName: 'Ngô Văn Khoa',
      scores: scores(8, 8, 8.5, 8, 9),
    },
    {
      studentId: 's10',
      studentCode: 'HS010',
      fullName: 'Lý Thị Lan',
      scores: scores(7, null, 7.5, 7, 8),
    },
    {
      studentId: 's11',
      studentCode: 'HS011',
      fullName: 'Trịnh Đức Mạnh',
      scores: scores(9, 9, 8.5, 9, 9),
    },
  ],
  '2026 - 2027|1|c-11a1|math': [
    {
      studentId: 's12',
      studentCode: 'HS012',
      fullName: 'Đỗ Hải Nam',
      scores: scores(8.5, 8, 9, 8.5, 9),
    },
    {
      studentId: 's13',
      studentCode: 'HS013',
      fullName: 'Mai Anh Thư',
      scores: scores(7, 7.5, 8, 7.5, 8),
    },
  ],
}

function bookKey(
  year: string,
  semester: string,
  classId: string,
  subjectId: string,
) {
  return `${year}|${semester}|${classId}|${subjectId}`
}

export function getGradeRows(
  year: string,
  semester: string,
  classId: string,
  subjectId: string,
): GradeStudentRow[] {
  const rows = gradeBook[bookKey(year, semester, classId, subjectId)]
  if (!rows) return []
  return rows.map((row) => ({
    ...row,
    scores: { ...row.scores },
  }))
}

export function getClassOverview(
  year: string,
  semester: string,
  classId: string,
): SubjectClassOverview[] {
  const gradeClass = gradeClasses.find((item) => item.id === classId)
  if (!gradeClass) return []

  return gradeClass.subjectIds.map((subjectId) => {
    const subject = gradeSubjects.find((item) => item.id === subjectId)!
    const rows = getGradeRows(year, semester, classId, subjectId)
    const completeCount = rows.filter((row) =>
      isScoreComplete(row.scores),
    ).length
    const finals = rows
      .map((row) => computeFinalScore(row.scores))
      .filter((v): v is number => v != null)
    const average =
      finals.length > 0
        ? Math.round(
            (finals.reduce((sum, v) => sum + v, 0) / finals.length) * 10,
          ) / 10
        : null

    return {
      subjectId,
      subjectName: subject.name,
      average,
      completeCount,
      totalCount: rows.length || students10A1.length,
      status:
        completeCount === (rows.length || students10A1.length) && rows.length > 0
          ? 'complete'
          : 'missing',
      canEdit: canEditSubject(gradeClass, subjectId),
    }
  })
}

export function updateGradeBookScore(
  year: string,
  semester: string,
  classId: string,
  subjectId: string,
  studentId: string,
  column: keyof StudentScores,
  value: number | null,
) {
  const gradeClass = gradeClasses.find((item) => item.id === classId)
  if (!canEditSubject(gradeClass, subjectId)) return

  const key = bookKey(year, semester, classId, subjectId)
  const rows = gradeBook[key]
  if (!rows) return
  const row = rows.find((item) => item.studentId === studentId)
  if (!row || row.locked) return
  row.scores[column] = value
}
