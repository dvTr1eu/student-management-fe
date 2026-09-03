import type { AuthUser } from '@/stores/auth-store'

export type AppRole = 'admin' | 'teacher'

export function getUserRoles(user: AuthUser | null | undefined): AppRole[] {
  if (!user?.role?.length) return []
  return user.role.filter(
    (role): role is AppRole => role === 'admin' || role === 'teacher',
  )
}

export function hasRole(
  user: AuthUser | null | undefined,
  role: AppRole,
): boolean {
  return getUserRoles(user).includes(role)
}

export function isAdmin(user: AuthUser | null | undefined): boolean {
  return hasRole(user, 'admin')
}

export function isTeacher(user: AuthUser | null | undefined): boolean {
  return hasRole(user, 'teacher')
}
