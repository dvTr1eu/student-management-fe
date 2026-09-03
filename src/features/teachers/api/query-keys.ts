export const teacherKeys = {
  all: ['teachers'] as const,
  lists: () => [...teacherKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...teacherKeys.lists(), params] as const,
  details: () => [...teacherKeys.all, 'detail'] as const,
  detail: (id: string) => [...teacherKeys.details(), id] as const,
  options: (params: Record<string, unknown>) =>
    [...teacherKeys.all, 'options', params] as const,
  meta: (schoolIds: string[]) =>
    [...teacherKeys.all, 'meta', [...schoolIds].sort().join(',')] as const,
}

export const subjectKeys = {
  all: ['subjects'] as const,
  list: () => [...subjectKeys.all, 'list'] as const,
}
