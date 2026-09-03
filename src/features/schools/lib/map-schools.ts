import type { SchoolListItemDto } from '../api/schools-api'
import type { ManagedSchool, SchoolStatus } from '../data/schema'

export function toFeSchoolStatus(value?: string | null): SchoolStatus {
  return value?.toLowerCase() === 'inactive' ? 'inactive' : 'active'
}

export function toApiSchoolStatus(
  value: SchoolStatus,
): 'Active' | 'Inactive' {
  return value === 'inactive' ? 'Inactive' : 'Active'
}

export type SchoolRow = ManagedSchool & {
  teacherCount: number
}

export function mapSchoolListItem(dto: SchoolListItemDto): SchoolRow {
  return {
    id: dto.id,
    name: dto.name,
    code: dto.code,
    address: dto.address ?? '',
    status: toFeSchoolStatus(dto.status),
    teacherCount: dto.teacherCount ?? 0,
  }
}
