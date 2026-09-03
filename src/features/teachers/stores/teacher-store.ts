import { create } from 'zustand'
import type { ManagedTeacher } from '../data/schema'
import { initialTeachers } from '../data/teachers'

type TeacherStore = {
  teachers: ManagedTeacher[]
  addTeacher: (teacher: ManagedTeacher) => void
  updateTeacher: (id: string, patch: Partial<ManagedTeacher>) => void
  removeTeacher: (id: string) => void
  findByEmail: (email: string) => ManagedTeacher | undefined
}

export const useTeacherStore = create<TeacherStore>()((set, get) => ({
  teachers: initialTeachers.map((item) => ({
    ...item,
    schoolIds: [...item.schoolIds],
    taughtClassIds: [...item.taughtClassIds],
  })),
  addTeacher: (teacher) =>
    set((state) => ({ teachers: [...state.teachers, teacher] })),
  updateTeacher: (id, patch) =>
    set((state) => ({
      teachers: state.teachers.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    })),
  removeTeacher: (id) =>
    set((state) => ({
      teachers: state.teachers.filter((item) => item.id !== id),
    })),
  findByEmail: (email) =>
    get().teachers.find(
      (item) => item.email.toLowerCase() === email.toLowerCase(),
    ),
}))
