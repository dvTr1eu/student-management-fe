import { create } from 'zustand'
import { getCookie, setCookie } from '@/lib/cookies'
import {
  DEFAULT_PERIODS,
  type PeriodDefinition,
  type SessionType,
} from '../data/schema'

const PERIODS_COOKIE = 'school-periods'

type PeriodsBySchool = Record<string, PeriodDefinition[]>

type PeriodStore = {
  bySchool: PeriodsBySchool
  getPeriods: (schoolId: string) => PeriodDefinition[]
  setPeriods: (schoolId: string, periods: PeriodDefinition[]) => void
  upsertPeriod: (schoolId: string, period: PeriodDefinition) => void
  removePeriod: (schoolId: string, periodId: string) => void
  resetPeriods: (schoolId: string) => void
}

function cloneDefaults(): PeriodDefinition[] {
  return DEFAULT_PERIODS.map((item) => ({ ...item }))
}

function loadFromCookie(): PeriodsBySchool {
  const raw = getCookie(PERIODS_COOKIE)
  if (!raw) return {}
  try {
    const decoded = decodeURIComponent(raw)
    return JSON.parse(decoded) as PeriodsBySchool
  } catch {
    try {
      return JSON.parse(raw) as PeriodsBySchool
    } catch {
      return {}
    }
  }
}

function persist(bySchool: PeriodsBySchool) {
  setCookie(PERIODS_COOKIE, encodeURIComponent(JSON.stringify(bySchool)))
}

function sortPeriods(periods: PeriodDefinition[]) {
  const sessionOrder: Record<SessionType, number> = {
    morning: 0,
    afternoon: 1,
  }
  return [...periods].sort(
    (a, b) =>
      sessionOrder[a.session] - sessionOrder[b.session] ||
      a.period - b.period,
  )
}

export const usePeriodStore = create<PeriodStore>()((set, get) => ({
  bySchool: loadFromCookie(),
  getPeriods: (schoolId) => {
    const key = schoolId || 'default'
    const existing = get().bySchool[key]
    if (existing?.length) return sortPeriods(existing)
    return cloneDefaults()
  },
  setPeriods: (schoolId, periods) => {
    const key = schoolId || 'default'
    set((state) => {
      const bySchool = {
        ...state.bySchool,
        [key]: sortPeriods(periods),
      }
      persist(bySchool)
      return { bySchool }
    })
  },
  upsertPeriod: (schoolId, period) => {
    const key = schoolId || 'default'
    const current = get().getPeriods(key)
    const index = current.findIndex((item) => item.id === period.id)
    const next =
      index >= 0
        ? current.map((item) => (item.id === period.id ? period : item))
        : [...current, period]
    get().setPeriods(key, next)
  },
  removePeriod: (schoolId, periodId) => {
    const key = schoolId || 'default'
    const next = get()
      .getPeriods(key)
      .filter((item) => item.id !== periodId)
    get().setPeriods(key, next)
  },
  resetPeriods: (schoolId) => {
    get().setPeriods(schoolId || 'default', cloneDefaults())
  },
}))
