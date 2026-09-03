import { MOCK_ACCOUNTS } from '@/features/auth/data/mock-accounts'
import { useSchoolCatalogStore } from '@/features/schools/stores/school-catalog-store'
import { useTeacherStore } from '@/features/teachers/stores/teacher-store'
import type { School } from '@/stores/school-store'

/** Trường được gán cho user đăng nhập. Admin = tất cả trường đang hoạt động. */
export function getTeacherSchools(teacherEmail?: string): School[] {
  const allActive = useSchoolCatalogStore.getState().getActiveSchools()
  if (!teacherEmail) return allActive

  const admin = MOCK_ACCOUNTS.find(
    (item) =>
      item.role === 'admin' &&
      item.email.toLowerCase() === teacherEmail.toLowerCase(),
  )
  if (admin) return allActive

  const teacher = useTeacherStore
    .getState()
    .teachers.find(
      (item) => item.email.toLowerCase() === teacherEmail.toLowerCase(),
    )

  if (!teacher || teacher.schoolIds.length === 0) return allActive

  return allActive.filter((school) => teacher.schoolIds.includes(school.id))
}
