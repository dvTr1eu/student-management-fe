import type { ClassListItem } from '@/features/classes/api/classes-api'

/** Prefer homeroom class, otherwise first class in the list. */
export function pickDefaultStudentClassId(
  classes: ClassListItem[],
): string {
  return classes.find((item) => item.isHomeroom)?.id ?? classes[0]?.id ?? ''
}
