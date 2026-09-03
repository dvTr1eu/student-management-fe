import type { ManagedTeacher } from './schema'

export const initialTeachers: ManagedTeacher[] = [
  {
    id: 'gv-001',
    accountNo: 'GV001',
    name: 'Nguyễn Văn A',
    email: 'teacher@demo.com',
    password: 'password123',
    phone: '0901000001',
    subjectId: 'math',
    subjectName: 'Toán',
    schoolIds: ['school-1', 'school-2'],
    taughtClassIds: ['c-10a1', 'c-10a2', 'c-11a1'],
    homeroomClassId: 'c-10a1',
    status: 'active',
  },
  {
    id: 'gv-002',
    accountNo: 'GV002',
    name: 'Trần Thị B',
    email: 'teacher2@demo.com',
    password: 'password123',
    phone: '0901000002',
    subjectId: 'math',
    subjectName: 'Toán',
    schoolIds: ['school-2', 'school-3'],
    taughtClassIds: ['c-10a2', 'c-11a1'],
    status: 'active',
  },
]
