import { useTeacherStore } from '@/features/teachers/stores/teacher-store'
import type { MockAccount, MockAccountRole } from './mock-accounts'
import { MOCK_ACCOUNTS } from './mock-accounts'

export type { MockAccount, MockAccountRole }
export { MOCK_ACCOUNTS }

/** Admin vẫn nằm trong MOCK_ACCOUNTS; giáo viên lấy từ teacher store (CRUD). */
export function findMockAccount(
  email: string,
  password: string,
  role: MockAccountRole,
): MockAccount | undefined {
  if (role === 'admin') {
    return MOCK_ACCOUNTS.find(
      (account) =>
        account.role === 'admin' &&
        account.email.toLowerCase() === email.toLowerCase() &&
        account.password === password,
    )
  }

  const teacher = useTeacherStore.getState().teachers.find(
    (item) =>
      item.email.toLowerCase() === email.toLowerCase() &&
      item.password === password &&
      item.status === 'active',
  )

  if (!teacher) return undefined

  return {
    accountNo: teacher.accountNo,
    email: teacher.email,
    password: teacher.password,
    name: teacher.name,
    role: 'teacher',
    schoolIds: teacher.schoolIds,
  }
}

/** Khôi phục account từ mock token `mock-token-{accountNo}` sau reload. */
export function findAccountByToken(token: string): MockAccount | undefined {
  const prefix = 'mock-token-'
  if (!token.startsWith(prefix)) return undefined
  const accountNo = token.slice(prefix.length)

  const admin = MOCK_ACCOUNTS.find((item) => item.accountNo === accountNo)
  if (admin) return admin

  const teacher = useTeacherStore
    .getState()
    .teachers.find((item) => item.accountNo === accountNo && item.status === 'active')

  if (!teacher) return undefined

  return {
    accountNo: teacher.accountNo,
    email: teacher.email,
    password: teacher.password,
    name: teacher.name,
    role: 'teacher',
    schoolIds: teacher.schoolIds,
  }
}
