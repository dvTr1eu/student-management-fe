import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const SELECTED_SCHOOL = 'selected-school'

export type School = {
  id: string
  name: string
}

type SchoolState = {
  selectedSchool: School | null
  setSelectedSchool: (school: School) => void
  clearSelectedSchool: () => void
}

function parseSchoolCookie(value: string | undefined): School | null {
  if (!value) return null
  try {
    return JSON.parse(decodeURIComponent(value)) as School
  } catch {
    try {
      return JSON.parse(value) as School
    } catch {
      return null
    }
  }
}

export const useSchoolStore = create<SchoolState>()((set) => ({
  selectedSchool: parseSchoolCookie(getCookie(SELECTED_SCHOOL)),
  setSelectedSchool: (school) => {
    setCookie(SELECTED_SCHOOL, encodeURIComponent(JSON.stringify(school)))
    set({ selectedSchool: school })
  },
  clearSelectedSchool: () => {
    removeCookie(SELECTED_SCHOOL)
    set({ selectedSchool: null })
  },
}))
