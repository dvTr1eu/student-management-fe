export type TeacherStatus = 'active' | 'inactive'

export type TeacherSubjectOption = {
  id: string
  name: string
}

export type ManagedTeacher = {
  id: string
  accountNo: string
  name: string
  email: string
  password: string
  phone: string
  subjectId: string
  subjectName: string
  schoolIds: string[]
  taughtClassIds: string[]
  homeroomClassId?: string
  status: TeacherStatus
}

export const TEACHER_SUBJECTS: TeacherSubjectOption[] = [
  { id: 'math', name: 'Toán' },
  { id: 'physics', name: 'Vật lý' },
  { id: 'chemistry', name: 'Hóa học' },
  { id: 'literature', name: 'Ngữ văn' },
  { id: 'english', name: 'Tiếng Anh' },
]

export const TEACHER_CLASS_OPTIONS = [
  { id: 'c-10a1', name: '10A1' },
  { id: 'c-10a2', name: '10A2' },
  { id: 'c-11a1', name: '11A1' },
] as const
