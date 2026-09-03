export const classKeys = {
  all: ['classes'] as const,
  lists: () => [...classKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...classKeys.lists(), params] as const,
  /** Used by Students screen (all active classes in school). */
  bySchool: (schoolId: string) =>
    [...classKeys.all, 'by-school', schoolId] as const,
  details: () => [...classKeys.all, 'detail'] as const,
  detail: (id: string, schoolId: string) =>
    [...classKeys.details(), id, schoolId] as const,
}
