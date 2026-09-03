/** Infer VN school semester from calendar month (rough). */
export function inferSemester(date = new Date()): '1' | '2' {
  const month = date.getMonth() + 1
  // HK2: Jan–May; HK1: Jun–Dec
  return month >= 1 && month <= 5 ? '2' : '1'
}

export function currentMonthId(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function averageOfSubjectAverages(
  averages: Array<number | null | undefined>,
): number | null {
  const values = averages.filter((v): v is number => v != null)
  if (values.length === 0) return null
  const sum = values.reduce((acc, v) => acc + v, 0)
  return Math.round((sum / values.length) * 10) / 10
}
