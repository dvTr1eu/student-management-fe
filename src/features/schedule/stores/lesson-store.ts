import { create } from 'zustand'
import type { ScheduleLesson } from '../data/schema'
import { scheduleLessons } from '../data/schedule'

type LessonStore = {
  lessons: ScheduleLesson[]
  addLesson: (lesson: ScheduleLesson) => void
  updateLesson: (id: string, patch: Partial<ScheduleLesson>) => void
  removeLesson: (id: string) => void
}

export const useLessonStore = create<LessonStore>()((set) => ({
  lessons: scheduleLessons.map((item) => ({ ...item })),
  addLesson: (lesson) =>
    set((state) => ({ lessons: [...state.lessons, lesson] })),
  updateLesson: (id, patch) =>
    set((state) => ({
      lessons: state.lessons.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    })),
  removeLesson: (id) =>
    set((state) => ({
      lessons: state.lessons.filter((item) => item.id !== id),
    })),
}))
