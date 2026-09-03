import type { DayOfWeek, SessionType } from '../data/schema'

export type EmptySlotContext = {
  weekId: string
  academicYear: string
  date: string
  dayOfWeek: DayOfWeek
  dayLabel: string
  session: SessionType
  period: number
  startTime: string
  endTime: string
}
