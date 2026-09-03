import { create } from 'zustand'
import type { School } from '@/stores/school-store'
import { initialSchools, type ManagedSchool } from '../data/schema'

type SchoolCatalogStore = {
  schools: ManagedSchool[]
  addSchool: (school: ManagedSchool) => void
  updateSchool: (id: string, patch: Partial<ManagedSchool>) => void
  removeSchool: (id: string) => void
  getActiveSchools: () => School[]
  getSchoolName: (schoolId: string) => string
}

export const useSchoolCatalogStore = create<SchoolCatalogStore>()((set, get) => ({
  schools: initialSchools.map((item) => ({ ...item })),
  addSchool: (school) =>
    set((state) => ({ schools: [...state.schools, school] })),
  updateSchool: (id, patch) =>
    set((state) => ({
      schools: state.schools.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    })),
  removeSchool: (id) =>
    set((state) => ({
      schools: state.schools.filter((item) => item.id !== id),
    })),
  getActiveSchools: () =>
    get()
      .schools.filter((item) => item.status === 'active')
      .map(({ id, name }) => ({ id, name })),
  getSchoolName: (schoolId) =>
    get().schools.find((item) => item.id === schoolId)?.name ?? schoolId,
}))
