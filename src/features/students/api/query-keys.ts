export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...studentKeys.lists(), params] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: string, schoolId: string) =>
    [...studentKeys.details(), id, schoolId] as const,
  punctuality: (id: string, schoolId: string, month: string) =>
    [...studentKeys.all, 'punctuality', id, schoolId, month] as const,
}

