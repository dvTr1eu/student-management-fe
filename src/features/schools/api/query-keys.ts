export const schoolKeys = {
  all: ['schools'] as const,
  lists: () => [...schoolKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...schoolKeys.lists(), params] as const,
  details: () => [...schoolKeys.all, 'detail'] as const,
  detail: (id: string) => [...schoolKeys.details(), id] as const,
  active: () => [...schoolKeys.all, 'active'] as const,
}
