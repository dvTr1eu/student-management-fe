import type { School } from '@/stores/school-store'
import { useSchoolCatalogStore } from '@/features/schools/stores/school-catalog-store'

/** @deprecated Ưu tiên dùng useSchoolCatalogStore — giữ để tương thích import cũ */
export function getAllSchools(): School[] {
  return useSchoolCatalogStore.getState().getActiveSchools()
}

export function getSchoolName(schoolId: string): string {
  return useSchoolCatalogStore.getState().getSchoolName(schoolId)
}

/** Snapshot ban đầu (không reactive). Dùng store khi cần live list. */
export const ALL_SCHOOLS: School[] = [
  { id: 'school-1', name: 'THPT Phúc Thịnh' },
  { id: 'school-2', name: 'Cao đẳng Long Biên' },
  { id: 'school-3', name: 'Trung cấp Bách Khoa' },
]
