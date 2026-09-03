import {
  formatDisplayDateFull,
  toIsoDate,
  type AcademicWeek,
  type DayOfWeek,
} from '../data/schema'

/** Monday of the ISO week containing `date`. */
export function getMonday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function getWeekNumber(monday: Date): number {
  const start = new Date(monday.getFullYear(), 0, 1)
  const diff = monday.getTime() - start.getTime()
  return Math.max(1, Math.ceil((diff / 86400000 + start.getDay() + 1) / 7))
}

/** Build Mon–Fri week from a calendar date (client real-time). */
export function buildCalendarWeek(reference: Date): AcademicWeek {
  const monday = getMonday(reference)
  const dates: string[] = []

  for (let i = 0; i < 5; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(toIsoDate(d))
  }

  const weekNumber = getWeekNumber(monday)

  return {
    id: `cal-${dates[0]}`,
    number: weekNumber,
    label: `Tuần ${weekNumber}`,
    startDate: formatDisplayDateFull(dates[0]!),
    endDate: formatDisplayDateFull(dates[4]!),
    dates,
  }
}

export function shiftCalendarWeek(reference: Date, deltaWeeks: number): Date {
  const next = new Date(reference)
  next.setDate(next.getDate() + deltaWeeks * 7)
  return next
}

export function findBeWeekForDate(
  weeks: AcademicWeek[],
  iso: string,
): AcademicWeek | undefined {
  return weeks.find((week) => week.dates.includes(iso))
}

export function resolveDisplayWeek(input: {
  calendarAnchor: Date
  beWeeks: AcademicWeek[]
  selectedWeekId: string | null
}): AcademicWeek {
  if (input.selectedWeekId) {
    const fromBe = input.beWeeks.find((w) => w.id === input.selectedWeekId)
    if (fromBe) return fromBe
  }

  const calendarWeek = buildCalendarWeek(input.calendarAnchor)
  const matched = findBeWeekForDate(input.beWeeks, calendarWeek.dates[0]!)
  return matched ?? calendarWeek
}

export function resolveWeekIdForLessonDate(
  beWeeks: AcademicWeek[],
  lessonDate: string,
): string | null {
  const week = findBeWeekForDate(beWeeks, lessonDate)
  return week?.id ?? null
}

export function dayOfWeekFromIso(iso: string): DayOfWeek {
  const day = new Date(`${iso}T12:00:00`).getDay()
  return Math.max(1, Math.min(5, day)) as DayOfWeek
}

export function isCalendarWeekId(weekId: string): boolean {
  return weekId.startsWith('cal-')
}
