import type {
  TeacherListItemDto,
  TeacherSchoolAssignmentDto,
} from '../api/teachers-api'
import type { ManagedTeacher, TeacherStatus } from '../data/schema'

export function toFeTeacherStatus(value?: string | null): TeacherStatus {
  return value?.toLowerCase() === 'inactive' ? 'inactive' : 'active'
}

export function toApiTeacherStatus(
  value: TeacherStatus,
): 'Active' | 'Inactive' {
  return value === 'inactive' ? 'Inactive' : 'Active'
}

export type TeacherSchoolAssignment = TeacherSchoolAssignmentDto

export type TeacherRow = Omit<ManagedTeacher, 'password'> & {
  schools: TeacherSchoolAssignment[]
}

function flatIdsFromSchools(schools: TeacherSchoolAssignmentDto[]) {
  const schoolIds = schools.map((item) => item.schoolId)
  const taughtClassIds = schools.flatMap((item) =>
    item.taughtClasses.map((c) => c.id),
  )
  const homeroom = schools.find((item) => item.homeroomClass)?.homeroomClass

  return {
    schoolIds,
    taughtClassIds,
    homeroomClassId: homeroom?.id,
    homeroomClassName: homeroom?.name ?? null,
  }
}

export function mapTeacherListItem(dto: TeacherListItemDto): TeacherRow {
  const schools = dto.schools ?? []
  const flat = flatIdsFromSchools(schools)

  return {
    id: dto.id,
    accountNo: dto.accountNo,
    name: dto.name,
    email: dto.email,
    phone: dto.phone?.trim() || '',
    subjectId: dto.subjectId ?? '',
    subjectName: dto.subjectName ?? '—',
    schools,
    schoolIds: flat.schoolIds.length > 0 ? flat.schoolIds : (dto.schoolIds ?? []),
    taughtClassIds:
      flat.taughtClassIds.length > 0
        ? flat.taughtClassIds
        : (dto.taughtClassIds ?? []),
    homeroomClassId:
      flat.homeroomClassId ?? dto.homeroomClassId ?? undefined,
    status: toFeTeacherStatus(dto.status),
  }
}
